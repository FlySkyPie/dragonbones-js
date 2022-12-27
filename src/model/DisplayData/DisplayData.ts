import { BaseObject } from "../../core/BaseObject";
import { DisplayType } from "../../core/DragonBones";
import { Transform } from "../../geom/Transform";

import { SkinData } from "../SkinData";

export abstract class DisplayData extends BaseObject {
    public type?: DisplayType;
    public name: string = "";
    public path: string = "";
    public readonly transform: Transform = new Transform();
    public parent: SkinData | null = null;

    protected _onClear(): void {
        this.name = "";
        this.path = "";
        this.transform.identity();
        this.parent = null; //
    }
}