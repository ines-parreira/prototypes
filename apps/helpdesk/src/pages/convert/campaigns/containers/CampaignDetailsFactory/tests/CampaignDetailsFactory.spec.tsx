import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import type * as ReactRouterDom from 'react-router-dom'
import { useParams } from 'react-router-dom'

import { campaign } from 'fixtures/campaign'
import { channelConnection } from 'fixtures/channelConnection'
import { entitiesInitialState } from 'fixtures/entities'
import { integrationsState } from 'fixtures/integrations'
import {
    useCreateCampaign,
    useDeleteCampaign,
    useGetCampaign,
    useListCampaigns,
    useUpdateCampaign,
} from 'models/convert/campaign/queries'
import * as revenueBetaHook from 'pages/common/hooks/useIsConvertSubscriber'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import type { RootState } from 'state/types'

import { CampaignDetailsFactory } from '../CampaignDetailsFactory'

jest.mock('pages/convert/common/hooks/useContactFormFlag')
jest.mock('pages/convert/common/components/ConvertSubscriptionModal', () => {
    return {
        ConvertSubscriptionModal: jest.fn(() => {
            return <div data-testid="mock-convert-subscription-modal" />
        }),
    }
})
jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof ReactRouterDom),
    useParams: jest.fn(),
}))

const useParamsMock = useParams as jest.MockedFunction<typeof useParams>
jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection,
)

jest.mock('models/convert/campaign/queries')
const useListCampaignsMock = assumeMock(useListCampaigns)
const useGetCampaignMock = assumeMock(useGetCampaign)
const useCreateCampaignMock = assumeMock(useCreateCampaign)
const useUpdateCampaignMock = assumeMock(useUpdateCampaign)
const useDeleteCampaignMock = assumeMock(useDeleteCampaign)

jest.mock('pages/common/forms/RichField/RichFieldEditor')

describe('<CampaignDetailsFactory />', () => {
    const defaultState = {
        entities: entitiesInitialState,
        integrations: fromJS(integrationsState),
    } as RootState

    beforeEach(() => {
        useParamsMock.mockReturnValue({
            id: '8', // Gorgias chat
            campaignId: '1',
        })
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)
        useListCampaignsMock.mockReturnValue({ data: [campaign] } as any)
        useGetCampaignMock.mockReturnValue({ data: campaign } as any)
        useCreateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: jest.fn(),
            } as unknown as ReturnType<typeof useCreateCampaign>
        })
        useUpdateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: jest.fn(),
            } as unknown as ReturnType<typeof useUpdateCampaign>
        })
        useDeleteCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: jest.fn(),
            } as unknown as ReturnType<typeof useDeleteCampaign>
        })
    })

    const renderComponent = () => {
        return render(<CampaignDetailsFactory />, { storeState: defaultState })
    }

    it('renders the "AdvancedCampaignDetails" component if merchant is not a revenue subscriber', () => {
        jest.spyOn(
            revenueBetaHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => true)

        renderComponent()

        screen.getByText(campaign.name)
    })

    it('renders the "AdvancedCampaignDetails" component if merchant is a revenue subscriber', () => {
        jest.spyOn(
            revenueBetaHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => false)

        renderComponent()

        screen.getByText(campaign.name)
    })
})
