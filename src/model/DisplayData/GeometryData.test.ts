import { expect, test } from 'vitest'
import { GeometryData } from './GeometryData';

// Edit an assertion and save to see HMR in action

test('GeometryData', () => {
    const origin = new GeometryData();

    const rested = new GeometryData();
    rested.clear();

    expect(origin.isShared).toBe(rested.isShared);
    expect(origin.inheritDeform).toBe(rested.inheritDeform);
    expect(origin.offset).toBe(rested.offset);
    expect(origin.data).toBe(rested.data);
    expect(origin.weight).toBe(rested.weight);
});
