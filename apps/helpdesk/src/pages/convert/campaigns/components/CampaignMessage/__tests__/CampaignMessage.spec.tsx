import React from 'react'

import { flushPromises } from '@repo/testing'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import type { User } from 'config/types/user'
import { UserRole } from 'config/types/user'
import {
    InventoryManagement as ShipifyInventoryManagement,
    InventoryPolicy as ShipifyInventoryPolicy,
} from 'constants/integrations/types/shopify'
import { campaign } from 'fixtures/campaign'
import { shopifyProductFixture, shopifyVariantFixture } from 'fixtures/shopify'
import { useSuggestCampaignCopy } from 'models/convert/campaign/queries'
import type { ShopifyIntegration } from 'models/integration/types'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import * as integrationHook from 'pages/convert/campaigns/containers/IntegrationProvider'
import { CampaignDetailsFormContext } from 'pages/convert/campaigns/providers/CampaignDetailsForm/context'
import type { Campaign } from 'pages/convert/campaigns/types/Campaign'
import * as integrationHelpers from 'state/integrations/helpers'
import type { RootState, StoreDispatch } from 'state/types'

import type { AddContactCaptureFormProps } from '../../ContactCaptureForm/AddContactCaptureForm'
import { CampaignMessage } from '../CampaignMessage'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn((flag, defaultValue) => defaultValue),
    getLDClient: jest.fn(() => ({
        variation: jest.fn((flag, defaultValue) => defaultValue),
        waitForInitialization: jest.fn(() => Promise.resolve()),
        on: jest.fn(),
        off: jest.fn(),
        allFlags: jest.fn(() => ({})),
    })),
}))

jest.mock('models/convert/campaign/queries')
jest.mock('pages/common/forms/RichField/RichFieldEditor')
jest.mock('pages/convert/common/hooks/useContactFormFlag')
jest.mock('pages/convert/campaigns/components/ContactCaptureForm/utils')

jest.mock(
    'pages/convert/campaigns/components/ContactCaptureForm/AddContactCaptureForm',
    () => ({
        __esModule: true,
        default: ({ onSubmit }: AddContactCaptureFormProps) => {
            const data = {
                steps: [],
                on_success_content: { message: 'test' },
                targets: [],
                disclaimer: 'test',
                disclaimer_default_accepted: true,
            }
            return (
                <>
                    <button onClick={() => onSubmit && onSubmit(data, false)}>
                        Add form
                    </button>
                    <button onClick={() => onSubmit && onSubmit(data, true)}>
                        Update form
                    </button>
                </>
            )
        },
    }),
)

const mockStore = configureMockStore<RootState, StoreDispatch>()
const defaultState = {
    integrations: fromJS({ integrations: [] }),
} as RootState

const attachments = [
    {
        content_type: 'application/productCard',
        name: 'The Out of Stock Snowboard',
        size: 0,
        url: 'https://cdn.shopify.com/',
        extra: {
            product_id: 1,
            product_link:
                'https://shop-name.myshopify.com/products/product-name',
            price: 885.95,
            featured_image: 'https://cdn.shopify.com/',
        },
    },
]

const mockGenerateSuggestions = jest.fn()

