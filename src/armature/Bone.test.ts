import { expect, test } from 'vitest'
import { Bone } from './Bone';

// Edit an assertion and save to see HMR in action

test('Bone', () => {
    const origin = new Bone();

    const rested = new Bone();
    rested['_onClear']();

    expect(origin._transformDirty).toBe(rested._transformDirty);
    expect(origin._childrenTransformDirty).toBe(rested._childrenTransformDirty);
    expect(origin._localDirty).toBe(rested._localDirty);
    expect(origin._hasConstraint).toBe(rested._hasConstraint);
    expect(origin._visible).toBe(rested._visible);
    expect(origin._cachedFrameIndex).toBe(rested._cachedFrameIndex);
    expect(origin._boneData).toBe(rested._boneData);
    expect(origin._parent).toBe(rested._parent);
    expect(origin._cachedFrameIndices).toBe(rested._cachedFrameIndices);
});
