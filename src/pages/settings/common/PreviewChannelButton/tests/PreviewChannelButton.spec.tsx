import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TicketChannel } from '../../../../../business/types/ticket'
import { SelfServiceChannel } from '../../../../automate/common/hooks/useSelfServiceChannels'
import { getHelpCentersResponseFixture } from '../../../helpCenter/fixtures/getHelpCentersResponse.fixture'
import { PreviewChannelButton } from '../PreviewChannelButton'

const helpCenter = getHelpCentersResponseFixture.data[0]

const renderComponent = ({ channel }: { channel?: SelfServiceChannel }) => {
    return render(<PreviewChannelButton url="/test" channel={channel} />)
}

describe('<PreviewChannelButton />', () => {
    it('should render button', () => {
        renderComponent({})

        expect(screen.getByText('Test')).toBeInTheDocument()
    })

    it('should show disable message when help center not published', async () => {
        renderComponent({
            channel: {
                type: TicketChannel.HelpCenter,
                value: { ...helpCenter, deactivated_datetime: 'random_time' },
            },
        })

        const button = screen.getByRole('button', { name: /Test/ })
        expect(button).toBeAriaDisabled()

        fireEvent.mouseOver(button)

        await waitFor(() =>
            expect(document.querySelector('.tooltip')).toHaveTextContent(
                'Your Help Center must be published to view it.',
            ),
        )
    })
})
