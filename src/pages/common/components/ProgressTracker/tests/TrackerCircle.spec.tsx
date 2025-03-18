import React from 'react'

import { render } from '@testing-library/react'

import { relativeLighten } from 'gorgias-design-system/utils'

import TrackerCircle from '../TrackerCircle'

jest.mock('gorgias-design-system/utils', () => ({
    relativeLighten: jest.fn(),
}))

describe('TrackerCircle', () => {
    const color = '#C34CED'
    const percentage = 50

    beforeEach(() => {
        ;(relativeLighten as jest.Mock).mockReturnValue('#E6A8F5')
    })

    it('should render the SVG element', () => {
        render(<TrackerCircle color={color} percentage={percentage} />)
        const svg = document.querySelector('svg')
        expect(svg).toBeInTheDocument()
    })

    it('should render two Circle components', () => {
        render(<TrackerCircle color={color} percentage={percentage} />)
        const circles = document.querySelectorAll('circle')
        expect(circles).toHaveLength(2)
    })

    it('should render the Circle components with correct props', () => {
        render(<TrackerCircle color={color} percentage={percentage} />)
        const circles = document.querySelectorAll('circle')
        expect(circles[0]).toHaveAttribute('stroke-opacity', '0.32')
        expect(circles[1]).toHaveAttribute('stroke', color)
        expect(circles[1]).toHaveAttribute('stroke-width', '4.8')
    })

    it('should handle percentage greater than 100', () => {
        render(<TrackerCircle color={color} percentage={150} />)
        const circles = document.querySelectorAll('circle')
        expect(circles[1]).toHaveAttribute('stroke-dashoffset', '0')
    })

    it('should handle percentage less than 0', () => {
        render(<TrackerCircle color={color} percentage={-10} />)
        const circles = document.querySelectorAll('circle')
        expect(circles[1]).toHaveAttribute('stroke-dashoffset', '0')
    })

    it('should set stroke-width when given', () => {
        render(
            <TrackerCircle
                color={color}
                percentage={percentage}
                strokeWidth={12}
            />,
        )
        const circles = document.querySelectorAll('circle')
        expect(circles[1]).toHaveAttribute('stroke-width', '12')
    })
})
