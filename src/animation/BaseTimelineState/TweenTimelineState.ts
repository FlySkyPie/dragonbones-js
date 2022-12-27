import { BinaryOffset, TweenType } from "../../core/DragonBones";
import { TimelineData } from "../../model/AnimationData";

import { TimelineState } from "./TimelineState";

export abstract class TweenTimelineState extends TimelineState {
    private static _getEasingValue(tweenType: TweenType, progress: number, easing: number): number {
        let value = progress;

        switch (tweenType) {
            case TweenType.QuadIn:
                value = Math.pow(progress, 2.0);
                break;

            case TweenType.QuadOut:
                value = 1.0 - Math.pow(1.0 - progress, 2.0);
                break;

            case TweenType.QuadInOut:
                value = 0.5 * (1.0 - Math.cos(progress * Math.PI));
                break;
        }

        return (value - progress) * easing + progress;
    }

    private static _getEasingCurveValue(progress: number, samples: Array<number> | Int16Array, count: number, offset: number): number {
        if (progress <= 0.0) {
            return 0.0;
        }
        else if (progress >= 1.0) {
            return 1.0;
        }

        const isOmited = count > 0;
        const segmentCount = count + 1; // + 2 - 1
        const valueIndex = Math.floor(progress * segmentCount);
        let fromValue = 0.0;
        let toValue = 0.0;

        if (isOmited) {
            fromValue = valueIndex === 0 ? 0.0 : samples[offset + valueIndex - 1];
            toValue = (valueIndex === segmentCount - 1) ? 10000.0 : samples[offset + valueIndex];
        }
        else {
            fromValue = samples[offset + valueIndex - 1];
            toValue = samples[offset + valueIndex];
        }

        return (fromValue + (toValue - fromValue) * (progress * segmentCount - valueIndex)) * 0.0001;
    }

    protected _tweenType: TweenType = TweenType.None;
    protected _curveCount: number = 0;
    protected _framePosition: number = 0.0;
    protected _frameDurationR: number = 0.0;
    protected _tweenEasing: number = 0.0;
    protected _tweenProgress: number = 0.0;
    protected _valueScale: number = 1.0;

    protected _onClear(): void {
        super._onClear();

        this._tweenType = TweenType.None;
        this._curveCount = 0;
        this._framePosition = 0.0;
        this._frameDurationR = 0.0;
        this._tweenEasing = 0.0;
        this._tweenProgress = 0.0;
        this._valueScale = 1.0;
    }

    protected _onArriveAtFrame(): void {
        if (this._animationState === null) {
            throw new Error(` this._animationState is null.`);
        }


        if (
            this._frameCount > 1 &&
            (
                this._frameIndex !== this._frameCount - 1 ||
                this._animationState.playTimes === 0 ||
                this._animationState.currentPlayTimes < this._animationState.playTimes - 1
            )
        ) {
            if (this._frameArray === null) {
                throw new Error(` this._frameArray is null.`);
            }


            this._tweenType = this._frameArray[this._frameOffset + BinaryOffset.FrameTweenType];
            this._isTween = this._tweenType !== TweenType.None;

            if (this._isTween) {
                if (this._tweenType === TweenType.Curve) {
                    this._curveCount = this._frameArray[this._frameOffset + BinaryOffset.FrameTweenEasingOrCurveSampleCount];
                }
                else if (this._tweenType !== TweenType.None && this._tweenType !== TweenType.Line) {
                    this._tweenEasing = this._frameArray[this._frameOffset + BinaryOffset.FrameTweenEasingOrCurveSampleCount] * 0.01;
                }
            }
            else {
                this.dirty = true;
            }

            this._framePosition = this._frameArray[this._frameOffset] * this._frameRateR;

            if (this._animationData === null) {
                throw new Error(` this._animationData is null.`);
            }



            if (this._frameIndex === this._frameCount - 1) {

                this._frameDurationR = 1.0 / (this._animationData.duration - this._framePosition);
            }
            else {
                if (this._timelineArray === null) {
                    throw new Error(` this._timelineArray is null.`);
                }

                const nextFrameOffset = this._animationData.frameOffset + this._timelineArray[(this._timelineData as TimelineData).offset + BinaryOffset.TimelineFrameOffset + this._frameIndex + 1];
                const frameDuration = this._frameArray[nextFrameOffset] * this._frameRateR - this._framePosition;

                if (frameDuration > 0) {
                    this._frameDurationR = 1.0 / frameDuration;
                }
                else {
                    this._frameDurationR = 0.0;
                }
            }
        }
        else {
            this.dirty = true;
            this._isTween = false;
        }
    }

    protected _onUpdateFrame(): void {
        if (this._isTween) {
            this.dirty = true;
            this._tweenProgress = (this.currentTime - this._framePosition) * this._frameDurationR;

            if (this._tweenType === TweenType.Curve) {
                if (this._frameArray === null) {
                    throw new Error(` this._frameArray is null.`);
                }

                this._tweenProgress = TweenTimelineState._getEasingCurveValue(this._tweenProgress, this._frameArray, this._curveCount, this._frameOffset + BinaryOffset.FrameCurveSamples);
            }
            else if (this._tweenType !== TweenType.Line) {
                this._tweenProgress = TweenTimelineState._getEasingValue(this._tweenType, this._tweenProgress, this._tweenEasing);
            }
        }
    }
}