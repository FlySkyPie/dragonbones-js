import { expect, test } from 'vitest'
import { BoundingBoxDisplayData } from './BoundingBoxDisplayData';

// Edit an assertion and save to see HMR in action

test('BoundingBoxDisplayData', () => {
    const origin = new BoundingBoxDisplayData();

    const rested = new BoundingBoxDisplayData();
    rested['_onClear']();

    expect(origin.boundingBox).toBe(rested.boundingBox);
});
