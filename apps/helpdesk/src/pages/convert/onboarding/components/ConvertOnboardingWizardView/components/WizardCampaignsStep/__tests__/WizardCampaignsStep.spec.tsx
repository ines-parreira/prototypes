import React from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { campaign } from 'fixtures/campaign'
import { channelConnection } from 'fixtures/channelConnection'
import { useListCampaigns } from 'models/convert/campaign/queries'
import { ONBOARDING_CAMPAIGN_TEMPLATES_LIST } from 'pages/convert/campaigns/templates'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import WizardCampaignsStep from '../WizardCampaignsStep'

jest.mock(
    'pages/convert/onboarding/components/ConvertSimplifiedEditorModal',
    () => {
        return jest.fn(() => {
            return <div data-testid="mock-simplified-editor-modal" />
        })
    },
)

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection,
)

jest.mock('models/convert/campaign/queries')
const useListCampaignMock = assumeMock(useListCampaigns)

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
}

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
        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <WizardCampaignsStep integration={integration} />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            getByText('Here are our recommended campaigns for you:'),
        ).toBeInTheDocument()

        ONBOARDING_CAMPAIGN_TEMPLATES_LIST.map((template) => {
            expect(getByText(template.name)).toBeInTheDocument()
        })
    })
})
