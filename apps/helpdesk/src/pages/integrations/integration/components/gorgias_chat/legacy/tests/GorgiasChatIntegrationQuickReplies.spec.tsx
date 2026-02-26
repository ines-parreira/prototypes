import { FeatureFlagKey } from '@repo/feature-flags'
import { screen } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { entitiesInitialState } from 'fixtures/entities'
import { integrationsState } from 'fixtures/integrations'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import * as ChatIntegrationPreviewModule from '../GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import GorgiasChatIntegrationQuickRepliesWithHook, {
    GorgiasChatIntegrationQuickRepliesComponent,
} from '../GorgiasChatIntegrationQuickReplies/GorgiasChatIntegrationQuickReplies'
import * as useRevampShouldShowChatPreviewModule from '../hooks/useShouldShowChatSettingsRevamp'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader',
    () => () => {
        return <div data-testid="GorgiasChatIntegrationHeader" />
    },
)

jest.mock('../GorgiasChatIntegrationConnectedChannel', () => () => {
    return <div data-testid="GorgiasChatIntegrationConnectedChannel" />
})

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn((flag, defaultValue) => defaultValue),
    getLDClient: jest.fn(() => ({
        variation: jest.fn((flag, defaultValue) => defaultValue),
        waitForInitialization: jest.fn(() => Promise.resolve()),
        on: jest.fn(),
        off: jest.fn(),
        allFlags: jest.fn(() => ({
            [FeatureFlagKey.ChatMultiLanguages]: true,
        })),
    })),
}))

