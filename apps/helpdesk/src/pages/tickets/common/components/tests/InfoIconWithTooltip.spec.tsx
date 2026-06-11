import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { InfoIconWithTooltip } from '../InfoIconWithTooltip'

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

        expect(screen.getByText('info_outline')).toBeInTheDocument()
    })

    it('renders the Tooltip component with the correct content', async () => {
        const user = userEvent.setup()
        render(
            <InfoIconWithTooltip
                id={id}
                tooltipProps={{ autohide: true, placement: 'bottom' }}
            >
                Tooltip content here
            </InfoIconWithTooltip>,
        )

        await user.hover(screen.getByText('info_outline'))

        const tooltip = await screen.findByRole('tooltip')
        expect(tooltip).toHaveTextContent('Tooltip content here')
    })

    it('renders the children inside the Tooltip', async () => {
        const user = userEvent.setup()
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

        await user.hover(screen.getByText('info_outline'))

        const tooltip = await screen.findByRole('tooltip')
        expect(tooltip).toHaveTextContent(
            'Provide feedback on the resources AI Agent',
        )
        expect(tooltip).toHaveTextContent('1. Use thumbs up/down to indicate')
    })
})
