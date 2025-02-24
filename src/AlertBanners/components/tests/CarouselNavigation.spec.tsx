import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'

import {CarouselNavigation} from '../CarouselNavigation'

describe('CarouselNavigation', () => {
    const defaultProps = {
        onPrevious: jest.fn(),
        onNext: jest.fn(),
        currentIndex: 1,
        total: 3,
    }

    it('renders navigation buttons and counter', () => {
        render(<CarouselNavigation {...defaultProps} />)

        expect(screen.getByText('1 of 3')).toBeInTheDocument()
        expect(screen.getByText('chevron_right')).toBeInTheDocument()
        expect(screen.getByText('chevron_left')).toBeInTheDocument()
    })
    it('calls previousCallback when clicking previous button', () => {
        render(<CarouselNavigation {...defaultProps} />)

        fireEvent.click(screen.getByText('chevron_left'))
        expect(defaultProps.onPrevious).toHaveBeenCalledTimes(1)
    })
    it('calls nextCallback when clicking next button', () => {
        render(<CarouselNavigation {...defaultProps} />)

        fireEvent.click(screen.getByText('chevron_right'))
        expect(defaultProps.onNext).toHaveBeenCalledTimes(1)
    })

    it('displays correct counter for different indices', () => {
        const {rerender} = render(<CarouselNavigation {...defaultProps} />)
        expect(screen.getByText('1 of 3')).toBeInTheDocument()

        rerender(<CarouselNavigation {...defaultProps} currentIndex={2} />)
        expect(screen.getByText('2 of 3')).toBeInTheDocument()

        rerender(<CarouselNavigation {...defaultProps} currentIndex={3} />)
        expect(screen.getByText('3 of 3')).toBeInTheDocument()
    })

    it('should disable navigation when total is 1', () => {
        const props = {
            onPrevious: jest.fn(),
            onNext: jest.fn(),
            currentIndex: 0,
            total: 1,
        }

        render(<CarouselNavigation {...props} />)

        fireEvent.click(screen.getByText('chevron_left'))
        fireEvent.click(screen.getByText('chevron_right'))

        expect(props.onPrevious).not.toHaveBeenCalled()
        expect(props.onNext).not.toHaveBeenCalled()
    })

    it('should enable navigation when total is greater than 1', () => {
        const props = {
            onPrevious: jest.fn(),
            onNext: jest.fn(),
            currentIndex: 0,
            total: 2,
        }

        render(<CarouselNavigation {...props} />)

        fireEvent.click(screen.getByText('chevron_left'))
        fireEvent.click(screen.getByText('chevron_right'))

        expect(props.onPrevious).toHaveBeenCalledTimes(1)
        expect(props.onNext).toHaveBeenCalledTimes(1)
    })
})
