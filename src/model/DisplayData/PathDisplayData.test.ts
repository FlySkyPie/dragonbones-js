import { expect, test } from 'vitest'
import { PathDisplayData } from './PathDisplayData';

// Edit an assertion and save to see HMR in action

test('PathDisplayData', () => {
    const origin = new PathDisplayData();

    const rested = new PathDisplayData();
    rested['_onClear']();

    expect(origin.geometry).toStrictEqual(rested.geometry);
    expect(origin.closed).toBe(rested.closed);
    expect(origin.constantSpeed).toBe(rested.constantSpeed);
    expect(origin.curveLengths).toStrictEqual(rested.curveLengths);
});
