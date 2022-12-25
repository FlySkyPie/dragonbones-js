/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2012-2018 DragonBones team and other contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Armature } from "../armature/Armature";
import { BaseObject } from "../core/BaseObject";
import { BinaryOffset, TweenType } from "../core/DragonBones";
import { AnimationData, TimelineData } from "../model/AnimationData";
import { AnimationState } from "./AnimationState";

/**
 * @internal
 */
export abstract class TimelineState extends BaseObject {
    public dirty: boolean = false;
    /**
     * -1: start, 0: play, 1: complete;
     */
    public playState: number = -1;
    public currentPlayTimes: number = 0;
    public currentTime: number = -1.0;
    public target: BaseObject | null = null;

    protected _isTween: boolean = false;
    protected _valueOffset: number = 0;
    protected _frameValueOffset: number = 0;
    protected _frameOffset: number = 0;
    protected _frameRate: number = 0;
    protected _frameCount: number = 0;
    protected _frameIndex: number = -1;
    protected _frameRateR: number = 0.0;
    protected _position: number = 0.0;
    protected _duration: number = 0.0;
    protected _timeScale: number = 1.0;
    protected _timeOffset: number = 0.0;
    protected _animationData: AnimationData | null = null;
    protected _timelineData: TimelineData | null = null;
    protected _armature: Armature | null = null;
    protected _animationState: AnimationState | null = null;
    protected _actionTimeline: TimelineState | null = null;
    protected _timelineArray: Array<number> | Uint16Array | null = null;
    protected _frameArray: Array<number> | Int16Array | null = null;
    protected _valueArray: Array<number> | Int16Array | Float32Array | null = null;
    protected _frameIndices: Array<number> | null = null;

    protected _onClear(): void {
        this.dirty = false;
        this.playState = -1;
        this.currentPlayTimes = 0;
        this.currentTime = -1.0;
        this.target = null as any;

        this._isTween = false;
        this._valueOffset = 0;
        this._frameValueOffset = 0;
        this._frameOffset = 0;
        this._frameRate = 0;
        this._frameCount = 0;
        this._frameIndex = -1;
        this._frameRateR = 0.0;
        this._position = 0.0;
        this._duration = 0.0;
        this._timeScale = 1.0;
        this._timeOffset = 0.0;
        this._animationData = null; //
        this._timelineData = null; //
        this._armature = null; //
        this._animationState = null; //
        this._actionTimeline = null; //
        this._frameArray = null; //
        this._valueArray = null; //
        this._timelineArray = null; //
        this._frameIndices = null; //
    }

    protected abstract _onArriveAtFrame(): void;
    protected abstract _onUpdateFrame(): void;

    protected _setCurrentTime(passedTime: number): boolean {
        const prevState = this.playState;
        const prevPlayTimes = this.currentPlayTimes;
        const prevTime = this.currentTime;

        if (this._actionTimeline !== null && this._frameCount <= 1) { // No frame or only one frame.
            this.playState = this._actionTimeline.playState >= 0 ? 1 : -1;
            this.currentPlayTimes = 1;
            this.currentTime = this._actionTimeline.currentTime;
        }
        else if (this._actionTimeline === null || this._timeScale !== 1.0 || this._timeOffset !== 0.0) { // Action timeline or has scale and offset.
            if (this._animationState === null) {
                throw new Error(`this._animationState is null.`);
            }

            if (this._animationData === null) {
                throw new Error(`this._animationData is null.`);
            }

            const playTimes = this._animationState.playTimes;
            const totalTime = playTimes * this._duration;

            passedTime *= this._timeScale;
            if (this._timeOffset !== 0.0) {
                passedTime += this._timeOffset * this._animationData.duration;
            }

            if (playTimes > 0 && (passedTime >= totalTime || passedTime <= -totalTime)) {
                if (this.playState <= 0 && this._animationState._playheadState === 3) {
                    this.playState = 1;
                }

                this.currentPlayTimes = playTimes;
                if (passedTime < 0.0) {
                    this.currentTime = 0.0;
                }
                else {
                    this.currentTime = this.playState === 1 ? this._duration + 0.000001 : this._duration; // Precision problem
                }
            }
            else {
                if (this.playState !== 0 && this._animationState._playheadState === 3) {
                    this.playState = 0;
                }

                if (passedTime < 0.0) {
                    passedTime = -passedTime;
                    this.currentPlayTimes = Math.floor(passedTime / this._duration);
                    this.currentTime = this._duration - (passedTime % this._duration);
                }
                else {
                    this.currentPlayTimes = Math.floor(passedTime / this._duration);
                    this.currentTime = passedTime % this._duration;
                }
            }

            this.currentTime += this._position;
        }
        else { // Multi frames.
            this.playState = this._actionTimeline.playState;
            this.currentPlayTimes = this._actionTimeline.currentPlayTimes;
            this.currentTime = this._actionTimeline.currentTime;
        }

        if (this.currentPlayTimes === prevPlayTimes && this.currentTime === prevTime) {
            return false;
        }

        // Clear frame flag when timeline start or loopComplete.
        if (
            (prevState < 0 && this.playState !== prevState) ||
            (this.playState <= 0 && this.currentPlayTimes !== prevPlayTimes)
        ) {
            this._frameIndex = -1;
        }

        return true;
    }

