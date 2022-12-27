import { BaseObject } from "../../core/BaseObject";

import { BoneData } from "../ArmatureData";

export class WeightData extends BaseObject {
    public static toString(): string {
        return "[class dragonBones.WeightData]";
    }

    public count: number = 0;
    public offset: number = 0;
    public readonly bones: Array<BoneData> = [];

    protected _onClear(): void {
        this.count = 0;
        this.offset = 0;
        this.bones.length = 0;
    }

    public addBone(value: BoneData): void {
        this.bones.push(value);
    }
}
