import React from 'react'
import {mockFlags} from 'jest-launchdarkly-mock'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {FeatureFlagKey} from '../../../../../config/featureFlags'
import {PreviewChannelButton} from '../PreviewChannelButton'
import {SelfServiceChannel} from '../../../../automation/common/hooks/useSelfServiceChannels'
import {TicketChannel} from '../../../../../business/types/ticket'
import {getHelpCentersResponseFixture} from '../../../helpCenter/fixtures/getHelpCentersResponse.fixture'

mockFlags({
    [FeatureFlagKey.AAOPreviewMode]: true,
})

const helpCenter = getHelpCentersResponseFixture.data[0]

const renderComponent = ({channel}: {channel?: SelfServiceChannel}) => {
    return render(<PreviewChannelButton url="/test" channel={channel} />)
}

describe('<PreviewChannelButton />', () => {
    it('should render button', () => {
        renderComponent({})

        expect(screen.getByText('Try it live')).toBeInTheDocument()
    })

    it('should show disable message when help center not published', async () => {
        renderComponent({
            channel: {
                type: TicketChannel.HelpCenter,
                value: {...helpCenter, deactivated_datetime: 'random_time'},
            },
        })

        expect(screen.getByTestId('preview-button')).toHaveClass('isDisabled')

        userEvent.hover(screen.getByTestId('preview-button'))

        await waitFor(() =>
            expect(
                screen.getByTestId('preview-button-tooltip')
            ).toHaveTextContent(
                'Your Help Center must be published to view it.'
            )
        )
    })
})
