import { expect, test } from 'vitest'
import { Armature } from './Armature';

// Edit an assertion and save to see HMR in action

test('Armature', () => {
    const origin = new Armature();

    const rested = new Armature();
    rested['_onClear']();

    expect(origin.inheritAnimation).toBe(rested.inheritAnimation);
    expect(origin.userData).toStrictEqual(rested.userData);

    expect(origin._lockUpdate).toStrictEqual(rested._lockUpdate);
    expect(origin["_slotsDirty"]).toStrictEqual(rested["_slotsDirty"]);
    expect(origin["_zOrderDirty"]).toStrictEqual(rested["_zOrderDirty"]);
    expect(origin._zIndexDirty).toStrictEqual(rested._zIndexDirty);
    expect(origin["_flipX"]).toStrictEqual(rested["_flipX"]);
    expect(origin._flipY).toStrictEqual(rested._flipY);
    expect(origin._cacheFrameIndex).toStrictEqual(rested._cacheFrameIndex);
    expect(origin._alpha).toStrictEqual(rested._alpha);
    expect(origin._globalAlpha).toStrictEqual(rested._globalAlpha);
    expect(origin._bones).toStrictEqual(rested._bones);
    expect(origin._slots).toStrictEqual(rested._slots);
    expect(origin._constraints).toStrictEqual(rested._constraints);
    expect(origin._actions).toStrictEqual(rested._actions);
    expect(origin._armatureData).toStrictEqual(rested._armatureData);
    expect(origin._animation).toStrictEqual(rested._animation);
    expect(origin._proxy).toStrictEqual(rested._proxy);
    expect(origin._display).toStrictEqual(rested._display);
    expect(origin._replaceTextureAtlasData).toStrictEqual(rested._replaceTextureAtlasData);
    expect(origin._replacedTexture).toStrictEqual(rested._replacedTexture);
    expect(origin._dragonBones).toStrictEqual(rested._dragonBones);
    expect(origin._clock).toStrictEqual(rested._clock);
    expect(origin._parent).toStrictEqual(rested._parent);
});
