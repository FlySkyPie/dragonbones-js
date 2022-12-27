import { expect, test } from 'vitest'
import { MeshDisplayData } from './MeshDisplayData';

// Edit an assertion and save to see HMR in action

test('MeshDisplayData', () => {
    const origin = new MeshDisplayData();

    const rested = new MeshDisplayData();
    rested['_onClear']();

    expect(origin.geometry).toStrictEqual(rested.geometry);
    expect(origin.texture).toBe(rested.texture);
});
