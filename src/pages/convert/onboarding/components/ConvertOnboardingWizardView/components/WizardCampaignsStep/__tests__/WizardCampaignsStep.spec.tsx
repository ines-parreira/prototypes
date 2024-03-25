import React from 'react'
import {render} from '@testing-library/react'
import {Map} from 'immutable'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {useListCampaigns} from 'models/convert/campaign/queries'
import {assumeMock} from 'utils/testing'
import {channelConnection} from 'fixtures/channelConnection'
import {campaign} from 'fixtures/campaign'
import {ONBOARDING_CAMPAIGN_TEMPLATES_LIST} from 'pages/convert/campaigns/templates'
import WizardCampaignsStep from '../WizardCampaignsStep'

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection
)

jest.mock('models/convert/campaign/queries')
const useListCampaignMock = assumeMock(useListCampaigns)

describe('WizardCampaignsStep', () => {
    const integration = Map({
        id: 123,
    })

    beforeEach(() => {
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)

        useListCampaignMock.mockReturnValue({
            data: [campaign],
            isLoading: false,
            isError: false,
        } as any)
    })

    test('renders correctly with campaign templates', () => {
        const {getByText} = render(
            <WizardCampaignsStep integration={integration} />
        )

        expect(
            getByText('Here are our recommended campaigns for you:')
        ).toBeInTheDocument()

        ONBOARDING_CAMPAIGN_TEMPLATES_LIST.map((template) => {
            expect(getByText(template.name)).toBeInTheDocument()
        })
    })
})
