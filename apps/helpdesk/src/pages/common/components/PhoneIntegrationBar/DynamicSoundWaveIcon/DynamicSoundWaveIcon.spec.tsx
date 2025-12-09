import { act, render, screen } from '@testing-library/react'

import { DynamicSoundWaveIcon } from './DynamicSoundWaveIcon'

describe('DynamicSoundWaveIcon', () => {
    beforeEach(() => {
        jest.clearAllTimers()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    it('should render with default props', () => {
        const { container } = render(
            <DynamicSoundWaveIcon audioLevel={0.5}>
                <span>Microphone</span>
            </DynamicSoundWaveIcon>,
        )

        expect(screen.getByText('Microphone')).toBeInTheDocument()
        const bars = container.querySelectorAll('.soundWaveBar')
        expect(bars).toHaveLength(5)
    })

    it.each([
        { audioLevel: 0, sensitivity: 1, heights: [10, 10, 10, 10, 10] },
        { audioLevel: 0.5, sensitivity: 1, heights: [13, 15, 20, 15, 13] },
        { audioLevel: 1, sensitivity: 1, heights: [15, 20, 30, 20, 15] },
        { audioLevel: 0.5, sensitivity: 3, heights: [14, 18, 26, 18, 14] },
    ])(
        'should set bar heights based on audio level and sensitivity',
        ({ audioLevel, sensitivity, heights }) => {
            const { container } = render(
                <DynamicSoundWaveIcon
                    audioLevel={audioLevel}
                    minBarHeight={10}
                    maxBarHeight={30}
                    delay={0}
                    sensitivity={sensitivity}
                >
                    <span>Microphone</span>
                </DynamicSoundWaveIcon>,
            )

            act(() => {
                jest.runAllTimers()
            })

            const bars = container.querySelectorAll('.soundWaveBar')
            bars.forEach((bar, index) => {
                const height = parseInt((bar as HTMLElement).style.height)
                expect(height).toBe(heights[index])
            })
        },
    )

    it('should apply height to bars with delay', () => {
        const { container } = render(
            <DynamicSoundWaveIcon
                audioLevel={0.5}
                minBarHeight={10}
                maxBarHeight={30}
                delay={100}
                sensitivity={3}
            >
                <span>Microphone</span>
            </DynamicSoundWaveIcon>,
        )

        const bars = container.querySelectorAll('.soundWaveBar')

        // immediately, central bar update
        expect(parseInt((bars[0] as HTMLElement).style.height)).toBe(10)
        expect(parseInt((bars[1] as HTMLElement).style.height)).toBe(10)
        expect(parseInt((bars[2] as HTMLElement).style.height)).toBe(26)
        expect(parseInt((bars[3] as HTMLElement).style.height)).toBe(10)
        expect(parseInt((bars[4] as HTMLElement).style.height)).toBe(10)

        // after 100ms, adjacent bars update
        act(() => {
            jest.advanceTimersByTime(100)
        })

        expect(parseInt((bars[1] as HTMLElement).style.height)).toBe(18)
        expect(parseInt((bars[3] as HTMLElement).style.height)).toBe(18)

        // after 200ms total, outermost bars update
        act(() => {
            jest.advanceTimersByTime(100)
        })

        expect(parseInt((bars[0] as HTMLElement).style.height)).toBe(14)
        expect(parseInt((bars[4] as HTMLElement).style.height)).toBe(14)
    })

    it('should use delay to generate a wave like behavior', () => {
        const { container, rerender } = render(
            <DynamicSoundWaveIcon
                audioLevel={0.5}
                minBarHeight={10}
                maxBarHeight={30}
                delay={100}
                sensitivity={3}
            >
                <span>Microphone</span>
            </DynamicSoundWaveIcon>,
        )

        const bars = container.querySelectorAll('.soundWaveBar')

        expect(parseInt((bars[0] as HTMLElement).style.height)).toBe(10) // |
        expect(parseInt((bars[1] as HTMLElement).style.height)).toBe(10) // |
        expect(parseInt((bars[2] as HTMLElement).style.height)).toBe(26) // |----------------
        expect(parseInt((bars[3] as HTMLElement).style.height)).toBe(10) // |
        expect(parseInt((bars[4] as HTMLElement).style.height)).toBe(10) // |

        act(() => {
            jest.advanceTimersByTime(100)
        })
        rerender(
            <DynamicSoundWaveIcon
                audioLevel={0.2}
                minBarHeight={10}
                maxBarHeight={30}
                delay={100}
                sensitivity={3}
            >
                <span>Microphone</span>
            </DynamicSoundWaveIcon>,
        )

        expect(parseInt((bars[0] as HTMLElement).style.height)).toBe(10) // |
        expect(parseInt((bars[1] as HTMLElement).style.height)).toBe(18) // |--------
        expect(parseInt((bars[2] as HTMLElement).style.height)).toBe(16) // |------
        expect(parseInt((bars[3] as HTMLElement).style.height)).toBe(18) // |--------
        expect(parseInt((bars[4] as HTMLElement).style.height)).toBe(10) // |

        act(() => {
            jest.advanceTimersByTime(100)
        })
        rerender(
            <DynamicSoundWaveIcon
                audioLevel={0}
                minBarHeight={10}
                maxBarHeight={30}
                delay={100}
                sensitivity={3}
            >
                <span>Microphone</span>
            </DynamicSoundWaveIcon>,
        )

        expect(parseInt((bars[0] as HTMLElement).style.height)).toBe(14) // |----
        expect(parseInt((bars[1] as HTMLElement).style.height)).toBe(13) // |---
        expect(parseInt((bars[2] as HTMLElement).style.height)).toBe(10) // |
        expect(parseInt((bars[3] as HTMLElement).style.height)).toBe(13) // |---
        expect(parseInt((bars[4] as HTMLElement).style.height)).toBe(14) // |----
    })
})
