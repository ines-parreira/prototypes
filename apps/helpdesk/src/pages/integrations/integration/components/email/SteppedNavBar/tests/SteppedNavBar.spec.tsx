import type React from 'react'

import { cleanup, render, screen, within } from '@testing-library/react'

import SteppedNavBar from '../SteppedNavBar'

describe('SteppedNavBar', () => {
    const renderComponent = (
        props: Partial<React.ComponentProps<typeof SteppedNavBar>> = {},
    ) =>
        render(
            <SteppedNavBar
                activeStep={0}
                steps={[
                    { name: 'Email forwarding', isComplete: true },
                    { name: 'Outbound verification', isComplete: false },
                ]}
                {...props}
            />,
        )

    afterEach(cleanup)

    it('should render correctly', () => {
        renderComponent()

        expect(screen.getByText('Email forwarding')).toBeInTheDocument()
        expect(screen.getByText('Outbound verification')).toBeInTheDocument()
    })

    it('should highlight the active step', () => {
        renderComponent({ activeStep: 1 })

        expect(
            screen.getByText('Outbound verification').parentElement,
        ).toHaveClass('active')
    })

    it('should display check mark for completed steps', () => {
        renderComponent({ activeStep: 1 })

        const checkIcon = within(
            screen.getByText('Email forwarding').parentElement!,
        ).getByTestId('check-icon')
        expect(checkIcon).toBeVisible()
    })

    it('should display index instead of checkmark when a step is both completed and active', () => {
        renderComponent({ activeStep: 0 })

        const stepContainer =
            screen.getByText('Email forwarding').parentElement!
        const checkIcon = within(stepContainer).queryByTestId('check-icon')
        expect(checkIcon).toBeNull()
        expect(stepContainer).toHaveTextContent('1')
    })
})
