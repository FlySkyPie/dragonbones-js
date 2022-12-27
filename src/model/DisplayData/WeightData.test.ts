import { expect, test } from 'vitest'
import { WeightData } from './WeightData';

// Edit an assertion and save to see HMR in action

test('WeightData', () => {
    const origin = new WeightData();

    const rested = new WeightData();
    rested['_onClear']();

  
    expect(origin.count).toBe(rested.count);
    expect(origin.offset).toBe(rested.offset);
    expect(origin.bones).toStrictEqual(rested.bones);
});
