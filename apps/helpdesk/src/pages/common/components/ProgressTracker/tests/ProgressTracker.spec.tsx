import React from 'react'

import { render } from '@testing-library/react'

import { Button } from '@gorgias/axiom'

import ProgressTracker from '../ProgressTracker'
import TrackerCircle from '../TrackerCircle'

jest.mock('../TrackerCircle', () =>
    jest.fn(() => <div data-testid="tracker-circle" />),
)

describe('ProgressTracker', () => {
    const defaultProps = {
        stepLabel: 'Step',
        step: 3,
        totalSteps: 8,
        stepTrackerColor: '#C34CED',
        cta: (
            <>
                <Button variant="secondary">Back</Button>
                <Button variant="primary">Next</Button>
            </>
        ),
    }

    it('should render the progress tracker', () => {
        render(<ProgressTracker {...defaultProps} />)
        const progressTracker = document.querySelector('div')
        expect(progressTracker).toBeInTheDocument()
    })

    it('should render the TrackerCircle component with correct props', () => {
        render(<ProgressTracker {...defaultProps} />)
        expect(TrackerCircle).toHaveBeenCalledWith(
            expect.objectContaining({
                percentage: (defaultProps.step / defaultProps.totalSteps) * 100,
                color: defaultProps.stepTrackerColor,
            }),
            {},
        )
    })

    it('should render the step label and count', () => {
        const { getByText } = render(
            <ProgressTracker {...defaultProps} stepLabel="Steps" />,
        )

        expect(getByText('Steps 3/8')).toBeInTheDocument()
    })

    it('should render without the step label', () => {
        const { getByText, queryAllByText } = render(
            <ProgressTracker {...defaultProps} stepLabel={undefined} />,
        )

        expect(getByText('3/8')).toBeInTheDocument()
        expect(queryAllByText('Step')).toHaveLength(0)
    })

    it('should render the CTA buttons', () => {
        const { getByText } = render(<ProgressTracker {...defaultProps} />)

        expect(getByText('Back')).toBeInTheDocument()
        expect(getByText('Next')).toBeInTheDocument()
    })
})
