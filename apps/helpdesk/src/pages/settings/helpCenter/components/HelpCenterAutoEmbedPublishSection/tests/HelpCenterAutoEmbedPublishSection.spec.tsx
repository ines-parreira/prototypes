import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import LD from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { PageEmbedmentFixture } from 'pages/settings/helpCenter/fixtures/pageEmbedment'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { useGetShopifyPages } from '../../../queries'
import { HELP_CENTER_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID } from '../../HelpCenterAutoEmbedCard'
import HelpCenterAutoEmbedPublishSection, {
    HelpCenterAutoEmbedPublishSectionProps,
} from '../HelpCenterAutoEmbedPublishSection'

jest.mock('../../../queries', () => {
    const originalModule: Record<string, unknown> =
        jest.requireActual('../../../queries')
    return {
        ...originalModule,
        useGetShopifyPages: jest.fn(() => ({
            isLoading: false,
            isFetched: true,
            data: [],
        })),
    }
})

const defaultProps: HelpCenterAutoEmbedPublishSectionProps = {
    helpCenterShopName: 'store-name',
    helpCenterId: 1,
    pageEmbedments: [],
}

const queryClient = mockQueryClient()

const SHOPIFY_SHOP_NAME_NO_UPDATE_NEEDED = 'shopify-store-updated'
const SHOPIFY_SHOP_NAME_UPDATE_NEEDED = 'shopify-store-update-needed'

const defaultStateWithIntegrations = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: 'facebook',
                meta: {
                    shop_name: 'foo',
                },
            },
            {
                id: 2,
                type: 'shopify',
                meta: {
                    shop_name: SHOPIFY_SHOP_NAME_NO_UPDATE_NEEDED,
                    need_scope_update: false,
                },
            },
            {
                id: 3,
                type: 'shopify',
                meta: {
                    shop_name: SHOPIFY_SHOP_NAME_UPDATE_NEEDED,
                    need_scope_update: true,
                },
            },
        ],
    }),
} as RootState

const helpCenterWithShop = {
    ...getSingleHelpCenterResponseFixture,
    shop_name: 'test-shop',
}

const mockFeatureFlagValue = (returnValue: boolean) => {
    jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
        [FeatureFlagKey.HelpCenterAutoEmbed]: returnValue,
    }))
}

const renderView = (
    ui: JSX.Element,
    { state }: { state: Partial<RootState> },
) => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state)}>{ui}</Provider>
        </QueryClientProvider>,
    )
}

