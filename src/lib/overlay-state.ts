import {
    ConstraintViolationCallback,
    InsetId,
    InsetRecord,
    OverlayCreationRecord,
    OverlayId,
    OverlayLayoutStore,
    OverlayPosition,
    OverlayRecord,
    OverlaySideInsetStore,
    OverlayStore,
    PositionConstraintMaxItems,
    PositionConstraints,
    ResponsiveConstraints,
    ResponsiveRules,
    ViolationReactionType,
} from '../types';
import {
    applyInsets,
    getConfigForMatchMedia,
    getInsets,
    getNewInsetStore,
    getNewLayoutStore,
    getNewOverlayStore,
    getNOldestOverlays,
    removeOverlayFromList,
} from './layout';
import { BASE_LAYOUT, noop } from '../constants';
import { OverlayDom } from './overlay-dom';
import { createScheduledFunction } from './scheduler';
import { insertAtCorrectPosition } from './dom';

export class OverlayState {
    private creationCounter: number;
    private layoutStore: OverlayLayoutStore;
    private insetStore: OverlaySideInsetStore;
    private overlayStore: OverlayStore;
    private overlayDom: OverlayDom;

    constructor(
        private readonly rootId: string,
        private readonly responsiveRules: ResponsiveRules,
        private readonly onConstraintViolation: ConstraintViolationCallback,
        private readonly baseLayout: string = BASE_LAYOUT,
        private readonly baseTagName: keyof HTMLElementTagNameMap = 'div',
    ) {
        this.responsiveRules = responsiveRules;
        this.rootId = rootId;
        this.onConstraintViolation = onConstraintViolation;
        this.baseLayout = baseLayout;
        this.baseTagName = baseTagName;

        this.creationCounter = 0;
        this.layoutStore = getNewLayoutStore();
        this.insetStore = getNewInsetStore();
        this.overlayStore = getNewOverlayStore();
        this.overlayDom = new OverlayDom(
            this.rootId,
            this.baseLayout,
            this.baseTagName,
        );
    }

    public reset() {
        this.creationCounter = 0;
        this.layoutStore = getNewLayoutStore();
        this.insetStore = getNewInsetStore();
        this.overlayStore = getNewOverlayStore();
        this.overlayDom.createNewRootElement();
    }

    public setInset(inset: InsetRecord) {
        this.insetStore.set(inset.id, inset);
        this.recalculateInsets();
    }

    public removeInset(id: InsetId) {
        this.insetStore.delete(id);
        this.recalculateInsets();
    }

    public getOverlay(id: OverlayId): OverlayRecord | null {
        return this.overlayStore.get(id) || null;
    }

    public registerOverlay(overlay: OverlayCreationRecord): HTMLElement {
        const existingOverlay = this.getOverlay(overlay.id);

        if (existingOverlay) {
            return existingOverlay.element;
        }

        /**
         * Each overlay is rendered into its own portal, this gives us the
         * flexibility to stay in react world but also to be able to render
         * an overlay from wherever we want to in our application.
         *
         * This portal needs a dom element to render into. Here is where we create
         * that dom element. We will keep a reference to this element and then
         * move it into another container for the purposes of styling and to keep
         * the DOM neat
         */
        const portalContainerForOverlay =
            this.overlayDom.createNewElementForOverlay(overlay.id);

        const overlayRecord: OverlayRecord = {
            ...overlay,
            element: portalContainerForOverlay,
            createdAt: this.getCreationOrderValue(),
            position: {
                original: overlay.position,
                current: null,
                desired: null,
            },
        };

        this.overlayStore.set(overlay.id, overlayRecord);

        return portalContainerForOverlay;
    }

    public unregisterOverlay(id: OverlayId) {
        const overlay = this.getOverlay(id);

        if (!overlay) {
            return;
        }

        if (overlay.position.current) {
            const currentOverlaysInPosition = this.layoutStore.get(
                overlay.position.current,
            );

            if (!currentOverlaysInPosition) {
                return;
            }

            const newOverlayList = removeOverlayFromList(
                id,
                currentOverlaysInPosition,
                this.overlayStore,
            );

            this.layoutStore.set(overlay.position.current, newOverlayList);
        }

        this.overlayStore.delete(id);
    }

    public removeOverlay(id: OverlayId): Promise<void> {
        const overlay = this.getOverlay(id);

        if (!overlay || !overlay.position.current) {
            return Promise.resolve();
        }

        return this.overlayDom.animateElementOut(
            overlay.element,
            overlay.position.current,
            0,
        );
    }

    public updateOverlay({ id, ...newRecord }: OverlayCreationRecord) {
        const overlay = this.getOverlay(id);

        if (!overlay) {
            return;
        }

        overlay.priority = newRecord.priority;
        overlay.onRemovedAfterConstraintViolation =
            newRecord.onRemovedAfterConstraintViolation || noop;
        overlay.position.desired = newRecord.position;
        overlay.position.original = newRecord.position;

        this.recalculateLayout();
    }

    public setOverlayReady(id: OverlayId) {
        const overlay = this.getOverlay(id);

        if (!overlay) {
            return;
        }

        this.recalculateLayout();

        if (!overlay.hideAfterMs) {
            return;
        }

        setTimeout(() => {
            this.removeOverlay(id);
        }, overlay.hideAfterMs);
    }

