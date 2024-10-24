import {QueryClientProvider} from '@tanstack/react-query'
import {render, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {AttachmentEnum} from 'common/types'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {campaignProductRecommendationAttachment} from 'fixtures/campaign'
import {channelConnection} from 'fixtures/channelConnection'
import {integrationsState} from 'fixtures/integrations'
import {
    useCreateCampaign,
    useUpdateCampaign,
} from 'models/convert/campaign/queries'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {CART_ABANDONMENT} from 'pages/convert/campaigns/templates/onboarding/cartAbandonment'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'

import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {getNewMessageAttachments} from 'state/newMessage/selectors'
import {RootState, StoreDispatch} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {getLDClient} from 'utils/launchDarkly'
import {assumeMock} from 'utils/testing'

import ConvertSimplifiedEditorModal from '../ConvertSimplifiedEditorModal'

jest.mock('pages/common/forms/RichField/RichFieldEditor')

jest.mock('models/convert/campaign/queries')
const useCreateCampaignMock = assumeMock(useCreateCampaign)
const useUpdateCampaignMock = assumeMock(useUpdateCampaign)

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection
)

jest.mock('state/newMessage/selectors')
const getNewMessageAttachmentsMock = assumeMock(getNewMessageAttachments)

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

const campaign = {
    id: '1',
    message_text: 'Lorem Ipsum',
    message_html: '<p>Lorem Ipsum</p>',
} as Campaign

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

        getNewMessageAttachmentsMock.mockReturnValue(fromJS([]))
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

    it('renders the banner when product recommendation is in attachments', async () => {
        getNewMessageAttachmentsMock.mockReturnValue(
            fromJS([
                {
                    ...campaignProductRecommendationAttachment,
                    content_type: AttachmentEnum.ProductRecommendation,
                },
            ])
        )

        const {queryByText} = render(
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
            expect(
                queryByText(
                    'Product recommendations will be personalized for each product page',
                    {
                        exact: false,
                    }
                )
            ).toBeInTheDocument()
        })
    })
})