describe('<GorgiasChatIntegrationQuickReplies/>', () => {
    const integration: Map<any, any> = fromJS({
        id: 7,
        name: 'my chat integration',
        meta: {},
        decoration: {
            introduction_text: 'this is an intro',
            input_placeholder: 'type something please',
            main_color: '#123456',
        },
    })

    const minProps: React.ComponentProps<
        typeof GorgiasChatIntegrationQuickRepliesComponent
    > = {
        integration: integration,
        currentUser: fromJS({}),
        storeIntegration: undefined,
        updateOrCreateIntegration: jest.fn(),
        shouldShowPreviewForRevamp: true,
    }

    let store: MockStoreEnhanced<Partial<RootState>, StoreDispatch>
    let chatPreviewSpy: jest.SpyInstance

    beforeEach(() => {
        store = mockStore({
            entities: entitiesInitialState,
            integrations: fromJS(integrationsState),
            billing: fromJS(billingState),
            currentAccount: fromJS({
                domain: 'test-domain',
            }),
        } as unknown as RootState)
        chatPreviewSpy = jest.spyOn(ChatIntegrationPreviewModule, 'default')
    })

    afterEach(() => {
        chatPreviewSpy.mockRestore()
    })

    describe('render()', () => {
        it('should render defaults because there is no quick replies in the integration', () => {
            const { container } = renderWithRouter(
                <Provider store={store}>
                    <GorgiasChatIntegrationQuickRepliesComponent
                        {...minProps}
                    />
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render quick replies from the integration', () => {
            const quickRepliesState = fromJS({
                enabled: true,
                replies: ['foo', 'bar'],
            })

            const { container } = renderWithRouter(
                <Provider store={store}>
                    <GorgiasChatIntegrationQuickRepliesComponent
                        {...minProps}
                        integration={integration.setIn(
                            ['meta', 'quick_replies'],
                            quickRepliesState,
                        )}
                    />
                </Provider>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('_submit()', () => {
        it('should trim quick replies in the payload before calling updateOrCreateIntegration', () => {
            const updateOrCreateIntegrationSpy = jest.fn(() =>
                Promise.resolve(),
            )
            const expectedPayload: Map<any, any> = fromJS({
                id: 7,
                meta: {
                    quick_replies: {
                        enabled: true,
                        replies: ['foo', 'bar'],
                    },
                },
            })

            const quickRepliesState: Map<any, any> = fromJS({
                enabled: true,
                replies: [' foo ', 'bar  '],
            })

            renderWithRouter(
                <Provider store={store}>
                    <GorgiasChatIntegrationQuickRepliesComponent
                        {...minProps}
                        integration={integration.setIn(
                            ['meta', 'quick_replies'],
                            quickRepliesState,
                        )}
                        updateOrCreateIntegration={updateOrCreateIntegrationSpy}
                    />
                </Provider>,
            )

            screen.getByRole('button', { name: 'Save Changes' }).click()

            expect(updateOrCreateIntegrationSpy).toHaveBeenCalledWith(
                expectedPayload,
            )
        })
    })

    describe('conditional chat preview rendering', () => {
        const quickRepliesIntegration = fromJS({
            id: 1,
            name: 'Quick Replies Chat',
            meta: {
                quick_replies: {
                    enabled: true,
                    replies: ['Hello', 'How can I help?'],
                },
            },
            decoration: {
                introduction_text: 'Welcome!',
                main_color: '#123456',
            },
        })

        it('should render chat preview when shouldShowPreviewForRevamp is true', () => {
            const { container } = renderWithRouter(
                <Provider store={store}>
                    <GorgiasChatIntegrationQuickRepliesComponent
                        {...minProps}
                        integration={quickRepliesIntegration}
                        shouldShowPreviewForRevamp={true}
                    />
                </Provider>,
            )

            expect(screen.getByText('Hello')).toBeInTheDocument()
            expect(screen.getByText('How can I help?')).toBeInTheDocument()
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should not render chat preview when shouldShowPreviewForRevamp is false', () => {
            const { container } = renderWithRouter(
                <Provider store={store}>
                    <GorgiasChatIntegrationQuickRepliesComponent
                        {...minProps}
                        integration={quickRepliesIntegration}
                        shouldShowPreviewForRevamp={false}
                    />
                </Provider>,
            )

            expect(screen.queryByText('Hello')).not.toBeInTheDocument()
            expect(
                screen.queryByText('How can I help?'),
            ).not.toBeInTheDocument()
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('GorgiasChatIntegrationQuickRepliesWithHook', () => {
        const quickRepliesIntegration = fromJS({
            id: 1,
            name: 'Quick Replies Chat',
            meta: {
                quick_replies: {
                    enabled: true,
                    replies: ['Hello', 'How can I help?'],
                },
            },
            decoration: {
                introduction_text: 'Welcome!',
                main_color: '#123456',
            },
        })

        describe('when store integration exists', () => {
            it('should render chat preview when hook returns shouldShowPreviewForRevamp as true', () => {
                jest.spyOn(
                    useRevampShouldShowChatPreviewModule,
                    'default',
                ).mockReturnValue({
                    shouldShowRevamp: false,
                    shouldShowPreviewForRevamp: true,
                    shouldShowRevampWhenAiAgentEnabled: false,
                })

                const integrationWithShop = quickRepliesIntegration.setIn(
                    ['meta', 'shop_integration_id'],
                    123,
                )

                const storeWithShopIntegration = mockStore({
                    entities: entitiesInitialState,
                    integrations: fromJS({
                        ...integrationsState,
                        integrations: [
                            ...integrationsState.integrations,
                            {
                                id: 123,
                                type: 'shopify',
                                name: 'Test Shop',
                            },
                        ],
                    }),
                    billing: fromJS(billingState),
                    currentAccount: fromJS({
                        domain: 'test-domain',
                    }),
                } as unknown as RootState)

                renderWithRouter(
                    <Provider store={storeWithShopIntegration}>
                        <GorgiasChatIntegrationQuickRepliesWithHook
                            integration={integrationWithShop}
                        />
                    </Provider>,
                )

                expect(chatPreviewSpy).toHaveBeenCalled()
            })

            it('should call useRevampShouldShowChatPreview with the correct Shopify store integration', () => {
                const useRevampSpy = jest
                    .spyOn(useRevampShouldShowChatPreviewModule, 'default')
                    .mockReturnValue({
                        shouldShowRevamp: false,
                        shouldShowPreviewForRevamp: true,
                        shouldShowRevampWhenAiAgentEnabled: false,
                    })

                const shopifyIntegration = {
                    id: 123,
                    type: 'shopify',
                    name: 'Test Shop',
                }

                const integrationWithShop = quickRepliesIntegration.setIn(
                    ['meta', 'shop_integration_id'],
                    123,
                )

                const storeWithShopIntegration = mockStore({
                    entities: entitiesInitialState,
                    integrations: fromJS({
                        ...integrationsState,
                        integrations: [
                            ...integrationsState.integrations,
                            shopifyIntegration,
                        ],
                    }),
                    billing: fromJS(billingState),
                    currentAccount: fromJS({
                        domain: 'test-domain',
                    }),
                } as unknown as RootState)

                renderWithRouter(
                    <Provider store={storeWithShopIntegration}>
                        <GorgiasChatIntegrationQuickRepliesWithHook
                            integration={integrationWithShop}
                        />
                    </Provider>,
                )

                expect(useRevampSpy).toHaveBeenCalledWith(shopifyIntegration, 1)

                useRevampSpy.mockRestore()
            })

            it('should call useRevampShouldShowChatPreview with the correct BigCommerce store integration', () => {
                const useRevampSpy = jest
                    .spyOn(useRevampShouldShowChatPreviewModule, 'default')
                    .mockReturnValue({
                        shouldShowRevamp: false,
                        shouldShowPreviewForRevamp: true,
                        shouldShowRevampWhenAiAgentEnabled: false,
                    })

                const bigCommerceIntegration = {
                    id: 234,
                    type: 'bigcommerce',
                    name: 'BigCommerce Store',
                }

                const integrationWithShop = quickRepliesIntegration.setIn(
                    ['meta', 'shop_integration_id'],
                    234,
                )

                const storeWithBigCommerce = mockStore({
                    entities: entitiesInitialState,
                    integrations: fromJS({
                        ...integrationsState,
                        integrations: [
                            ...integrationsState.integrations,
                            bigCommerceIntegration,
                        ],
                    }),
                    billing: fromJS(billingState),
                    currentAccount: fromJS({
                        domain: 'test-domain',
                    }),
                } as unknown as RootState)

                renderWithRouter(
                    <Provider store={storeWithBigCommerce}>
                        <GorgiasChatIntegrationQuickRepliesWithHook
                            integration={integrationWithShop}
                        />
                    </Provider>,
                )

                expect(useRevampSpy).toHaveBeenCalledWith(
                    bigCommerceIntegration,
                    1,
                )

                useRevampSpy.mockRestore()
            })

            it('should call useRevampShouldShowChatPreview with the correct Magento2 store integration', () => {
                const useRevampSpy = jest
                    .spyOn(useRevampShouldShowChatPreviewModule, 'default')
                    .mockReturnValue({
                        shouldShowRevamp: false,
                        shouldShowPreviewForRevamp: true,
                        shouldShowRevampWhenAiAgentEnabled: false,
                    })

                const magentoIntegration = {
                    id: 345,
                    type: 'magento2',
                    name: 'Magento Store',
                }

                const integrationWithShop = quickRepliesIntegration.setIn(
                    ['meta', 'shop_integration_id'],
                    345,
                )

                const storeWithMagento = mockStore({
                    entities: entitiesInitialState,
                    integrations: fromJS({
                        ...integrationsState,
                        integrations: [
                            ...integrationsState.integrations,
                            magentoIntegration,
                        ],
                    }),
                    billing: fromJS(billingState),
                    currentAccount: fromJS({
                        domain: 'test-domain',
                    }),
                } as unknown as RootState)

                renderWithRouter(
                    <Provider store={storeWithMagento}>
                        <GorgiasChatIntegrationQuickRepliesWithHook
                            integration={integrationWithShop}
                        />
                    </Provider>,
                )

                expect(useRevampSpy).toHaveBeenCalledWith(magentoIntegration, 1)

                useRevampSpy.mockRestore()
            })
        })

        describe('when store integration does not exist', () => {
            it('should not render chat preview when hook returns shouldShowPreviewForRevamp as false', () => {
                jest.spyOn(
                    useRevampShouldShowChatPreviewModule,
                    'default',
                ).mockReturnValue({
                    shouldShowRevamp: true,
                    shouldShowPreviewForRevamp: false,
                    shouldShowRevampWhenAiAgentEnabled: false,
                })

                const integrationWithoutShop = quickRepliesIntegration

                renderWithRouter(
                    <Provider store={store}>
                        <GorgiasChatIntegrationQuickRepliesWithHook
                            integration={integrationWithoutShop}
                        />
                    </Provider>,
                )

                expect(chatPreviewSpy).not.toHaveBeenCalled()
            })

            it('should not render chat preview when shop_integration_id is not found in integrations', () => {
                jest.spyOn(
                    useRevampShouldShowChatPreviewModule,
                    'default',
                ).mockReturnValue({
                    shouldShowRevamp: true,
                    shouldShowPreviewForRevamp: false,
                    shouldShowRevampWhenAiAgentEnabled: false,
                })

                const integrationWithInvalidShopId =
                    quickRepliesIntegration.setIn(
                        ['meta', 'shop_integration_id'],
                        999,
                    )

                renderWithRouter(
                    <Provider store={store}>
                        <GorgiasChatIntegrationQuickRepliesWithHook
                            integration={integrationWithInvalidShopId}
                        />
                    </Provider>,
                )

                expect(chatPreviewSpy).not.toHaveBeenCalled()
            })

            it('should call useRevampShouldShowChatPreview with undefined when no shop_integration_id exists', () => {
                const useRevampSpy = jest
                    .spyOn(useRevampShouldShowChatPreviewModule, 'default')
                    .mockReturnValue({
                        shouldShowRevamp: true,
                        shouldShowPreviewForRevamp: false,
                        shouldShowRevampWhenAiAgentEnabled: false,
                    })

                const integrationWithoutShop = quickRepliesIntegration

                renderWithRouter(
                    <Provider store={store}>
                        <GorgiasChatIntegrationQuickRepliesWithHook
                            integration={integrationWithoutShop}
                        />
                    </Provider>,
                )

                expect(useRevampSpy).toHaveBeenCalledWith(undefined, 1)

                useRevampSpy.mockRestore()
            })

            it('should call useRevampShouldShowChatPreview with undefined when shop_integration_id is not found', () => {
                const useRevampSpy = jest
                    .spyOn(useRevampShouldShowChatPreviewModule, 'default')
                    .mockReturnValue({
                        shouldShowRevamp: true,
                        shouldShowPreviewForRevamp: false,
                        shouldShowRevampWhenAiAgentEnabled: false,
                    })

                const integrationWithInvalidShopId =
                    quickRepliesIntegration.setIn(
                        ['meta', 'shop_integration_id'],
                        999,
                    )

                renderWithRouter(
                    <Provider store={store}>
                        <GorgiasChatIntegrationQuickRepliesWithHook
                            integration={integrationWithInvalidShopId}
                        />
                    </Provider>,
                )

                expect(useRevampSpy).toHaveBeenCalledWith(undefined, 1)

                useRevampSpy.mockRestore()
            })

            it('should call useRevampShouldShowChatPreview with undefined when integration type is not supported', () => {
                const useRevampSpy = jest
                    .spyOn(useRevampShouldShowChatPreviewModule, 'default')
                    .mockReturnValue({
                        shouldShowRevamp: true,
                        shouldShowPreviewForRevamp: false,
                        shouldShowRevampWhenAiAgentEnabled: false,
                    })

                const integrationWithUnsupportedType =
                    quickRepliesIntegration.setIn(
                        ['meta', 'shop_integration_id'],
                        456,
                    )

                const storeWithUnsupportedIntegration = mockStore({
                    entities: entitiesInitialState,
                    integrations: fromJS({
                        ...integrationsState,
                        integrations: [
                            ...integrationsState.integrations,
                            {
                                id: 456,
                                type: 'woocommerce',
                                name: 'Unsupported Store',
                            },
                        ],
                    }),
                    billing: fromJS(billingState),
                    currentAccount: fromJS({
                        domain: 'test-domain',
                    }),
                } as unknown as RootState)

                renderWithRouter(
                    <Provider store={storeWithUnsupportedIntegration}>
                        <GorgiasChatIntegrationQuickRepliesWithHook
                            integration={integrationWithUnsupportedType}
                        />
                    </Provider>,
                )

                expect(useRevampSpy).toHaveBeenCalledWith(undefined, 1)

                useRevampSpy.mockRestore()
            })
        })
    })
})
