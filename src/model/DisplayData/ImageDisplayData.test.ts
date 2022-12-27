import { expect, test } from 'vitest'
import { ImageDisplayData } from './ImageDisplayData';

// Edit an assertion and save to see HMR in action

test('ImageDisplayData', () => {
    const origin = new ImageDisplayData();

    const rested = new ImageDisplayData();
    rested['_onClear']();

    expect(origin.pivot).toStrictEqual(rested.pivot);
    expect(origin.texture).toBe(rested.texture);
});
