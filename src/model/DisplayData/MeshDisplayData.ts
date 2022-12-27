import {  DisplayType } from "../../core/DragonBones";

import { TextureData } from "../TextureAtlasData";

import { DisplayData } from "./DisplayData";
import { GeometryData } from "./GeometryData";

export class MeshDisplayData extends DisplayData {
    public static toString(): string {
        return "[class dragonBones.MeshDisplayData]";
    }

    public readonly geometry: GeometryData = new GeometryData();
    public texture: TextureData | null = null;

    protected _onClear(): void {
        super._onClear();

        this.type = DisplayType.Mesh;
        this.geometry.clear();
        this.texture = null;
    }
}