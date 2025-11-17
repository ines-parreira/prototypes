import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { AttachmentEnum } from 'common/types'
import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    campaign as campaignFixture,
    campaignProductRecommendationAttachment,
} from 'fixtures/campaign'
import { channelConnection } from 'fixtures/channelConnection'
import { integrationsStateWithShopify } from 'fixtures/integrations'
import {
    useCreateCampaign,
    useSuggestCampaignCopy,
    useUpdateCampaign,
} from 'models/convert/campaign/queries'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import { CART_ABANDONMENT } from 'pages/convert/campaigns/templates/onboarding/cartAbandonment'
import type { Campaign } from 'pages/convert/campaigns/types/Campaign'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import { getNewMessageAttachments } from 'state/newMessage/selectors'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import ConvertSimplifiedEditorModal from '../ConvertSimplifiedEditorModal'

jest.mock('pages/common/forms/RichField/RichFieldEditor')
jest.mock('models/convert/campaign/queries')
jest.mock('core/flags')

jest.mock('models/convert/campaign/queries')
const useCreateCampaignMock = assumeMock(useCreateCampaign)
const useUpdateCampaignMock = assumeMock(useUpdateCampaign)

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection,
)

jest.mock('state/newMessage/selectors')
const getNewMessageAttachmentsMock = assumeMock(getNewMessageAttachments)

const mockUseFlag = useFlag as jest.Mock
mockUseFlag.mockReturnValue(false)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const mockGenerateSuggestions = jest.fn()

const defaultState: Partial<RootState> = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: fromJS(integrationsStateWithShopify),
}

const integration = fromJS({
    id: '1',
    meta: {
        languages: [{ language: 'en-US', primary: true }],
        shop_type: 'shopify',
        shop_integration_id: 1,
    },
})

const campaign = {
    ...campaignFixture,
    id: '1',
    message_text: 'Lorem Ipsum',
    message_html: '<p>Lorem Ipsum</p>',
} as Campaign

const queryClient = mockQueryClient()

describe('<ConvertSimplifiedEditorModal />', () => {
    const updateCampaignMock = jest.fn()

    beforeAll(() => {
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)

        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => true)

        useCreateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: jest.fn(),
            } as unknown as ReturnType<typeof useCreateCampaign>
        })

        useUpdateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: updateCampaignMock,
            } as unknown as ReturnType<typeof useUpdateCampaign>
        })

        getNewMessageAttachmentsMock.mockReturnValue(fromJS([]))
        ;(useSuggestCampaignCopy as jest.Mock).mockReturnValue({
            mutateAsync: mockGenerateSuggestions,
        })
    })

    it('renders a template', async () => {
        const { getByText } = renderWithRouter(
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
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(getByText('Prevent Cart Abandonment')).toBeTruthy()
            expect(getByText(/Do you have any questions/)).toBeTruthy()
        })
    })

    it('renders a existing campaign', async () => {
        const { getByText } = renderWithRouter(
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
            </QueryClientProvider>,
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
            ]),
        )

        const { queryByText } = renderWithRouter(
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
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(
                queryByText(
                    'Product recommendations will be personalized for each product page',
                    {
                        exact: false,
                    },
                ),
            ).toBeInTheDocument()
        })
    })

    it.skip('sends suggestion in campaign meta', async () => {
        mockGenerateSuggestions.mockResolvedValue({
            data: { suggestions: ['Suggestion 1', 'Suggestion 2'] },
        })

        renderWithRouter(
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
            </QueryClientProvider>,
        )

        await act(async () => {
            userEvent.click(screen.getByText('Generate'))
        })

        await waitFor(() => {
            expect(screen.getByText(/Apply/)).toBeInTheDocument()
        })

        await act(async () => {
            userEvent.click(screen.getByText(/Apply/))
        })

        await waitFor(() => {
            expect(screen.getByText('Save')).toBeInTheDocument()
        })

        await act(async () => {
            userEvent.click(screen.getByText('Save'))
        })

        await waitFor(() => {
            expect(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                updateCampaignMock.mock.calls[0][0][2].meta,
            ).toEqual(
                expect.objectContaining({
                    copySuggestion: 'Suggestion 1',
                }),
            )
        })
    })
})
