import {
    addToBodyAndRemoveOld,
    animateElementIn,
    animateElementOut,
    createElementWithId,
    createElementWithInnerHTML,
    getFinalWidth,
    getWidthReference,
} from './dom';
import { BASE_LAYOUT, ID_MAP } from '../constants';
import {
    OverlayId,
    OverlayLayoutStore,
    OverlayPosition,
    OverlayStore,
    ResponsiveRules,
} from '../types';
import {
    addToLayoutStore,
    getConfigForMatchMedia,
    getNewLayoutStore,
} from './layout';

export class OverlayDom {
    private readonly rootElement: HTMLElement;
    private containerElement: HTMLElement | null = null;

    constructor(
        private readonly rootId: string,
        private readonly baseLayout: string = BASE_LAYOUT,
        private readonly baseTagName: keyof HTMLElementTagNameMap = 'div',
    ) {
        this.rootId = rootId;
        this.baseLayout = baseLayout;
        this.baseTagName = baseTagName;
        this.rootElement = this.createNewRootElement();
    }

    private getContainerElement(): HTMLElement | null {
        return document.getElementById(ID_MAP.container);
    }

    public getContainers() {
        return {
            root: this.rootElement,
            container: this.containerElement,
        };
    }

    public createNewRootElement(): HTMLElement {
        const newRoot = addToBodyAndRemoveOld<HTMLElement>(
            createElementWithInnerHTML(
                this.baseTagName,
                this.rootId,
                this.baseLayout,
            ),
            this.rootId,
        );
        this.containerElement = this.getContainerElement();

        return newRoot;
    }

    public createNewElementForOverlay(id: OverlayId): HTMLElement {
        return createElementWithId(this.baseTagName, id, 'overlay-wrapper');
    }

    public animateElementOut(
        element: HTMLElement,
        position: OverlayPosition,
        delay: number,
    ): Promise<void> {
        return animateElementOut(
            element,
            getWidthReference(element),
            getFinalWidth(position),
            delay,
        );
    }

    public animateElementIn(
        element: HTMLElement,
        position: OverlayPosition,
        delay: number,
    ): Promise<void> {
        return animateElementIn(
            element,
            getWidthReference(element),
            getFinalWidth(position),
            delay,
        );
    }

    public addElementAtPosition(position: OverlayPosition, el: HTMLElement) {
        const container = this.getContainerForPosition(position);

        if (!container) {
            return;
        }

        container.appendChild(el);
    }

    public putOverlaysInContainers(
        overlayStore: OverlayStore,
        responsiveRules: ResponsiveRules,
        requestPlaceInDOMContainer: (
            id: OverlayId,
            position: OverlayPosition,
        ) => void,
    ): OverlayLayoutStore {
        const result: OverlayLayoutStore = getNewLayoutStore();
        overlayStore.forEach((overlay) => {
            const resConfig = responsiveRules[overlay.position.original];

            const destinationPosition =
                (resConfig
                    ? getConfigForMatchMedia(resConfig)?.position
                    : overlay.position.original) || overlay.position.original;

            addToLayoutStore(
                result,
                destinationPosition,
                overlay,
                overlayStore,
            );
        });

        for (const [position, elements] of result) {
            elements.forEach((el) => {
                requestPlaceInDOMContainer(el, position);
            });
        }

        return result;
    }

    public getContainerForPosition(
        position: OverlayPosition,
    ): HTMLElement | null {
        return document.getElementById(ID_MAP[position]) || null;
    }
}