describe('<HelpCenterAutoEmbedPublishSection />', () => {
    it('renders null if the feature flag is not active', () => {
        mockFeatureFlagValue(false)

        const { container } = renderView(
            <HelpCenterAutoEmbedPublishSection {...defaultProps} />,
            {
                state: defaultStateWithIntegrations,
            },
        )

        expect(container).toBeEmptyDOMElement()
    })

    describe('Help Center - not connected to any stores', () => {
        it('should not fetch Shopify pages', () => {
            mockFeatureFlagValue(true)

            renderView(
                <HelpCenterAutoEmbedPublishSection
                    helpCenterShopName={'test'}
                    helpCenterId={1}
                    pageEmbedments={[]}
                />,
                {
                    state: defaultStateWithIntegrations,
                },
            )

            screen
                .getByTestId(HELP_CENTER_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID)
                .click()

            expect(useGetShopifyPages).toHaveBeenLastCalledWith(
                helpCenterWithShop.id,
                { enabled: false },
            )
        })
    })

    describe('Help Center - connected to a non-shopify store', () => {
        it('should render correct section', () => {
            mockFeatureFlagValue(true)

            const { container } = renderView(
                <HelpCenterAutoEmbedPublishSection
                    helpCenterShopName={'another-store'}
                    helpCenterId={1}
                    pageEmbedments={[]}
                />,
                {
                    state: defaultStateWithIntegrations,
                },
            )

            expect(container.firstChild).toMatchSnapshot()

            screen.getByText(/Automatically embed on your website/i)
            screen.getByText(/recommended/i)
            screen.getByText(/Gorgias will automatically embed/i)
        })

        it('should not fetch Shopify pages', () => {
            renderView(
                <HelpCenterAutoEmbedPublishSection
                    helpCenterShopName={'another-store'}
                    helpCenterId={1}
                    pageEmbedments={[]}
                />,
                {
                    state: defaultStateWithIntegrations,
                },
            )

            screen
                .getByTestId(HELP_CENTER_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID)
                .click()

            expect(useGetShopifyPages).toHaveBeenLastCalledWith(
                helpCenterWithShop.id,
                { enabled: false },
            )
        })
    })

    describe('Help Center - connected to a shopify store', () => {
        describe('when update permissions not needed', () => {
            it('should render correct section', () => {
                mockFeatureFlagValue(true)

                const { container } = renderView(
                    <HelpCenterAutoEmbedPublishSection
                        helpCenterShopName={SHOPIFY_SHOP_NAME_NO_UPDATE_NEEDED}
                        helpCenterId={1}
                        pageEmbedments={[]}
                    />,
                    {
                        state: defaultStateWithIntegrations,
                    },
                )

                expect(container.firstChild).toMatchSnapshot()

                expect(
                    screen.queryByText(/update your Shopify app permissions/i),
                ).toBeNull()

                screen.getByText(/Automatically embed on your website/i)
                screen.getByText(/recommended/i)
                screen.getByText(/Gorgias will automatically embed/i)

                screen.getByTestId(
                    HELP_CENTER_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID,
                )
            })

            it('should render correct section when store has embedments already', () => {
                mockFeatureFlagValue(true)

                const { container } = renderView(
                    <HelpCenterAutoEmbedPublishSection
                        helpCenterShopName={SHOPIFY_SHOP_NAME_NO_UPDATE_NEEDED}
                        helpCenterId={1}
                        pageEmbedments={[PageEmbedmentFixture]}
                    />,
                    {
                        state: defaultStateWithIntegrations,
                    },
                )

                expect(container.firstChild).toMatchSnapshot()

                screen.getByText(/Automatically embed on your website/i)
                screen.getByText(/Gorgias will automatically embed/i)
                expect(screen.queryByText(/recommended/i)).toBeNull()
            })

            it('should fetch Shopify pages', async () => {
                renderView(
                    <HelpCenterAutoEmbedPublishSection
                        helpCenterShopName={SHOPIFY_SHOP_NAME_NO_UPDATE_NEEDED}
                        helpCenterId={1}
                        pageEmbedments={[]}
                    />,
                    {
                        state: defaultStateWithIntegrations,
                    },
                )

                screen
                    .getByTestId(
                        HELP_CENTER_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID,
                    )
                    .click()

                await waitFor(() => {
                    expect(useGetShopifyPages).toHaveBeenLastCalledWith(
                        helpCenterWithShop.id,
                        { enabled: true },
                    )
                })
            })

            it('should not fetch Shopify pages if is disabled', () => {
                renderView(
                    <HelpCenterAutoEmbedPublishSection
                        helpCenterShopName={SHOPIFY_SHOP_NAME_NO_UPDATE_NEEDED}
                        helpCenterId={1}
                        pageEmbedments={[]}
                        isDisabled={true}
                    />,
                    {
                        state: defaultStateWithIntegrations,
                    },
                )

                screen
                    .getByTestId(
                        HELP_CENTER_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID,
                    )
                    .click()

                expect(useGetShopifyPages).toHaveBeenLastCalledWith(
                    helpCenterWithShop.id,
                    { enabled: false },
                )
            })
        })

        describe('when update permissions needed', () => {
            it('should render correct section', () => {
                mockFeatureFlagValue(true)

                const { container } = renderView(
                    <HelpCenterAutoEmbedPublishSection
                        helpCenterShopName={SHOPIFY_SHOP_NAME_UPDATE_NEEDED}
                        helpCenterId={1}
                        pageEmbedments={[]}
                    />,
                    {
                        state: defaultStateWithIntegrations,
                    },
                )

                expect(container.firstChild).toMatchSnapshot()

                screen.getByText(/update your Shopify app permissions/i)

                screen.getByText(/Automatically embed on your website/i)
                screen.getByText(/recommended/i)
                screen.getByText(/Gorgias will automatically embed/i)

                screen.getByTestId(
                    HELP_CENTER_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID,
                )
            })

            it('should not fetch Shopify pages', () => {
                renderView(
                    <HelpCenterAutoEmbedPublishSection
                        helpCenterShopName={SHOPIFY_SHOP_NAME_UPDATE_NEEDED}
                        helpCenterId={1}
                        pageEmbedments={[]}
                    />,
                    {
                        state: defaultStateWithIntegrations,
                    },
                )

                screen
                    .getByTestId(
                        HELP_CENTER_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID,
                    )
                    .click()

                expect(useGetShopifyPages).toHaveBeenLastCalledWith(
                    helpCenterWithShop.id,
                    { enabled: false },
                )
            })
        })
    })
})
