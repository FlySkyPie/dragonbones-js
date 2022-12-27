import { TweenTimelineState } from "./TweenTimelineState";

export abstract class MutilpleValueTimelineState extends TweenTimelineState {
    protected _valueCount: number = 0;
    protected readonly _rd: Array<number> = [];

    protected _onClear(): void {
        super._onClear();

        this._valueCount = 0;
        this._rd.length = 0;
    }

    protected _onArriveAtFrame(): void {
        super._onArriveAtFrame();

        const valueCount = this._valueCount;
        const rd = this._rd;

        if (this._timelineData !== null) {
            const valueScale = this._valueScale;
            const valueArray = this._valueArray;
            //
            if (valueArray === null) {
                throw new Error(`valueArray is null.`);
            }

            const valueOffset = this._valueOffset + this._frameValueOffset + this._frameIndex * valueCount;

            if (this._isTween) {
                const nextValueOffset = this._frameIndex === this._frameCount - 1 ?
                    this._valueOffset + this._frameValueOffset :
                    valueOffset + valueCount;

                if (valueScale === 1.0) {
                    for (let i = 0; i < valueCount; ++i) {
                        rd[valueCount + i] = valueArray[nextValueOffset + i] - valueArray[valueOffset + i];
                    }
                }
                else {
                    for (let i = 0; i < valueCount; ++i) {
                        rd[valueCount + i] = (valueArray[nextValueOffset + i] - valueArray[valueOffset + i]) * valueScale;
                    }
                }
            }
            else if (valueScale === 1.0) {
                for (let i = 0; i < valueCount; ++i) {
                    rd[i] = valueArray[valueOffset + i];
                }
            }
            else {
                for (let i = 0; i < valueCount; ++i) {
                    rd[i] = valueArray[valueOffset + i] * valueScale;
                }
            }
        }
        else {
            for (let i = 0; i < valueCount; ++i) {
                rd[i] = 0.0;
            }
        }
    }

    protected _onUpdateFrame(): void {
        super._onUpdateFrame();

        if (this._isTween) {
            const valueCount = this._valueCount;
            const valueScale = this._valueScale;
            const tweenProgress = this._tweenProgress;
            const valueArray = this._valueArray;
            const rd = this._rd;
            //
            const valueOffset = this._valueOffset + this._frameValueOffset + this._frameIndex * valueCount;

            if (valueArray === null) {
                throw new Error(`valueArray is null.`);
            }

            if (valueScale === 1.0) {
                for (let i = 0; i < valueCount; ++i) {
                    rd[i] = valueArray[valueOffset + i] + rd[valueCount + i] * tweenProgress;
                }
            }
            else {
                for (let i = 0; i < valueCount; ++i) {
                    rd[i] = valueArray[valueOffset + i] * valueScale + rd[valueCount + i] * tweenProgress;
                }
            }
        }
    }
}

