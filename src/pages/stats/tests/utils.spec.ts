import {ChartArea} from 'chart.js'

import {getGradient} from '../utils'

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
