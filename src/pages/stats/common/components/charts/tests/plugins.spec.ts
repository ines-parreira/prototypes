import { Chart } from 'chart.js'
import moment from 'moment'

import colorTokens from '@gorgias/design-tokens/tokens/colors'

import { highlightTimeRanges } from '../plugins'

describe('highlightTimeRanges plugin', () => {
    let mockChart: Chart
    let mockContext: CanvasRenderingContext2D

    beforeEach(() => {
        // Mock canvas context
        mockContext = {
            save: jest.fn(),
            restore: jest.fn(),
            globalCompositeOperation: '',
            fillStyle: '',
            fillRect: jest.fn(),
        } as unknown as CanvasRenderingContext2D

        // Mock chart object
        mockChart = {
            canvas: {
                getContext: jest.fn().mockReturnValue(mockContext),
            },
            scales: {
                x: {
                    left: 0,
                    width: 500,
                    ticks: [
                        { value: moment().startOf('day').unix() },
                        {
                            value: moment()
                                .startOf('day')
                                .add(1, 'hour')
                                .unix(),
                        },
                        {
                            value: moment()
                                .startOf('day')
                                .add(2, 'hour')
                                .unix(),
                        },
                    ],
                    getLabelForValue: (value: number) => value.toString(),
                    getPixelForValue: jest
                        .fn()
                        .mockImplementation((value, index) => index * 100),
                },
                y: {
                    top: 0,
                    bottom: 300,
                },
            },
        } as unknown as Chart
    })

    it('should not draw anything if canvas is not available', () => {
        // Create a new chart object without canvas for this test
        const chartWithoutCanvas = {
            ...mockChart,
            canvas: null,
        } as unknown as Chart

        highlightTimeRanges.afterDraw?.(
            chartWithoutCanvas,
            {},
            {
                timeRanges: [[moment(), moment()]],
                defaultColor: 'red',
                highlightColor: 'blue',
            },
        )

        expect(mockContext.fillRect).not.toHaveBeenCalled()
    })

    it('should not draw anything if timeRanges is not provided', () => {
        highlightTimeRanges.afterDraw?.(
            mockChart,
            {},
            {
                timeRanges: undefined,
                defaultColor: 'red',
                highlightColor: 'blue',
            },
        )

        expect(mockContext.fillRect).not.toHaveBeenCalled()
    })

    it('should use default colors if not provided', () => {
        const timeRanges = [[moment(), moment().add(1, 'hour')]]
        highlightTimeRanges.afterDraw?.(mockChart, {}, { timeRanges })

        expect(mockContext.fillStyle).toBe(
            colorTokens.classic.neutral.grey_2.value,
        )
    })

    it('should draw highlight rectangles for valid time ranges', () => {
        const startTime = moment().startOf('day')
        const endTime = moment().startOf('day').add(1, 'hour')
        const timeRanges = [[startTime, endTime]]

        highlightTimeRanges.afterDraw?.(
            mockChart,
            {},
            {
                timeRanges,
                defaultColor: 'red',
                highlightColor: 'blue',
            },
        )

        expect(mockContext.save).toHaveBeenCalled()
        expect(mockContext.restore).toHaveBeenCalled()
        expect(mockContext.fillRect).toHaveBeenCalled()
    })

    it('should handle invalid time ranges gracefully', () => {
        const timeRanges = [
            [moment().add(24, 'hours'), moment().add(25, 'hours')],
        ]

        highlightTimeRanges.afterDraw?.(
            mockChart,
            {},
            {
                timeRanges,
                defaultColor: 'red',
                highlightColor: 'blue',
            },
        )

        expect(mockContext.fillRect).toHaveBeenCalled()
    })

    it('should apply correct composite operations', () => {
        const timeRanges = [[moment(), moment().add(1, 'hour')]]

        highlightTimeRanges.afterDraw?.(
            mockChart,
            {},
            {
                timeRanges,
                defaultColor: 'red',
                highlightColor: 'blue',
            },
        )

        expect(mockContext.globalCompositeOperation).toBe('destination-over')
    })
})
