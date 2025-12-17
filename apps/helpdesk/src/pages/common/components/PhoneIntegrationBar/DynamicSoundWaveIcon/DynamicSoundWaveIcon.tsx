import { useEffect, useRef } from 'react'

import css from './DynamicSoundWaveIcon.less'

type DynamicSoundWaveIconProps = {
    children: React.ReactNode
    audioLevel: number
    maxBarHeight?: number
    sensitivity?: number
    delay?: number
    hide?: boolean
}

const BAR_COUNT = 5
const BAR_STARTING_HEIGHTS = [0.375, 0.875, 0.625, 0.75, 0.5]

export const DynamicSoundWaveIcon = ({
    children,
    audioLevel,
    maxBarHeight = 22,
    sensitivity = 5,
    delay = 100,
    hide = false,
}: DynamicSoundWaveIconProps) => {
    const barsRef = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        // the volume that we get is in the range [0.0, 1.0]
        // however, when speaking, the volume is usually in the range [0.3, 0.5]
        // to have a better representation, we want to inflate this range so that it is more evident
        // this way we have a better height range for the dynamic sound wave
        // to do so, we use this function: x / (1 + (1 - x)^s) https://www.desmos.com/calculator/e1eoryhiy7
        // the higher the exponent (sensitivity) the more it inflates lower volumes
        // for instance, suppose s = 5
        // 0.3 -> ~0.64
        // 0.4 -> ~0.84
        // 0.5 -> ~0.94
        // note that if the sensitivity is too high, even small volume increments will be inflated a lot, resulting in jittering
        const improvedAudioLevel =
            audioLevel / (audioLevel + Math.pow(1 - audioLevel, sensitivity))

        barsRef.current.forEach((bar, index) => {
            if (!bar) return
            // the central bar should react immediately, while outer bars have progressively longer delays based on their distance from the center
            // this computation seems difficult but it's pretty simple, for instance let's take barCount = 5 (in this case 5 / 2 - 0.5 = 2)
            // 0 -> 2
            // 1 -> 1
            // 2 -> 0
            // 3 -> 1
            // 4 -> 2
            const barDelay = Math.abs(BAR_COUNT / 2 - 0.5 - index) * delay

            // all bars have a starting height based on the static icon design
            // then, they will raise towars the max height when the volume is going up
            // after reaching the max height, they will start to decrease
            // example:
            // supposing startingHeight = 6, maxBarHeight = 10 (v is volume)
            // v = 0 |------    |
            // v = 1 |-------   |
            // v = 2 |--------  |
            // v = 3 |--------- |
            // v = 4 |----------| (max reached)
            // v = 5 |--------- |
            // v = 6 |--------  |
            // ...
            const startingHeight = BAR_STARTING_HEIGHTS[index] * maxBarHeight
            const candidateHeight =
                startingHeight + maxBarHeight * improvedAudioLevel
            const height = hide
                ? 0
                : candidateHeight <= maxBarHeight
                  ? candidateHeight
                  : maxBarHeight - (candidateHeight - maxBarHeight)

            const changeBarHeight = () => {
                bar.style.height = `${Math.round(height)}px`
            }

            if (barDelay <= 0) {
                changeBarHeight()
                return
            }

            // to have an estimate of how many timers will be active at any time (to know the impact on performance)
            // with delay as the delay you set and as twilio_time the average time between audioLevel updates:
            // n_timers = 6 * delay / twilio_time
            // according to my tests, twilio_time ~= 50 ms
            // so if we set delay = 100 ms
            // n_timer = 12 (negligible impact on performance)
            setTimeout(changeBarHeight, barDelay)
        })
    }, [audioLevel, maxBarHeight, sensitivity, delay, hide])

    return (
        <div className={css.wrapper}>
            {children}
            <div className={css.soundWaveIcon}>
                {Array.from({ length: BAR_COUNT }).map((_, index) => (
                    <div
                        key={index}
                        ref={(el) => (barsRef.current[index] = el)}
                        className={css.soundWaveBar}
                        style={{
                            maxHeight: maxBarHeight,
                            height: 0,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
