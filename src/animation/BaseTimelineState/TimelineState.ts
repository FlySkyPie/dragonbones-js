import { Armature } from "../../armature/Armature";
import { BaseObject } from "../../core/BaseObject";
import { BinaryOffset, } from "../../core/DragonBones";
import { AnimationData, TimelineData } from "../../model/AnimationData";

import { AnimationState } from "../AnimationState";

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