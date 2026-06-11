import type { Chart } from 'chart.js'

import { GreyArea } from 'domains/reporting/pages/common/components/charts/ChartPluginGreyArea'

describe('GreyArea plugin', () => {
    let mockChart: Chart
    let mockCtx: CanvasRenderingContext2D

    beforeEach(() => {
        mockCtx = {
            save: jest.fn(),
            restore: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            closePath: jest.fn(),
            setLineDash: jest.fn(),
            strokeStyle: '',
            lineWidth: 0,
        } as unknown as CanvasRenderingContext2D

        mockChart = {
            ctx: mockCtx,
            chartArea: { top: 0, bottom: 100, left: 0, right: 200 },
            data: { labels: ['2024-01', '2024-02', '2024-03'] },
            config: {
                options: {
                    plugins: {
                        greyArea: { start: '2024-01', end: '2024-02' },
                    },
                },
            },
            scales: {
                x: {
                    getPixelForValue: jest
                        .fn()
                        .mockImplementation((i) => i * 50),
                },
            },
        } as unknown as Chart
    })

    it('should return early when chartArea is undefined', () => {
        const chart = {
            ...mockChart,
            chartArea: undefined,
        } as unknown as Chart

        expect(() => GreyArea.beforeDraw(chart)).not.toThrow()
        expect(mockCtx.beginPath).not.toHaveBeenCalled()
    })

    it('should return early when labels are missing', () => {
        const chart = {
            ...mockChart,
            data: { labels: undefined },
        } as unknown as Chart

        expect(() => GreyArea.beforeDraw(chart)).not.toThrow()
        expect(mockCtx.beginPath).not.toHaveBeenCalled()
    })

    it('should return early when greyArea start is missing', () => {
        const chart = {
            ...mockChart,
            config: {
                options: {
                    plugins: { greyArea: { start: '', end: '2024-02' } },
                },
            },
        } as unknown as Chart

        expect(() => GreyArea.beforeDraw(chart)).not.toThrow()
        expect(mockCtx.beginPath).not.toHaveBeenCalled()
    })

    it('should return early when greyArea end is missing', () => {
        const chart = {
            ...mockChart,
            config: {
                options: {
                    plugins: { greyArea: { start: '2024-01', end: '' } },
                },
            },
        } as unknown as Chart

        expect(() => GreyArea.beforeDraw(chart)).not.toThrow()
        expect(mockCtx.beginPath).not.toHaveBeenCalled()
    })

    it('should draw when all required data is present', () => {
        GreyArea.beforeDraw(mockChart)

        expect(mockCtx.beginPath).toHaveBeenCalled()
        expect(mockCtx.stroke).toHaveBeenCalled()
    })
})
