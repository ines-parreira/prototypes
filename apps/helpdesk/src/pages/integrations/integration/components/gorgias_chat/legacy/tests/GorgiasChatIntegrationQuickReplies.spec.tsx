import type React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { entitiesInitialState } from 'fixtures/entities'
import { integrationsState } from 'fixtures/integrations'
import type { RootState, StoreDispatch } from 'state/types'

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
    withFeatureFlags:
        (WrappedComponent: React.ComponentType<any>) => (props: any) => {
            const actual = jest.requireActual('@repo/feature-flags')
            return (
                <WrappedComponent
                    {...props}
                    flags={{
                        [actual.FeatureFlagKey.ChatMultiLanguages]: true,
                        [actual.FeatureFlagKey
                            .ChangeAutomateSettingButtomPosition]: false,
                    }}
                />
            )
        },
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
        flags: {
            [FeatureFlagKey.ChatMultiLanguages]: true,
            [FeatureFlagKey.ChangeAutomateSettingButtomPosition]: false,
        },
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
            const { container } = render(
                <GorgiasChatIntegrationQuickRepliesComponent {...minProps} />,
                {
                    storeState: store.getState() as object,
                },
            )
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render quick replies from the integration', () => {
            const quickRepliesState = fromJS({
                enabled: true,
                replies: ['foo', 'bar'],
            })
            const { container } = render(
                <GorgiasChatIntegrationQuickRepliesComponent
                    {...minProps}
                    integration={integration.setIn(
                        ['meta', 'quick_replies'],
                        quickRepliesState,
                    )}
                />,
                {
                    storeState: store.getState() as object,
                },
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
            render(
                <GorgiasChatIntegrationQuickRepliesComponent
                    {...minProps}
                    integration={integration.setIn(
                        ['meta', 'quick_replies'],
                        quickRepliesState,
                    )}
                    updateOrCreateIntegration={updateOrCreateIntegrationSpy}
                />,
                {
                    storeState: store.getState() as object,
                },
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
            const { container } = render(
                <GorgiasChatIntegrationQuickRepliesComponent
                    {...minProps}
                    integration={quickRepliesIntegration}
                    shouldShowPreviewForRevamp={true}
                />,
                {
                    storeState: store.getState() as object,
                },
            )
            expect(screen.getByText('Hello')).toBeInTheDocument()
            expect(screen.getByText('How can I help?')).toBeInTheDocument()
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should not render chat preview when shouldShowPreviewForRevamp is false', () => {
            const { container } = render(
                <GorgiasChatIntegrationQuickRepliesComponent
                    {...minProps}
                    integration={quickRepliesIntegration}
                    shouldShowPreviewForRevamp={false}
                />,
                {
                    storeState: store.getState() as object,
                },
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
                    isLoading: false,
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
                render(
                    <GorgiasChatIntegrationQuickRepliesWithHook
                        integration={integrationWithShop}
                    />,
                    {
                        storeState:
                            storeWithShopIntegration.getState() as object,
                    },
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
                        isLoading: false,
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
                render(
                    <GorgiasChatIntegrationQuickRepliesWithHook
                        integration={integrationWithShop}
                    />,
                    {
                        storeState:
                            storeWithShopIntegration.getState() as object,
                    },
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
                        isLoading: false,
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
                render(
                    <GorgiasChatIntegrationQuickRepliesWithHook
                        integration={integrationWithShop}
                    />,
                    {
                        storeState: storeWithBigCommerce.getState() as object,
                    },
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
                        isLoading: false,
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
                render(
                    <GorgiasChatIntegrationQuickRepliesWithHook
                        integration={integrationWithShop}
                    />,
                    {
                        storeState: storeWithMagento.getState() as object,
                    },
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
                    isLoading: false,
                })
                const integrationWithoutShop = quickRepliesIntegration
                render(
                    <GorgiasChatIntegrationQuickRepliesWithHook
                        integration={integrationWithoutShop}
                    />,
                    {
                        storeState: store.getState() as object,
                    },
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
                    isLoading: false,
                })
                const integrationWithInvalidShopId =
                    quickRepliesIntegration.setIn(
                        ['meta', 'shop_integration_id'],
                        999,
                    )
                render(
                    <GorgiasChatIntegrationQuickRepliesWithHook
                        integration={integrationWithInvalidShopId}
                    />,
                    {
                        storeState: store.getState() as object,
                    },
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
                        isLoading: false,
                    })
                const integrationWithoutShop = quickRepliesIntegration
                render(
                    <GorgiasChatIntegrationQuickRepliesWithHook
                        integration={integrationWithoutShop}
                    />,
                    {
                        storeState: store.getState() as object,
                    },
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
                        isLoading: false,
                    })
                const integrationWithInvalidShopId =
                    quickRepliesIntegration.setIn(
                        ['meta', 'shop_integration_id'],
                        999,
                    )
                render(
                    <GorgiasChatIntegrationQuickRepliesWithHook
                        integration={integrationWithInvalidShopId}
                    />,
                    {
                        storeState: store.getState() as object,
                    },
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
                        isLoading: false,
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
                render(
                    <GorgiasChatIntegrationQuickRepliesWithHook
                        integration={integrationWithUnsupportedType}
                    />,
                    {
                        storeState:
                            storeWithUnsupportedIntegration.getState() as object,
                    },
                )
                expect(useRevampSpy).toHaveBeenCalledWith(undefined, 1)
                useRevampSpy.mockRestore()
            })
        })
    })
})
