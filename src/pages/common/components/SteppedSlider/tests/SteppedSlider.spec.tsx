import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'

import {SteppedSlider} from '../SteppedSlider'

describe('SteppedSlider', () => {
    const defaultProps = {
        steps: [
            {key: 'step1', label: 'Start'},
            {key: 'step2', label: 'Two'},
            {key: 'step3', label: 'Three'},
            {key: 'step4', label: 'Four'},
            {key: 'step5', label: 'End'},
        ],
        stepKey: 'step3',
        color: 'var(--accessory-magenta-3)',
        backgroundColor: 'var(--accessory-magenta-2)',
        onChange: jest.fn(),
    }
    const trackRect = {
        left: 0,
        width: 400,
        right: 400,
        top: 0,
        bottom: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
    }

    it('renders correctly with default props', () => {
        render(<SteppedSlider {...defaultProps} />)

        expect(screen.getByText('Start')).toBeInTheDocument()
        expect(screen.getByText('End')).toBeInTheDocument()

        const stepMarks = document.querySelectorAll('.stepMark')
        expect(stepMarks).toHaveLength(5)
    })

    it('shows tooltip on handle hover', () => {
        render(<SteppedSlider {...defaultProps} />)

        const handle = document.querySelector('.handle')
        expect(handle).toBeInTheDocument()

        fireEvent.mouseEnter(handle!)

        expect(screen.getByText('Three')).toBeInTheDocument()

        fireEvent.mouseLeave(handle!)
    })

    it('calls onChange when clicking on track', () => {
        render(<SteppedSlider {...defaultProps} />)

        const track = document.querySelector('.track')
        expect(track).toBeInTheDocument()

        // Mock getBoundingClientRect for the track
        const trackRect = {
            left: 0,
            width: 400,
            right: 400,
            top: 0,
            bottom: 0,
            height: 0,
            x: 0,
            y: 0,
            toJSON: () => {},
        }
        track!.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)

        // Click at 80% of track width (should select step 4)
        fireEvent.click(track!, {
            clientX: 320, // 80% of 400px
        })

        expect(defaultProps.onChange).toHaveBeenCalledWith('step4')
    })

    it('accepts custom color', () => {
        render(<SteppedSlider {...defaultProps} color="var(--primary)" />)

        const handle = document.querySelector('.handle')
        expect(handle).toHaveStyle('background-color: var(--primary)')
    })

    it('handles drag interactions', () => {
        render(<SteppedSlider {...defaultProps} />)

        const handle = document.querySelector('.handle')
        expect(handle).toBeInTheDocument()

        // Mock getBoundingClientRect
        const track = document.querySelector('.track')
        track!.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)

        // Start dragging
        fireEvent.mouseDown(handle!)

        // Move to 20% of track width (should select step 1)
        fireEvent.mouseMove(window, {
            clientX: 80, // 20% of 400px
        })

        expect(defaultProps.onChange).toHaveBeenCalledWith('step2')

        // End dragging
        fireEvent.mouseUp(window)
    })

    it('constrains values within valid range', () => {
        render(<SteppedSlider {...defaultProps} />)

        const track = document.querySelector('.track')
        track!.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)

        // Try clicking beyond the end of track
        fireEvent.click(track!, {
            clientX: 500,
        })

        // Should be constrained to last step
        expect(defaultProps.onChange).toHaveBeenCalledWith('step5')

        // Try clicking before start of track
        fireEvent.click(track!, {
            clientX: -100,
        })

        // Should be constrained to first step
        expect(defaultProps.onChange).toHaveBeenCalledWith('step1')
    })
})
