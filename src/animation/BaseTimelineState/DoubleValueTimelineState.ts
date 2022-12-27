import { TweenTimelineState } from "./TweenTimelineState";

export abstract class DoubleValueTimelineState extends TweenTimelineState {
    protected _currentA: number = 0.0;
    protected _currentB: number = 0.0;
    protected _differenceA: number = 0.0;
    protected _differenceB: number = 0.0;
    protected _resultA: number = 0.0;
    protected _resultB: number = 0.0;

    protected _onClear(): void {
        super._onClear();

        this._currentA = 0.0;
        this._currentB = 0.0;
        this._differenceA = 0.0;
        this._differenceB = 0.0;
        this._resultA = 0.0;
        this._resultB = 0.0;
    }

    protected _onArriveAtFrame(): void {
        super._onArriveAtFrame();

        if (this._timelineData !== null) {
            const valueScale = this._valueScale;
            const valueArray = this._valueArray;
            //
            const valueOffset = this._valueOffset + this._frameValueOffset + this._frameIndex * 2;

            if (valueArray === null) {
                throw new Error(`valueArray is null.`);
            }

            if (this._isTween) {
                const nextValueOffset = this._frameIndex === this._frameCount - 1 ?
                    this._valueOffset + this._frameValueOffset :
                    valueOffset + 2;

                if (valueScale === 1.0) {
                    this._currentA = valueArray[valueOffset];
                    this._currentB = valueArray[valueOffset + 1];
                    this._differenceA = valueArray[nextValueOffset] - this._currentA;
                    this._differenceB = valueArray[nextValueOffset + 1] - this._currentB;
                }
                else {
                    this._currentA = valueArray[valueOffset] * valueScale;
                    this._currentB = valueArray[valueOffset + 1] * valueScale;
                    this._differenceA = valueArray[nextValueOffset] * valueScale - this._currentA;
                    this._differenceB = valueArray[nextValueOffset + 1] * valueScale - this._currentB;
                }
            }
            else {
                this._resultA = valueArray[valueOffset] * valueScale;
                this._resultB = valueArray[valueOffset + 1] * valueScale;
            }
        }
        else {
            this._resultA = 0.0;
            this._resultB = 0.0;
        }
    }

    protected _onUpdateFrame(): void {
        super._onUpdateFrame();

        if (this._isTween) {
            this._resultA = this._currentA + this._differenceA * this._tweenProgress;
            this._resultB = this._currentB + this._differenceB * this._tweenProgress;
        }
    }
}