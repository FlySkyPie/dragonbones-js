import { expect, test } from 'vitest'
import { ArmatureDisplayData } from './ArmatureDisplayData';

// Edit an assertion and save to see HMR in action

test('ArmatureDisplayData', () => {
    const origin = new ArmatureDisplayData();

    const rested = new ArmatureDisplayData();
    rested['_onClear']();

    expect(origin.inheritAnimation).toBe(rested.inheritAnimation);
    expect(origin.actions).toStrictEqual(rested.actions);
    expect(origin.armature).toBe(rested.armature);
});
