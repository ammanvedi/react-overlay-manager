import { f } from '../lib';

describe('index', () => {
    it('should return passed string', () => {
        expect(f('s')).toBe('s');
    });
});
