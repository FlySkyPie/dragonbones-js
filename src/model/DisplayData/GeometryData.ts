import { BinaryOffset, } from "../../core/DragonBones";

import { DragonBonesData } from "../DragonBonesData";

import { WeightData } from "./WeightData";

export class GeometryData {
    public isShared: boolean = false;
    public inheritDeform: boolean = false;
    public offset: number = 0;
    public data: DragonBonesData | null = null;
    public weight: WeightData | null = null; // Initial value.

    public clear(): void {
        if (!this.isShared && this.weight !== null) {
            this.weight.returnToPool();
        }

        this.isShared = false;
        this.inheritDeform = false;
        this.offset = 0;
        this.data = null;
        this.weight = null;
    }

    public shareFrom(value: GeometryData): void {
        this.isShared = true;
        this.offset = value.offset;
        this.weight = value.weight;
    }

    public get vertexCount(): number {
        if (this.data === null || this.offset === undefined || this.data.intArray === null) {
            throw new Error();
        }

        const intArray = this.data.intArray;
        return intArray[this.offset + BinaryOffset.GeometryVertexCount];
    }

    public get triangleCount(): number {
        if (this.data === null || this.offset === undefined || this.data.intArray === null) {
            throw new Error();
        }

        const intArray = this.data.intArray;
        return intArray[this.offset + BinaryOffset.GeometryTriangleCount];
    }
}
