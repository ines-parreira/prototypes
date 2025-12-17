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
        { audioLevel: 0, sensitivity: 1, heights: [11, 26, 19, 23, 15] },
        { audioLevel: 0.5, sensitivity: 1, heights: [26, 19, 26, 23, 30] },
        { audioLevel: 1, sensitivity: 1, heights: [19, 4, 11, 8, 15] },
        { audioLevel: 0.5, sensitivity: 3, heights: [25, 10, 17, 14, 21] },
    ])(
        'should set bar heights based on audio level and sensitivity',
        ({ audioLevel, sensitivity, heights }) => {
            const { container } = render(
                <DynamicSoundWaveIcon
                    audioLevel={audioLevel}
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
                maxBarHeight={30}
                delay={100}
                sensitivity={3}
            >
                <span>Microphone</span>
            </DynamicSoundWaveIcon>,
        )

        const bars = container.querySelectorAll('.soundWaveBar')

        // immediately, central bar update
        expect(parseInt((bars[0] as HTMLElement).style.height)).toBe(0)
        expect(parseInt((bars[1] as HTMLElement).style.height)).toBe(0)
        expect(parseInt((bars[2] as HTMLElement).style.height)).toBe(17)
        expect(parseInt((bars[3] as HTMLElement).style.height)).toBe(0)
        expect(parseInt((bars[4] as HTMLElement).style.height)).toBe(0)

        // after 100ms, adjacent bars update
        act(() => {
            jest.advanceTimersByTime(100)
        })

        expect(parseInt((bars[1] as HTMLElement).style.height)).toBe(10)
        expect(parseInt((bars[3] as HTMLElement).style.height)).toBe(14)

        // after 200ms total, outermost bars update
        act(() => {
            jest.advanceTimersByTime(100)
        })

        expect(parseInt((bars[0] as HTMLElement).style.height)).toBe(25)
        expect(parseInt((bars[4] as HTMLElement).style.height)).toBe(21)
    })

    it('should use delay to generate a wave like behavior', () => {
        const { container, rerender } = render(
            <DynamicSoundWaveIcon
                audioLevel={0.5}
                maxBarHeight={30}
                delay={100}
                sensitivity={3}
            >
                <span>Microphone</span>
            </DynamicSoundWaveIcon>,
        )

        const bars = container.querySelectorAll('.soundWaveBar')

        expect(parseInt((bars[0] as HTMLElement).style.height)).toBe(0) //  |
        expect(parseInt((bars[1] as HTMLElement).style.height)).toBe(0) //  |
        expect(parseInt((bars[2] as HTMLElement).style.height)).toBe(17) // |-----------------
        expect(parseInt((bars[3] as HTMLElement).style.height)).toBe(0) //  |
        expect(parseInt((bars[4] as HTMLElement).style.height)).toBe(0) //  |

        act(() => {
            jest.advanceTimersByTime(100)
        })
        rerender(
            <DynamicSoundWaveIcon
                audioLevel={0.2}
                maxBarHeight={30}
                delay={100}
                sensitivity={3}
            >
                <span>Microphone</span>
            </DynamicSoundWaveIcon>,
        )

        expect(parseInt((bars[0] as HTMLElement).style.height)).toBe(0) //  |
        expect(parseInt((bars[1] as HTMLElement).style.height)).toBe(10) // |----------
        expect(parseInt((bars[2] as HTMLElement).style.height)).toBe(27) // |---------------------------
        expect(parseInt((bars[3] as HTMLElement).style.height)).toBe(14) // |--------------
        expect(parseInt((bars[4] as HTMLElement).style.height)).toBe(0) //  |

        act(() => {
            jest.advanceTimersByTime(100)
        })
        rerender(
            <DynamicSoundWaveIcon
                audioLevel={0}
                maxBarHeight={30}
                delay={100}
                sensitivity={3}
            >
                <span>Microphone</span>
            </DynamicSoundWaveIcon>,
        )

        expect(parseInt((bars[0] as HTMLElement).style.height)).toBe(25) // |-------------------------
        expect(parseInt((bars[1] as HTMLElement).style.height)).toBe(25) // |-------------------------
        expect(parseInt((bars[2] as HTMLElement).style.height)).toBe(19) // |-------------------
        expect(parseInt((bars[3] as HTMLElement).style.height)).toBe(29) // |-----------------------------
        expect(parseInt((bars[4] as HTMLElement).style.height)).toBe(21) // |---------------------
    })

    it('should set all bars to 0 height when hide is true', () => {
        const { container } = render(
            <DynamicSoundWaveIcon
                audioLevel={0.5}
                maxBarHeight={30}
                delay={0}
                sensitivity={3}
                hide={true}
            >
                <span>Microphone</span>
            </DynamicSoundWaveIcon>,
        )

        act(() => {
            jest.runAllTimers()
        })

        const bars = container.querySelectorAll('.soundWaveBar')
        bars.forEach((bar) => {
            const height = parseInt((bar as HTMLElement).style.height)
            expect(height).toBe(0)
        })
    })
})
