import React from 'react'
import {render} from '@testing-library/react'
import routerDom, {BrowserRouter, useParams} from 'react-router-dom'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {assumeMock} from 'utils/testing'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {channelConnection} from 'fixtures/channelConnection'
import {useListCampaigns} from 'models/convert/campaign/queries'
import {campaign} from 'fixtures/campaign'
import {useCreateCampaign} from 'pages/convert/campaigns/hooks/useCreateCampaign'
import {useUpdateCampaign} from 'pages/convert/campaigns/hooks/useUpdateCampaign'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {PRODUCT_CARD_SHOWCASE} from 'pages/convert/campaigns/templates/productCards'
import CampaignTemplateCustomizeView from '../CampaignTemplateCustomizeView'

const mockStore = configureMockStore()

jest.mock('pages/settings/revenue/hooks/useGetConvertStatus')
jest.mock('pages/common/forms/RichField/RichFieldEditor')

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection
)

jest.mock('models/convert/campaign/queries')
const useListCampaignMock = assumeMock(useListCampaigns)

jest.mock('pages/convert/campaigns/hooks/useCreateCampaign')
const useCreateCampaignMock = assumeMock(useCreateCampaign)

jest.mock('pages/convert/campaigns/hooks/useUpdateCampaign')
const useUpdateCampaignMock = assumeMock(useUpdateCampaign)

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))

jest.mock(
    'pages/settings/new_billing/components/ConvertSubscriptionModal',
    () => {
        return jest.fn(() => {
            return <div data-testid="mock-convert-subscription-modal" />
        })
    }
)

const defaultState = {
    integrations: fromJS({
        integrations: [{id: 123, type: 'gorgias_chat', meta: {}}],
    }),
}

describe('CampaignTemplateCustomizeView', () => {
    it('should render campaign form with template data', () => {
        ;(useParams as jest.Mock).mockReturnValue({
            id: '123',
            templateSlug: PRODUCT_CARD_SHOWCASE.slug,
        })
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection,
        } as any)
        useListCampaignMock.mockReturnValue({
            data: [campaign],
            isLoading: false,
            isError: false,
        } as any)
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
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)

        const {getByText} = render(
            <BrowserRouter>
                <Provider store={mockStore(defaultState)}>
                    <CampaignTemplateCustomizeView />
                </Provider>
            </BrowserRouter>
        )

        expect(getByText('Showcase products to cross-sell')).toBeInTheDocument()
        expect(getByText('our fan-favorite selection')).toBeInTheDocument()
    })
})
