import { DisplayType } from "../../core/DragonBones";

import { BoundingBoxData } from "../BoundingBoxData";

import { DisplayData } from "./DisplayData";

export class BoundingBoxDisplayData extends DisplayData {
    public static toString(): string {
        return "[class dragonBones.BoundingBoxDisplayData]";
    }

    public boundingBox: BoundingBoxData | null = null; // Initial value.

    protected _onClear(): void {
        super._onClear();

        if (this.boundingBox !== null) {
            this.boundingBox.returnToPool();
        }

        this.type = DisplayType.BoundingBox;
        this.boundingBox = null;
    }
}