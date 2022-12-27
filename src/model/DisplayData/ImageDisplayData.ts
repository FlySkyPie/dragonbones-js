import { DisplayType } from "../../core/DragonBones";
import { Point } from "../../geom/Point";

import { TextureData } from "../TextureAtlasData";

import { DisplayData } from "./DisplayData";

export class ImageDisplayData extends DisplayData {
    public static toString(): string {
        return "[class dragonBones.ImageDisplayData]";
    }

    public readonly pivot: Point = new Point();
    public texture: TextureData | null = null;

    protected _onClear(): void {
        super._onClear();

        this.type = DisplayType.Image;
        this.pivot.clear();
        this.texture = null;
    }
}