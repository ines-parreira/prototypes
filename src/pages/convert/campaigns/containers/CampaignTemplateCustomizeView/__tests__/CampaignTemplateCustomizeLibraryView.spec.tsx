import {render, waitFor, screen, act} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import routerDom, {BrowserRouter, useParams} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import {campaign} from 'fixtures/campaign'
import {channelConnection} from 'fixtures/channelConnection'
import {utmConfiguration} from 'fixtures/utmConfiguration'
import {useListCampaigns} from 'models/convert/campaign/queries'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {useCreateCampaign} from 'pages/convert/campaigns/hooks/useCreateCampaign'
import {useUpdateCampaign} from 'pages/convert/campaigns/hooks/useUpdateCampaign'
import {useUtm} from 'pages/convert/campaigns/hooks/useUtm'
import {LINK_VALUABLE_RESOURCES_TO_HELP_VISITORS} from 'pages/convert/campaigns/templates/library/linkValuableResourcesToHelpVisitors'
import {SUGGEST_BUNDLES_WHEN_SINGLE_PRODUCT_IN_CARD} from 'pages/convert/campaigns/templates/library/suggestBundlesWhenSingleItemInCart'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {useConvertGeneralSettings} from 'pages/stats/convert/hooks/useConvertGeneralSettings'
import {assumeMock} from 'utils/testing'

import CampaignTemplateCustomizeLibraryView from '../CampaignTemplateCustomizeLibraryView'

const mockStore = configureMockStore()

jest.mock('pages/convert/campaigns/hooks/useUtm.ts')
const useUtmMock = assumeMock(useUtm)

jest.mock('pages/convert/common/hooks/useGetConvertStatus')
jest.mock('pages/convert/campaigns/hooks/useGetPreviewProducts')
jest.mock('pages/convert/common/hooks/useContactFormFlag')

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

jest.mock('pages/stats/convert/hooks/useConvertGeneralSettings')
const mockUseConvertGeneralSettings = assumeMock(useConvertGeneralSettings)

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
        mockUseConvertGeneralSettings.mockReturnValue({
            emailDisclaimer: {
                enabled: true,
                disclaimer: {en: 'foo'},
                disclaimer_default_accepted: true,
            },
            isLoading: false,
        })
        useUtmMock.mockReturnValue(utmConfiguration)
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

        const {container} = render(
            <BrowserRouter>
                <Provider store={mockStore(defaultState)}>
                    <CampaignTemplateCustomizeLibraryView />
                </Provider>
            </BrowserRouter>
        )
        await waitFor(() => {
            expect(
                screen.getByText(
                    SUGGEST_BUNDLES_WHEN_SINGLE_PRODUCT_IN_CARD.name
                )
            ).toBeInTheDocument()

            expect(
                container.getElementsByClassName('container isExpanded')
            ).toHaveLength(1)

            // Check if audience banner is in the document
            const audienceBanner = screen.getByLabelText(
                'Banner information for campaign audience step'
            )
            expect(audienceBanner).toBeInTheDocument()
            expect(audienceBanner).toHaveTextContent(
                'To target shoppers with a certain item in cart, please insert one of the Shopify product tag of the item to identify it.'
            )

            const messageBanner = screen.getByLabelText(
                'Banner information for campaign message step'
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

        render(
            <BrowserRouter>
                <Provider store={mockStore(defaultState)}>
                    <CampaignTemplateCustomizeLibraryView />
                </Provider>
            </BrowserRouter>
        )

        await waitFor(() => {
            expect(
                screen.getByText('Back to campaigns library')
            ).toBeInTheDocument()
        })
    })
})
