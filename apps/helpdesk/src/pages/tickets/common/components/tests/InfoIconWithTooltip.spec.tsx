import React, { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'

import InfoIconWithTooltip from '../InfoIconWithTooltip'

// Mocking the StatsHelpIcon component
jest.mock(
    'domains/reporting/pages/common/components/StatsHelpIcon',
    () => () => <div data-testid="stats-help-icon" />,
)

// Mocking the Tooltip component
jest.mock('@gorgias/axiom', () => ({
    LegacyTooltip: ({ children }: { children: ReactNode }) => (
        <div data-testid="tooltip">{children}</div>
    ),
}))

describe('InfoIconWithTooltip Component', () => {
    const id = 'tooltip-message-feedback'

    it('renders the StatsHelpIcon component', () => {
        render(
            <InfoIconWithTooltip
                id={id}
                tooltipProps={{ autohide: true, placement: 'bottom' }}
            >
                Tooltip content here
            </InfoIconWithTooltip>,
        )

        expect(screen.getByTestId('stats-help-icon')).toBeInTheDocument()
    })

    it('renders the Tooltip component with the correct content', () => {
        render(
            <InfoIconWithTooltip
                id={id}
                tooltipProps={{ autohide: true, placement: 'bottom' }}
            >
                Tooltip content here
            </InfoIconWithTooltip>,
        )

        expect(screen.getByTestId('tooltip')).toHaveTextContent(
            'Tooltip content here',
        )
    })

    it('renders the children inside the Tooltip', () => {
        render(
            <InfoIconWithTooltip
                id={id}
                tooltipProps={{ autohide: true, placement: 'bottom' }}
            >
                <>
                    Provide feedback on the resources AI Agent used to improve
                    future responses:
                    <br /> 1. Use thumbs up/down to indicate if AI Agent used
                    the right resource
                    <br /> 2. Edit a resource if it didn’t work as expected
                </>
            </InfoIconWithTooltip>,
        )

        expect(screen.getByTestId('tooltip')).toHaveTextContent(
            'Provide feedback on the resources AI Agent',
        )
        expect(screen.getByTestId('tooltip')).toHaveTextContent(
            '1. Use thumbs up/down to indicate',
        )
    })
})