    public init(armature: Armature, animationState: AnimationState, timelineData: TimelineData | null): void {
        this._armature = armature;
        this._animationState = animationState;
        this._timelineData = timelineData;
        this._actionTimeline = this._animationState._actionTimeline;

        if (this === this._actionTimeline) {
            this._actionTimeline = null as any; //
        }

        this._animationData = this._animationState.animationData;
        //
        if (this._animationData.parent === null) {
            throw new Error(`this._animationData.parent is null.`);
        }


        this._frameRate = this._animationData.parent.frameRate;
        this._frameRateR = 1.0 / this._frameRate;
        this._position = this._animationState._position;
        this._duration = this._animationState._duration;

        if (this._timelineData !== null) {
            const dragonBonesData = this._animationData.parent.parent; // May by the animation data is not belone to this armature data.

            if (dragonBonesData === null) {
                throw new Error(`dragonBonesData is null.`);
            }

            this._frameArray = dragonBonesData.frameArray;
            this._timelineArray = dragonBonesData.timelineArray;
            this._frameIndices = dragonBonesData.frameIndices;

            if (this._timelineArray === null) {
                throw new Error(`this._timelineArray is null.`);
            }
            //
            this._frameCount = this._timelineArray[this._timelineData.offset + BinaryOffset.TimelineKeyFrameCount];
            this._frameValueOffset = this._timelineArray[this._timelineData.offset + BinaryOffset.TimelineFrameValueOffset];
            this._timeScale = 100.0 / this._timelineArray[this._timelineData.offset + BinaryOffset.TimelineScale];
            this._timeOffset = this._timelineArray[this._timelineData.offset + BinaryOffset.TimelineOffset] * 0.01;
        }
    }

    public fadeOut(): void {
        this.dirty = false;
    }

    public update(passedTime: number): void {
        if (this._setCurrentTime(passedTime)) {
            if (this._frameCount > 1) {
                const timelineFrameIndex = Math.floor(this.currentTime * this._frameRate); // uint

                if (this._frameIndices === null) {
                    throw new Error(`this._frameIndices is null.`);
                }

                const frameIndex = this._frameIndices[(this._timelineData as TimelineData).frameIndicesOffset + timelineFrameIndex];

                if (this._frameIndex !== frameIndex) {
                    this._frameIndex = frameIndex;

                    if (this._animationData === null) {
                        throw new Error(` this._animationData is null.`);
                    }

                    if (this._timelineArray === null) {
                        throw new Error(` this._timelineArray is null.`);
                    }

                    this._frameOffset = this._animationData.frameOffset + this._timelineArray[(this._timelineData as TimelineData).offset + BinaryOffset.TimelineFrameOffset + this._frameIndex];

                    this._onArriveAtFrame();
                }
            }
            else if (this._frameIndex < 0) {
                this._frameIndex = 0;

                if (this._timelineData !== null) { // May be pose timeline.
                    if (this._animationData === null) {
                        throw new Error(` this._animationData is null.`);
                    }

                    if (this._timelineArray === null) {
                        throw new Error(` this._timelineArray is null.`);
                    }

                    this._frameOffset = this._animationData.frameOffset + this._timelineArray[this._timelineData.offset + BinaryOffset.TimelineFrameOffset];
                }

                this._onArriveAtFrame();
            }

            if (this._isTween || this.dirty) {
                this._onUpdateFrame();
            }
        }
    }

    public blend(_isDirty: boolean): void {
    }
}
/**
 * @internal
 */
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
/**
 * @internal
 */
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
/**
 * @internal
 */
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
/**
 * @internal
 */
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