    public recalculateLayout = createScheduledFunction(() => {
        let inCount = 0;
        let outCount = 0;

        const animationPromises: Array<Promise<void>> = [];

        this.layoutStore = this.overlayDom.putOverlaysInContainers(
            this.overlayStore,
            this.responsiveRules,
            (id, position) => {
                const overlay = this.overlayStore.get(id);

                if (!overlay) {
                    return;
                }

                overlay.position.desired = position;

                if (overlay.position.current === null) {
                    this.overlayDom.addElementAtPosition(
                        position,
                        overlay.element,
                    );
                }

                const mountPointChanged =
                    overlay.position.current !== overlay.position.desired;

                /**
                 * Element was not moved but we need to append it to make sure
                 * the order is correct
                 */
                if (!mountPointChanged) {
                    this.overlayDom.addElementAtPosition(
                        position,
                        overlay.element,
                    );
                    return;
                }

                /**
                 * Animate an element in that has not been added
                 * to the dom yet
                 */
                if (overlay.position.current === null) {
                    inCount++;

                    const animateInPromise = this.overlayDom
                        .animateElementIn(
                            overlay.element,
                            position,
                            inCount * 20,
                        )
                        .then(() => {
                            overlay.position.current = position;
                        });

                    animationPromises.push(animateInPromise);
                    return;
                }

                /**
                 * Animate an element in that needs to be moved
                 * from one container to another
                 */

                const outInAnimation = this.overlayDom
                    .animateElementOut(overlay.element, position, outCount * 20)
                    .then(() => {
                        overlay.position.current = position;

                        const container =
                            this.overlayDom.getContainerForPosition(position);

                        if (!container) {
                            return;
                        }

                        insertAtCorrectPosition(
                            overlay.id,
                            container,
                            overlay.element,
                            this.layoutStore.get(position) || [],
                        );

                        return this.overlayDom.animateElementIn(
                            overlay.element,
                            position,
                            inCount * 20,
                        );
                    });

                animationPromises.push(outInAnimation);

                inCount++;
                outCount++;
            },
        );

        return Promise.all([...animationPromises, this.evaluateConstraints()]);
    }, 500);

    public recalculateInsets = createScheduledFunction(() => {
        const { container } = this.overlayDom.getContainers();

        if (container) {
            const newInsets = getInsets(this.insetStore);
            applyInsets(container, newInsets);
        }

        return Promise.resolve();
    }, 300);

    private evaluateConstraints(): Promise<any> {
        return Promise.all(
            Object.values(OverlayPosition).reduce((acc, pos) => {
                const rConf = this.responsiveRules[pos];

                if (!rConf) {
                    return acc;
                }

                const matchingConf = getConfigForMatchMedia(rConf);

                if (!matchingConf) {
                    return acc;
                }

                const { container } = this.overlayDom.getContainers();

                if (!container) {
                    return acc;
                }

                return [
                    ...acc,
                    ...this.evaluateConstraintsForPosition(
                        pos,
                        matchingConf.constraints,
                    ),
                ];
            }, [] as Array<Promise<any>>),
        );
    }

    private evaluateConstraintsForPosition(
        position: OverlayPosition,
        constraints: ResponsiveConstraints['constraints'],
    ): Array<Promise<void>> {
        if (!constraints) {
            return [];
        }

        const promises: Array<Promise<void>> = [];

        for (let i = 0; i < constraints.length; i++) {
            const constraint = constraints[i];

            switch (constraint.type) {
                case PositionConstraints.MAX_ITEMS:
                    promises.push(
                        ...this.handleMaxItemsConstraint(constraint, position),
                    );
            }
        }

        return promises;
    }

    private getCreationOrderValue() {
        return ++this.creationCounter;
    }

    private handleMaxItemsConstraint(
        constraint: PositionConstraintMaxItems,
        position: OverlayPosition,
    ): Array<Promise<void>> {
        const overlaysInPosition = this.layoutStore.get(position);

        if (!overlaysInPosition) {
            return [];
        }

        if (overlaysInPosition.length <= constraint.max) {
            return [];
        }

        const overlays = overlaysInPosition.map((o) =>
            this.overlayStore.get(o),
        ) as Array<OverlayRecord>;

        const action = this.onConstraintViolation({
            overlays,
            violationPosition: position,
        });

        const overflowCount = overlaysInPosition.length - constraint.max;

        switch (action.type) {
            case ViolationReactionType.NO_ACTION:
                return [];
            case ViolationReactionType.REMOVE_IDS:
                return action.ids.map((id) => {
                    const cb =
                        this.overlayStore.get(
                            id,
                        )?.onRemovedAfterConstraintViolation;

                    return this.removeOverlay(id).then(() => {
                        if (cb) {
                            cb(id);
                        }
                    });
                });
            case ViolationReactionType.REMOVE_OLDEST_AUTO:
                return getNOldestOverlays(overlays, overflowCount).map((o) => {
                    const cb = this.overlayStore.get(
                        o.id,
                    )?.onRemovedAfterConstraintViolation;

                    return this.removeOverlay(o.id).then(() => {
                        if (cb) {
                            cb(o.id);
                        }
                    });
                });
            default:
                return [];
        }
    }
}
