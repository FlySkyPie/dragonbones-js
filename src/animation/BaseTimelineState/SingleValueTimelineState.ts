import { TweenTimelineState } from "./TweenTimelineState";

export abstract class SingleValueTimelineState extends TweenTimelineState {
    protected _current: number = 0.0;
    protected _difference: number = 0.0;
    protected _result: number = 0.0;

    protected _onClear(): void {
        super._onClear();

        this._current = 0.0;
        this._difference = 0.0;
        this._result = 0.0;
    }

    protected _onArriveAtFrame(): void {
        super._onArriveAtFrame();

        if (this._timelineData !== null) {
            const valueScale = this._valueScale;
            const valueArray = this._valueArray;
            //
            const valueOffset = this._valueOffset + this._frameValueOffset + this._frameIndex;

            if (valueArray === null) {
                throw new Error(`valueArray is null.`);
            }

            if (this._isTween) {
                const nextValueOffset = this._frameIndex === this._frameCount - 1 ?
                    this._valueOffset + this._frameValueOffset :
                    valueOffset + 1;

                if (valueScale === 1.0) {
                    this._current = valueArray[valueOffset];
                    this._difference = valueArray[nextValueOffset] - this._current;
                }
                else {
                    this._current = valueArray[valueOffset] * valueScale;
                    this._difference = valueArray[nextValueOffset] * valueScale - this._current;
                }
            }
            else {
                this._result = valueArray[valueOffset] * valueScale;
            }
        }
        else {
            this._result = 0.0;
        }
    }

    protected _onUpdateFrame(): void {
        super._onUpdateFrame();

        if (this._isTween) {
            this._result = this._current + this._difference * this._tweenProgress;
        }
    }
}