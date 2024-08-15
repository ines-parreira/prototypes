import React from 'react'
import {render, waitFor, screen, act} from '@testing-library/react'
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
import {LINK_VALUABLE_RESOURCES_TO_HELP_VISITORS} from 'pages/convert/campaigns/templates/library/linkValuableResourcesToHelpVisitors'
import {SUGGEST_BUNDLES_WHEN_SINGLE_PRODUCT_IN_CARD} from 'pages/convert/campaigns/templates/library/suggestBundlesWhenSingleItemInCart'
import CampaignTemplateCustomizeLibraryView from '../CampaignTemplateCustomizeLibraryView'

const mockStore = configureMockStore()

jest.mock('pages/convert/common/hooks/useGetConvertStatus')
jest.mock('pages/convert/campaigns/hooks/useGetPreviewProducts')

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

jest.mock('pages/convert/common/components/ConvertSubscriptionModal', () => {
    return jest.fn(() => {
        return <div data-testid="mock-convert-subscription-modal" />
    })
})

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 123,
                type: 'gorgias_chat',
                meta: {},
            },
        ],
    }),
    ui: {
        editor: {},
    },
}

describe('CampaignTemplateCustomizeView', () => {
    const mockRange = {
        selectNodeContents: jest.fn(),
        setStart: jest.fn(),
        setEnd: jest.fn(),
    }
    const mockSelection = {
        removeAllRanges: jest.fn(),
        addRange: jest.fn(),
        getRangeAt: () => ({
            setEnd: jest.fn(),
            cloneRange: jest.fn(),
        }),
    }

    beforeAll(() => {
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

        window.HTMLElement.prototype.scrollTo = jest.fn()

        // It is used by draft-js somewhere deep in code
        jest.spyOn(document, 'createRange').mockReturnValue(mockRange as any)
        jest.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any)
    })

    afterAll(() => {
        // Restore the original methods and objects after testing
        ;(document.createRange as jest.Mock).mockRestore()
        ;(window.getSelection as jest.Mock).mockRestore()
    })

    it('should render tooptips', async () => {
        ;(useParams as jest.Mock).mockReturnValue({
            id: '123',
            templateSlug: LINK_VALUABLE_RESOURCES_TO_HELP_VISITORS.slug,
        })

        act(() => {
            render(
                <BrowserRouter>
                    <Provider store={mockStore(defaultState)}>
                        <CampaignTemplateCustomizeLibraryView />
                    </Provider>
                </BrowserRouter>
            )
        })

        await waitFor(() => {
            expect(screen.getByText('Add links')).toBeInTheDocument()
        })
    })

    it('should render campaign form with template data and banners', async () => {
        ;(useParams as jest.Mock).mockReturnValue({
            id: '123',
            templateSlug: SUGGEST_BUNDLES_WHEN_SINGLE_PRODUCT_IN_CARD.slug,
        })

        const {getByText, getByTestId, container} = render(
            <BrowserRouter>
                <Provider store={mockStore(defaultState)}>
                    <CampaignTemplateCustomizeLibraryView />
                </Provider>
            </BrowserRouter>
        )
        await waitFor(() => {
            expect(
                getByText(SUGGEST_BUNDLES_WHEN_SINGLE_PRODUCT_IN_CARD.name)
            ).toBeInTheDocument()

            expect(
                container.getElementsByClassName('container isExpanded')
            ).toHaveLength(1)

            // Check if audience banner is in the document
            const audienceBanner = getByTestId(
                'campaign-audience-step-info-banner'
            )
            expect(audienceBanner).toBeInTheDocument()
            expect(audienceBanner).toHaveTextContent(
                'To target shoppers with a certain item in cart, please insert one of the Shopify product tag of the item to identify it.'
            )

            const messageBanner = getByTestId(
                'campaign-message-step-info-banner'
            )
            expect(messageBanner).toBeInTheDocument()
            expect(messageBanner).toHaveTextContent(
                'Please select the bundle you want to recommend from your Shopify catalog.'
            )
        })
    })

    it('should render correct backUrl and backUrl text', async () => {
        ;(useParams as jest.Mock).mockReturnValue({
            id: '123',
            templateSlug: SUGGEST_BUNDLES_WHEN_SINGLE_PRODUCT_IN_CARD.slug,
        })

        const {getByText} = render(
            <BrowserRouter>
                <Provider store={mockStore(defaultState)}>
                    <CampaignTemplateCustomizeLibraryView />
                </Provider>
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(getByText('Back to campaigns library')).toBeInTheDocument()
        })
    })
})
