import React from 'react'

import {fromJS} from 'immutable'
import {render, waitFor} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'

import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {useCreateCampaign} from 'models/convert/campaign/queries'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {channelConnection} from 'fixtures/channelConnection'
import {integrationsState} from 'fixtures/integrations'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {RootState, StoreDispatch} from 'state/types'

import {assumeMock} from 'utils/testing'

import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {CART_ABANDONMENT} from 'pages/convert/campaigns/templates/onboarding/cartAbandonment'

import ConvertSimplifiedEditorModal from '../ConvertSimplifiedEditorModal'

jest.mock('pages/common/forms/RichField/RichFieldEditor')

jest.mock('models/convert/campaign/queries')
const useCreateCampaignMock = assumeMock(useCreateCampaign)

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection
)

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
    })

    it('renders', async () => {
        const {getByText} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <ConvertSimplifiedEditorModal
                        isOpen={true}
                        integration={integration}
                        template={CART_ABANDONMENT}
                        estimatedRevenue={'estimated revenue'}
                        onClose={jest.fn()}
                    />
                </Provider>
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(getByText('Prevent Cart Abandonment')).toBeTruthy()
        })
    })
})
