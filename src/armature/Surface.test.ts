import { expect, test } from 'vitest'
import { Surface } from './Surface';

// Edit an assertion and save to see HMR in action

test('Surface', () => {
    const origin = new Surface();

    const rested = new Surface();
    rested['_onClear']();

    expect(origin._dX).toBe(rested._dX);
    expect(origin._dY).toBe(rested._dY);
    expect(origin._k).toBe(rested._k);
    expect(origin._kX).toBe(rested._kX);
    expect(origin._kY).toBe(rested._kY);
    expect(origin._vertices).toStrictEqual(rested._vertices);
    expect(origin._deformVertices).toStrictEqual(rested._deformVertices);
    expect(origin._matrixCahce).toStrictEqual(rested._matrixCahce);
    expect(origin._hullCache).toStrictEqual(rested._hullCache);
    expect(origin._bone).toStrictEqual(rested._bone);
});
