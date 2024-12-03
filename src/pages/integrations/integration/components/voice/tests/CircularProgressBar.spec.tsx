import {render} from '@testing-library/react'
import React from 'react'

import CircularProgressBar from '../CircularProgressBar'

describe('CircularProgressBar', () => {
    it.each([
        {
            input: {size: 20, thickness: 2, progress: 0.5},
            expectedAttributes: {
                svgViewBox: '0 0 20 20',
                circleCx: '10',
                circleCy: '10',
                circleR: '8',
                circleStrokeWidth: '2',
                circleStrokeDasharray: '25.132741228718345 25.132741228718345',
            },
        },
        {
            input: {size: 12, thickness: 5, progress: 0.2},
            expectedAttributes: {
                svgViewBox: '0 0 12 12',
                circleCx: '6',
                circleCy: '6',
                circleR: '1',
                circleStrokeWidth: '5',
                circleStrokeDasharray: '1.2566370614359172 5.026548245743669',
            },
        },
    ])('should render correctly', ({input, expectedAttributes}) => {
        const {container} = render(
            <CircularProgressBar
                size={input.size}
                thickness={input.thickness}
                progress={input.progress}
            />
        )

        const svg = container.querySelector('svg')
        const circles = container.querySelectorAll('circle')

        expect(svg).toBeInTheDocument()
        expect(svg).toHaveAttribute('viewBox', expectedAttributes.svgViewBox)
        expect(circles.length).toBe(2)

        const [backgroundCircle, foregroundCircle] = circles

        expect(backgroundCircle).toHaveAttribute(
            'class',
            expect.stringContaining('circleBackground')
        )
        expect(backgroundCircle).toHaveAttribute(
            'cx',
            expectedAttributes.circleCx
        )
        expect(backgroundCircle).toHaveAttribute(
            'cy',
            expectedAttributes.circleCy
        )
        expect(backgroundCircle).toHaveAttribute(
            'r',
            expectedAttributes.circleR
        )
        expect(backgroundCircle).toHaveAttribute(
            'stroke-width',
            expectedAttributes.circleStrokeWidth
        )

        expect(foregroundCircle).toHaveAttribute(
            'class',
            expect.stringContaining('circleForeground')
        )
        expect(foregroundCircle).toHaveAttribute(
            'cx',
            expectedAttributes.circleCx
        )
        expect(foregroundCircle).toHaveAttribute(
            'cy',
            expectedAttributes.circleCy
        )
        expect(foregroundCircle).toHaveAttribute(
            'r',
            expectedAttributes.circleR
        )
        expect(foregroundCircle).toHaveAttribute(
            'stroke-width',
            expectedAttributes.circleStrokeWidth
        )
        expect(foregroundCircle).toHaveAttribute(
            'stroke-dasharray',
            expectedAttributes.circleStrokeDasharray
        )
    })
})
