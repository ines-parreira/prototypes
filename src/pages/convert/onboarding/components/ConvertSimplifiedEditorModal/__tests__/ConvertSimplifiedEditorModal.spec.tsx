import React from 'react'

import {fromJS} from 'immutable'
import {render, waitFor} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'

import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {
    useCreateCampaign,
    useUpdateCampaign,
} from 'models/convert/campaign/queries'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {channelConnection} from 'fixtures/channelConnection'
import {integrationsState} from 'fixtures/integrations'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {RootState, StoreDispatch} from 'state/types'

import {assumeMock} from 'utils/testing'
import {getLDClient} from 'utils/launchDarkly'

import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {CART_ABANDONMENT} from 'pages/convert/campaigns/templates/onboarding/cartAbandonment'

import ConvertSimplifiedEditorModal from '../ConvertSimplifiedEditorModal'

jest.mock('pages/common/forms/RichField/RichFieldEditor')

jest.mock('models/convert/campaign/queries')
const useCreateCampaignMock = assumeMock(useCreateCampaign)
const useUpdateCampaignMock = assumeMock(useUpdateCampaign)

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection
)

jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: fromJS(integrationsState),
}

const integration = fromJS({
    id: '1',
    meta: {
        languages: [{language: 'en-US', primary: true}],
        shop_type: 'shopify',
    },
})

const queryClient = mockQueryClient()

describe('<ConvertSimplifiedEditorModal />', () => {
    beforeAll(() => {
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)

        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)

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
    })

    it('renders a template', async () => {
        const {getByText} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <ConvertSimplifiedEditorModal
                        isOpen={true}
                        integration={integration}
                        template={CART_ABANDONMENT}
                        estimatedRevenue={'estimated revenue'}
                        onClose={jest.fn()}
                        campaign={undefined}
                    />
                </Provider>
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(getByText('Prevent Cart Abandonment')).toBeTruthy()
            expect(getByText(/Do you have any questions/)).toBeTruthy()
        })
    })

    it('renders a existing campaign', async () => {
        const campaign = {
            id: '1',
            message_text: 'Lorem Ipsum',
            message_html: '<p>Lorem Ipsum</p>',
        } as Campaign

        const {getByText} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <ConvertSimplifiedEditorModal
                        isOpen={true}
                        integration={integration}
                        template={CART_ABANDONMENT}
                        estimatedRevenue={'estimated revenue'}
                        onClose={jest.fn()}
                        campaign={campaign}
                    />
                </Provider>
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(getByText('Prevent Cart Abandonment')).toBeTruthy() // There is no option to edit name
            expect(getByText('Lorem Ipsum')).toBeTruthy()
        })
    })
})