describe('<CampaignMessage>', () => {
    window.IMAGE_PROXY_URL = 'http://proxy-url/'
    window.IMAGE_PROXY_SIGN_KEY = 'test-key'

    const updateCampaign = jest.fn()
    const onSuggestionApply = jest.fn()

    const renderCampaignMessage = (
        storeState: Partial<RootState>,
        isConvertSubscriber: boolean,
    ) => {
        return render(
            <Provider store={mockStore({ ...defaultState, ...storeState })}>
                <CampaignDetailsFormContext.Provider
                    value={{
                        campaign: campaign as Campaign,
                        triggers: {},
                        addTrigger: jest.fn(),
                        updateTrigger: jest.fn(),
                        deleteTrigger: jest.fn(),
                        updateCampaign,
                    }}
                >
                    <CampaignMessage
                        showContentWarning
                        isConvertSubscriber={isConvertSubscriber}
                        shouldGenerateInitialSuggestion={true}
                        isAiCopyAssistantEnabled={true}
                        richAreaRef={jest.fn()}
                        agents={[
                            {
                                name: 'Dummy Agent',
                                role: { name: UserRole.Agent },
                                email: 'dummy@gorgias.com',
                            } as User,
                            {
                                name: 'Gorgias Support Agent',
                                role: { name: UserRole.GorgiasAgent },
                                email: 'support@gorgias.com',
                            } as User,
                        ]}
                        html=""
                        text=""
                        selectedAgent=""
                        onSelectAgent={jest.fn()}
                        onChangeMessage={jest.fn()}
                        onSuggestionApply={onSuggestionApply}
                        onDeleteAttachment={jest.fn()}
                    />
                </CampaignDetailsFormContext.Provider>
            </Provider>,
        )
    }

    beforeEach(() => {
        ;(useSuggestCampaignCopy as jest.Mock).mockReturnValue({
            mutateAsync: mockGenerateSuggestions,
        })
    })

    describe('is not convert subscriber', () => {
        beforeEach(() => {
            jest.spyOn(
                isConvertSubscriberHook,
                'useIsConvertSubscriber',
            ).mockImplementation(() => false)
        })

        it('renders the warning if the content is too big and merchant is a revenue subscriber', () => {
            const { getByText } = renderCampaignMessage({}, true)

            expect(
                getByText(
                    'Your campaign might be too large for mobile devices or small screens. We advise limiting the content to maximum 170 characters and maximum 5 lines of text.',
                ),
            ).toBeInTheDocument()
        })

        it('does not render the warning if the content is too big and merchant is not a revenue subscriber', () => {
            const { queryByText } = renderCampaignMessage({}, false)

            expect(
                queryByText(
                    'Your campaign might be too large for mobile devices or small screens. We advise limiting the content to maximum 170 characters and maximum 5 lines of text.',
                ),
            ).toBeNull()
        })

        it('it does not display AI copy assistant banner', async () => {
            mockGenerateSuggestions.mockResolvedValue({
                data: { suggestions: ['Suggestion 1', 'Suggestion 2'] },
            })
            renderCampaignMessage(
                {
                    newMessage: fromJS({
                        newMessage: {
                            attachments: attachments,
                        },
                    }),
                },
                false,
            )

            await act(flushPromises)

            expect(screen.queryByText('Suggestion 1')).not.toBeInTheDocument()
        })
    })

    describe('is convert subscriber', () => {
        beforeEach(() => {
            jest.spyOn(
                isConvertSubscriberHook,
                'useIsConvertSubscriber',
            ).mockImplementation(() => true)

            jest.spyOn(
                integrationHook,
                'useIntegrationContext',
            ).mockImplementation(() => ({
                shopifyIntegration: {
                    id: 1,
                    meta: { shop_domain: 'shop-domain.com' },
                } as any as ShopifyIntegration,
            }))
        })

        it('it displays out of stock warning banner', async () => {
            const variant = shopifyVariantFixture({
                inventoryQuantity: -1,
                inventoryManagement: ShipifyInventoryManagement.Shopify,
                inventoryPolicy: ShipifyInventoryPolicy.Deny,
            })
            const product = shopifyProductFixture({ variants: [variant] })

            jest.spyOn(
                integrationHelpers,
                'fetchIntegrationProducts',
            ).mockReturnValue(new Promise((resolve) => resolve([Map(product)])))

            const { queryByText } = renderCampaignMessage(
                {
                    newMessage: fromJS({
                        newMessage: {
                            attachments: attachments,
                        },
                    }),
                },
                true,
            )

            await act(flushPromises)

            expect(
                queryByText(
                    'Your campaign is currently not displayed because there is no product stock for your first product card. Remove the first product card to see have your campaign displayed.',
                ),
            ).toBeInTheDocument()
        })

        it('it does not display error message out of stock warning banner', async () => {
            const variant = shopifyVariantFixture({
                inventoryQuantity: -1,
                inventoryManagement: ShipifyInventoryManagement.Shopify,
                inventoryPolicy: ShipifyInventoryPolicy.Continue,
            })
            const product = shopifyProductFixture({ variants: [variant] })

            jest.spyOn(
                integrationHelpers,
                'fetchIntegrationProducts',
            ).mockReturnValue(new Promise((resolve) => resolve([Map(product)])))

            const { queryByText } = renderCampaignMessage(
                {
                    newMessage: fromJS({
                        newMessage: {
                            attachments: attachments,
                        },
                    }),
                },
                true,
            )

            await act(flushPromises)

            expect(
                queryByText(
                    'Your campaign is currently not displayed because there is no product stock for your first product card. Remove the first product card to see have your campaign displayed.',
                ),
            ).toBeNull()
        })

        it('it sets noReply on adding a form', async () => {
            const { getByText } = renderCampaignMessage({}, true)

            await act(flushPromises)

            const submitButton = getByText('Add form')
            expect(submitButton).toBeInTheDocument()

            fireEvent.click(submitButton)

            // Check if updateCampaign was called with the correct arguments
            expect(updateCampaign).toHaveBeenCalledWith('noReply', true)
        })

        it('it does not set noReply on updating a form', async () => {
            const { getByText } = renderCampaignMessage({}, true)

            await act(flushPromises)

            const submitButton = getByText('Update form')
            expect(submitButton).toBeInTheDocument()

            fireEvent.click(submitButton)

            expect(updateCampaign).not.toHaveBeenCalled()
        })

        it('it displays AI copy assistant banner', async () => {
            mockGenerateSuggestions.mockResolvedValue({
                data: { suggestions: ['Suggestion 1', 'Suggestion 2'] },
            })
            renderCampaignMessage(
                {
                    newMessage: fromJS({
                        newMessage: {
                            attachments: attachments,
                        },
                    }),
                },
                true,
            )

            await act(flushPromises)

            expect(screen.getByText('Suggestion 1')).toBeInTheDocument()
        })

        it('it calls onSuggestionApply on Apply click', async () => {
            mockGenerateSuggestions.mockResolvedValue({
                data: { suggestions: ['Suggestion 1', 'Suggestion 2'] },
            })
            renderCampaignMessage(
                {
                    newMessage: fromJS({
                        newMessage: {
                            attachments: attachments,
                        },
                    }),
                },
                true,
            )

            await act(flushPromises)

            const applyButton = screen.getByText('Apply')
            fireEvent.click(applyButton)

            expect(onSuggestionApply).toHaveBeenCalledWith('Suggestion 1')
        })

        it('should not display the Gorgias Support Agent user in the agent list', async () => {
            const { queryByText } = renderCampaignMessage({}, true)

            await act(flushPromises)

            expect(queryByText('Dummy Agent')).toBeInTheDocument()
            expect(queryByText('Gorgias Support Agent')).not.toBeInTheDocument()
        })
    })
})
