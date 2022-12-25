/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2012-2018 DragonBones team and other contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { BaseObject } from "../core/BaseObject";
import { ConstraintType, PositionMode, RotateMode, SpacingMode } from "../core/DragonBones";
import { BoneData, SlotData } from "./ArmatureData";
import { PathDisplayData } from "./DisplayData";

/**
 * @private
 */
export abstract class ConstraintData extends BaseObject {
    public order: number = 0;
    public name: string = "";
    public type: ConstraintType = ConstraintType.IK;
    public target: BoneData | null = null;
    public root: BoneData | null = null;
    public bone: BoneData | null = null;

    protected _onClear(): void {
        this.order = 0;
        this.name = "";
        this.type = ConstraintType.IK;
        this.target = null; //
        this.root = null; //
        this.bone = null;
    }
}
/**
 * @internal
 */
export class IKConstraintData extends ConstraintData {
    public static toString(): string {
        return "[class dragonBones.IKConstraintData]";
    }

    public scaleEnabled: boolean = false;
    public bendPositive: boolean = false;
    public weight: number = 1.0;

    protected _onClear(): void {
        super._onClear();

        this.scaleEnabled = false;
        this.bendPositive = false;
        this.weight = 1.0;
    }
}
/**
 * @internal
 */
export class PathConstraintData extends ConstraintData {
    public static toString(): string {
        return "[class dragonBones.PathConstraintData]";
    }

    public pathSlot: SlotData | null = null;
    public pathDisplayData: PathDisplayData | null = null;
    public bones: Array<BoneData> = [];

    public positionMode: PositionMode = PositionMode.Fixed;
    public spacingMode: SpacingMode = SpacingMode.Fixed;
    public rotateMode: RotateMode = RotateMode.Chain;

    public position: number = 0.0;
    public spacing: number = 0.0;
    public rotateOffset: number = 0.0;
    public rotateMix: number = 0.0;
    public translateMix: number = 0.0;

    protected _onClear(): void {
        super._onClear();

        this.pathSlot = null;
        this.pathDisplayData = null;
        this.bones.length = 0;

        this.positionMode = PositionMode.Fixed;
        this.spacingMode = SpacingMode.Fixed;
        this.rotateMode = RotateMode.Chain;

        this.position = 0.0;
        this.spacing = 0.0;
        this.rotateOffset = 0.0;
        this.rotateMix = 0.0;
        this.translateMix = 0.0;
    }

    public AddBone(value: BoneData): void {
        this.bones.push(value);
    }
}
