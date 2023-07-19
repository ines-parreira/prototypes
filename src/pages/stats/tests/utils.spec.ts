import {ChartArea, TooltipItem} from 'chart.js'

import {
    getGradient,
    renderTickLabelAsNumber,
    renderTickLabelAsPercentage,
    renderTooltipLabelAsPercentage,
} from '../utils'

describe('getGradient', () => {
    it('should return color if canvasArea or canvasContext is not defined', () => {
        const color = 'red'

        expect(getGradient(color)).toEqual(color)
    })

    it('should return gradient if canvasArea and canvasContext are defined', () => {
        const color = 'red'
        const canvasArea = {bottom: 100} as ChartArea
        const linearGradient = {addColorStop: jest.fn()}
        const canvasContext = {
            createLinearGradient: jest.fn(() => linearGradient),
        } as any as CanvasRenderingContext2D

        expect(getGradient(color, canvasArea, canvasContext)).toEqual(
            linearGradient
        )
        expect(canvasContext.createLinearGradient).toHaveBeenCalledWith(
            0,
            0,
            0,
            100
        )
    })
})

describe('renderTooltipLabelAsPercentage', () => {
    const baseContext = {
        dataset: {label: 'label'},
        parsed: {y: 50},
    } as any as TooltipItem<'line'>

    it('should return formatted label', function () {
        expect(renderTooltipLabelAsPercentage(baseContext)).toEqual(
            'label: 50%'
        )
    })

    it('should return label if y is null', function () {
        const context = {
            ...baseContext,
            parsed: {y: null},
        } as any as TooltipItem<'line'>

        expect(renderTooltipLabelAsPercentage(context)).toEqual('label')
    })

    it('should return label if y is undefined', function () {
        const context = {
            ...baseContext,
            parsed: {},
        } as any as TooltipItem<'line'>

        expect(renderTooltipLabelAsPercentage(context)).toEqual('label')
    })

    it('should return formatted value if label is not defined', function () {
        const context = {
            ...baseContext,
            dataset: {},
        } as any as TooltipItem<'line'>

        expect(renderTooltipLabelAsPercentage(context)).toEqual('50%')
    })
})

describe('renderTickLabelAsPercentage', () => {
    it.each([
        [50, '50%'],
        [-50, '-50%'],
        [0, '0%'],
        ['rainbow', 'rainbow'],
    ])('For %p should return formatted as %p', (value, expected) => {
        expect(renderTickLabelAsPercentage(value)).toEqual(expected)
    })
})

describe('renderTickLabelAsNumber', () => {
    it.each([
        [50, '50'],
        [-50, '-50'],
        [0, '0'],
        ['rainbow', 'rainbow'],
    ])('For %p should return formatted as %p', (value, expected) => {
        expect(renderTickLabelAsNumber(value)).toEqual(expected)
    })
})
