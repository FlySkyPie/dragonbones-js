import { DisplayType } from "../../core/DragonBones";

import { DisplayData } from "./DisplayData";
import { GeometryData } from "./GeometryData";

export class PathDisplayData extends DisplayData {
    public static toString(): string {
        return "[class dragonBones.PathDisplayData]";
    }
    public closed: boolean = false;
    public constantSpeed: boolean = false;
    public readonly geometry: GeometryData = new GeometryData();
    public readonly curveLengths: Array<number> = [];

    protected _onClear(): void {
        super._onClear();

        this.type = DisplayType.Path;
        this.closed = false;
        this.constantSpeed = false;
        this.geometry.clear();
        this.curveLengths.length = 0;
    }
}