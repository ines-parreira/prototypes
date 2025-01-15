import {render} from '@testing-library/react'
import React from 'react'

import {relativeLighten} from 'gorgias-design-system/utils'

import TrackerCircle from '../TrackerCircle'

jest.mock('gorgias-design-system/utils', () => ({
    relativeLighten: jest.fn(),
}))

describe('TrackerCircle', () => {
    const color = '#C34CED'
    const lightenedColor = '#E6A8F5'
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

    it('should call relativeLighten with the correct arguments', () => {
        render(<TrackerCircle color={color} percentage={percentage} />)
        expect(relativeLighten).toHaveBeenCalledWith(color, 0.5)
    })

    it('should render the Circle components with correct props', () => {
        render(<TrackerCircle color={color} percentage={percentage} />)
        const circles = document.querySelectorAll('circle')
        expect(circles[0]).toHaveAttribute('stroke', lightenedColor)
        expect(circles[1]).toHaveAttribute('stroke', color)
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
})
