import { DisplayType } from "../../core/DragonBones";

import { ArmatureData, } from "../ArmatureData";
import { ActionData } from "../UserData";

import { DisplayData } from "./DisplayData";

export class ArmatureDisplayData extends DisplayData {
    public static toString(): string {
        return "[class dragonBones.ArmatureDisplayData]";
    }

    public inheritAnimation: boolean = false;
    public readonly actions: Array<ActionData> = [];
    public armature: ArmatureData | null = null;

    protected _onClear(): void {
        super._onClear();

        for (const action of this.actions) {
            action.returnToPool();
        }

        this.type = DisplayType.Armature;
        this.inheritAnimation = false;
        this.actions.length = 0;
        this.armature = null;
    }
    /**
     * @private
     */
    public addAction(value: ActionData): void {
        this.actions.push(value);
    }
}