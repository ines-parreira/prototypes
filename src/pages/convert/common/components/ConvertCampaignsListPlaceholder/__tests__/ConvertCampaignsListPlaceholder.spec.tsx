import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'

import {campaign} from 'fixtures/campaign'
import {channelConnection} from 'fixtures/channelConnection'
import useSearch from 'hooks/useSearch'
import {useListCampaigns} from 'models/convert/campaign/queries'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {assumeMock} from 'utils/testing'

import ConvertCampaignsListPlaceholder from '../ConvertCampaignsListPlaceholder'

jest.mock('hooks/useSearch')

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection
)

jest.mock('models/convert/campaign/queries')
const useListCampaignMock = assumeMock(useListCampaigns)

describe('<ConvertCampaignsListPlaceholder />', () => {
    const campaigns = [campaign]

    beforeEach(() => {
        ;(useSearch as jest.Mock).mockImplementation(() => ({}))
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)
        useListCampaignMock.mockReturnValue({
            data: campaigns,
            isLoading: false,
            isError: false,
        } as any)
    })

    const renderComponent = () =>
        render(
            <ConvertCampaignsListPlaceholder integration={fromJS({id: '1'})} />
        )

    it('should render correctly', () => {
        const {getByText} = renderComponent()

        expect(
            getByText('Campaigns displayed through this Chat:')
        ).toBeInTheDocument()
        expect(getByText('Edit in Convert Settings')).toBeInTheDocument()
        expect(getByText('Campaigns have a new home!')).toBeInTheDocument()
        expect(getByText(campaign.name)).toBeInTheDocument()
    })

    it('should render correctly without campaigns', () => {
        useListCampaignMock.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any)

        const {getByText} = renderComponent()

        expect(
            getByText("This integration doesn't display any campaigns yet.")
        ).toBeInTheDocument()
        expect(getByText('Edit in Convert Settings')).toBeInTheDocument()
        expect(getByText('Campaigns have a new home!')).toBeInTheDocument()
    })
})
