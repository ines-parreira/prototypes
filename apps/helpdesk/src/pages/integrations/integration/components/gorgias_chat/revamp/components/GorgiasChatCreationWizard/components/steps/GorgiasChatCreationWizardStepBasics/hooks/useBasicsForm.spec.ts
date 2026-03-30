import { useFlagWithLoading } from '@repo/feature-flags'
import { act, renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'

import {
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
} from 'config/integrations/gorgias_chat'
import useAppSelector from 'hooks/useAppSelector'
import type { StoreIntegration } from 'models/integration/types'
import {
    GorgiasChatCreationWizardInstallationMethod,
    IntegrationType,
} from 'models/integration/types'

import { useBasicsForm } from './useBasicsForm'

jest.mock('@repo/feature-flags')
jest.mock('hooks/useAppSelector')

const mockUseFlagWithLoading = jest.mocked(useFlagWithLoading)
const mockUseAppSelector = jest.mocked(useAppSelector)

const makeIntegration = (overrides = {}) =>
    fromJS({
        id: 1,
        name: 'Test Chat',
        type: IntegrationType.GorgiasChat,
        meta: {
            language: 'en',
            shop_integration_id: 100,
            preferences: {
                live_chat_availability:
                    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
            },
            wizard: {
                installation_method:
                    GorgiasChatCreationWizardInstallationMethod.OneClick,
            },
        },
        ...overrides,
    })

const makeShopifyStoreIntegration = (
    overrides: Partial<StoreIntegration> = {},
): StoreIntegration =>
    ({
        id: 100,
        name: 'My Shopify Store',
        type: IntegrationType.Shopify,
        meta: {
            oauth: { access_token: 'token', refresh_token: 'refresh' },
            shop_name: 'my-store.myshopify.com',
            webhooks: [],
        },
        ...overrides,
    }) as StoreIntegration

const makeBigCommerceStoreIntegration = (
    overrides: Partial<StoreIntegration> = {},
): StoreIntegration =>
    ({
        id: 200,
        name: 'My BigCommerce Store',
        type: IntegrationType.BigCommerce,
        meta: {
            oauth: { access_token: 'token', refresh_token: 'refresh' },
            store_hash: 'abc123',
            shop_id: 1,
            webhooks: [],
            currency: 'USD',
        },
        ...overrides,
    }) as StoreIntegration

describe('useBasicsForm', () => {
    const defaultStoreIntegrations = [makeShopifyStoreIntegration()]

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector.toString().includes('GorgiasChat')) {
                return []
            }
            return defaultStoreIntegrations
        })
    })

    describe('initial values', () => {
        it('should build form values from integration', () => {
            const integration = makeIntegration()
            const { result } = renderHook(() =>
                useBasicsForm({ integration, isUpdate: true }),
            )

            expect(result.current.values).toMatchObject({
                name: 'Test Chat',
                language: 'en',
                liveChatAvailability:
                    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
                installationMethod:
                    GorgiasChatCreationWizardInstallationMethod.OneClick,
            })
        })

        it('should use defaults when meta is missing', () => {
            const integration = fromJS({
                id: 1,
                name: '',
                type: IntegrationType.GorgiasChat,
            })
            const { result } = renderHook(() =>
                useBasicsForm({ integration, isUpdate: false }),
            )

            expect(result.current.values.language).toBe(
                GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
            )
            expect(result.current.values.liveChatAvailability).toBe(
                GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
            )
            expect(result.current.values.installationMethod).toBe(
                GorgiasChatCreationWizardInstallationMethod.OneClick,
            )
        })

        it('should set store integration from integration meta when updating', () => {
            const storeIntegration = makeShopifyStoreIntegration({ id: 100 })
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector.toString().includes('GorgiasChat')) {
                    return []
                }
                return [storeIntegration]
            })

            const integration = makeIntegration({
                meta: { shop_integration_id: 100 },
            })
            const { result } = renderHook(() =>
                useBasicsForm({ integration, isUpdate: true }),
            )

            expect(result.current.values.storeIntegration).toEqual(
                storeIntegration,
            )
        })

        it('should auto-select store when only one store exists and creating new', () => {
            const storeIntegration = makeShopifyStoreIntegration()
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector.toString().includes('GorgiasChat')) {
                    return []
                }
                return [storeIntegration]
            })

            const integration = fromJS({
                name: '',
                type: IntegrationType.GorgiasChat,
            })
            const { result } = renderHook(() =>
                useBasicsForm({ integration, isUpdate: false }),
            )

            expect(result.current.values.storeIntegration).toEqual(
                storeIntegration,
            )
        })

        it('should not auto-select store when multiple stores exist', () => {
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector.toString().includes('GorgiasChat')) {
                    return []
                }
                return [
                    makeShopifyStoreIntegration(),
                    makeBigCommerceStoreIntegration(),
                ]
            })

            const integration = fromJS({
                name: '',
                type: IntegrationType.GorgiasChat,
            })
            const { result } = renderHook(() =>
                useBasicsForm({ integration, isUpdate: false }),
            )

            expect(result.current.values.storeIntegration).toBeUndefined()
        })
    })

    describe('computed values', () => {
        it('should set isStoreRequired to true when installation method is OneClick', () => {
            const integration = makeIntegration({
                meta: {
                    wizard: {
                        installation_method:
                            GorgiasChatCreationWizardInstallationMethod.OneClick,
                    },
                },
            })
            const { result } = renderHook(() =>
                useBasicsForm({ integration, isUpdate: false }),
            )

            expect(result.current.isStoreRequired).toBe(true)
        })

        it('should set isStoreRequired to false when installation method is Manual', () => {
            const integration = makeIntegration({
                meta: {
                    wizard: {
                        installation_method:
                            GorgiasChatCreationWizardInstallationMethod.Manual,
                    },
                },
            })
            const { result } = renderHook(() =>
                useBasicsForm({ integration, isUpdate: false }),
            )

            expect(result.current.isStoreRequired).toBe(false)
        })

        it('should set hasIncompleteFields to true when name is empty', () => {
            const integration = fromJS({
                name: '',
                type: IntegrationType.GorgiasChat,
            })
            const { result } = renderHook(() =>
                useBasicsForm({ integration, isUpdate: false }),
            )

            expect(result.current.hasIncompleteFields).toBe(true)
        })

        it('should set hasIncompleteFields to true when store is required but not selected', () => {
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector.toString().includes('GorgiasChat')) {
                    return []
                }
                return [
                    makeShopifyStoreIntegration(),
                    makeBigCommerceStoreIntegration(),
                ]
            })

            const integration = makeIntegration({ name: 'Test Chat' })
            const { result } = renderHook(() =>
                useBasicsForm({ integration, isUpdate: false }),
            )

            expect(result.current.hasIncompleteFields).toBe(true)
        })

        it('should set hasIncompleteFields to false when all required fields are filled', () => {
            const storeIntegration = makeShopifyStoreIntegration()
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector.toString().includes('GorgiasChat')) {
                    return []
                }
                return [storeIntegration]
            })

            const integration = makeIntegration({ name: 'Test Chat' })
            const { result } = renderHook(() =>
                useBasicsForm({ integration, isUpdate: false }),
            )

            expect(result.current.hasIncompleteFields).toBe(false)
        })

        it('should detect Shopify store type', () => {
            const storeIntegration = makeShopifyStoreIntegration()
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector.toString().includes('GorgiasChat')) {
                    return []
                }
                return [storeIntegration]
            })

            const integration = makeIntegration()
            const { result } = renderHook(() =>
                useBasicsForm({ integration, isUpdate: false }),
            )

            expect(result.current.isStoreOfShopifyType).toBe(true)
        })
    })

    describe('handlers', () => {
        describe('handleNameChange', () => {
            it('should update name value', () => {
                const integration = makeIntegration()
                const { result } = renderHook(() =>
                    useBasicsForm({ integration, isUpdate: false }),
                )

                act(() => {
                    result.current.handlers.handleNameChange('New Chat Name')
                })

                expect(result.current.values.name).toBe('New Chat Name')
            })

            it('should mark form as dirty', () => {
                const integration = makeIntegration()
                const { result } = renderHook(() =>
                    useBasicsForm({ integration, isUpdate: false }),
                )

                expect(result.current.isDirty).toBe(false)

                act(() => {
                    result.current.handlers.handleNameChange('New Chat Name')
                })

                expect(result.current.isDirty).toBe(true)
            })
        })

        describe('handleLiveChatAvailabilityChange', () => {
            it('should update live chat availability', () => {
                const integration = makeIntegration()
                const { result } = renderHook(() =>
                    useBasicsForm({ integration, isUpdate: false }),
                )

                act(() => {
                    result.current.handlers.handleLiveChatAvailabilityChange(
                        'offline',
                    )
                })

                expect(result.current.values.liveChatAvailability).toBe(
                    'offline',
                )
            })
        })

        describe('handleInstallationPlatformChange', () => {
            it('should set OneClick installation method for ecommerce-platforms', () => {
                const integration = makeIntegration({
                    meta: {
                        wizard: {
                            installation_method:
                                GorgiasChatCreationWizardInstallationMethod.Manual,
                        },
                    },
                })
                const { result } = renderHook(() =>
                    useBasicsForm({ integration, isUpdate: false }),
                )

                act(() => {
                    result.current.handlers.handleInstallationPlatformChange(
                        'ecommerce-platforms',
                    )
                })

                expect(result.current.values.installationMethod).toBe(
                    GorgiasChatCreationWizardInstallationMethod.OneClick,
                )
            })

            it('should set Manual installation method for other platforms', () => {
                const integration = makeIntegration()
                const { result } = renderHook(() =>
                    useBasicsForm({ integration, isUpdate: false }),
                )

                act(() => {
                    result.current.handlers.handleInstallationPlatformChange(
                        'other',
                    )
                })

                expect(result.current.values.installationMethod).toBe(
                    GorgiasChatCreationWizardInstallationMethod.Manual,
                )
            })

            it('should auto-select store when switching to ecommerce and only one store exists', () => {
                mockUseAppSelector.mockImplementation((selector) => {
                    if (selector.toString().includes('GorgiasChat')) {
                        return []
                    }
                    return [
                        makeShopifyStoreIntegration(),
                        makeBigCommerceStoreIntegration(),
                    ]
                })

                const integration = makeIntegration({
                    meta: {
                        wizard: {
                            installation_method:
                                GorgiasChatCreationWizardInstallationMethod.Manual,
                        },
                    },
                })
                const { result } = renderHook(() =>
                    useBasicsForm({ integration, isUpdate: false }),
                )

                act(() => {
                    result.current.handlers.handleInstallationPlatformChange(
                        'other',
                    )
                })

                mockUseAppSelector.mockImplementation((selector) => {
                    if (selector.toString().includes('GorgiasChat')) {
                        return []
                    }
                    return [makeShopifyStoreIntegration()]
                })

                const { result: result2 } = renderHook(() =>
                    useBasicsForm({ integration, isUpdate: false }),
                )

                act(() => {
                    result2.current.handlers.handleInstallationPlatformChange(
                        'ecommerce-platforms',
                    )
                })

                expect(result2.current.values.storeIntegration).toEqual(
                    makeShopifyStoreIntegration(),
                )
            })
        })

        describe('handleStoreChange', () => {
            it('should update store integration', () => {
                const store1 = makeShopifyStoreIntegration({ id: 100 })
                const store2 = makeBigCommerceStoreIntegration({ id: 200 })
                mockUseAppSelector.mockImplementation((selector) => {
                    if (selector.toString().includes('GorgiasChat')) {
                        return []
                    }
                    return [store1, store2]
                })

                const integration = makeIntegration()
                const { result } = renderHook(() =>
                    useBasicsForm({ integration, isUpdate: false }),
                )

                act(() => {
                    result.current.handlers.handleStoreChange(200)
                })

                expect(result.current.values.storeIntegration).toEqual(store2)
            })

            it('should auto-fill name when name is empty and store is selected', () => {
                const store = makeShopifyStoreIntegration({
                    id: 100,
                    name: 'My Store Name',
                })
                mockUseAppSelector.mockImplementation((selector) => {
                    if (selector.toString().includes('GorgiasChat')) {
                        return []
                    }
                    return [store]
                })

                const integration = fromJS({
                    name: '',
                    type: IntegrationType.GorgiasChat,
                    meta: {
                        wizard: {
                            installation_method:
                                GorgiasChatCreationWizardInstallationMethod.Manual,
                        },
                    },
                })
                const { result } = renderHook(() =>
                    useBasicsForm({ integration, isUpdate: false }),
                )

                act(() => {
                    result.current.handlers.handleStoreChange(100)
                })

                expect(result.current.values.name).toBe('My Store Name')
            })

            it('should not overwrite existing name when store is selected', () => {
                const store = makeShopifyStoreIntegration({
                    id: 100,
                    name: 'Store Name',
                })
                mockUseAppSelector.mockImplementation((selector) => {
                    if (selector.toString().includes('GorgiasChat')) {
                        return []
                    }
                    return [store]
                })

                const integration = makeIntegration({
                    name: 'Existing Chat Name',
                })
                const { result } = renderHook(() =>
                    useBasicsForm({ integration, isUpdate: false }),
                )

                act(() => {
                    result.current.handlers.handleStoreChange(100)
                })

                expect(result.current.values.name).toBe('Existing Chat Name')
            })
        })

        describe('handleLanguageChange', () => {
            it('should update languages and primary language', () => {
                const integration = makeIntegration()
                const { result } = renderHook(() =>
                    useBasicsForm({ integration, isUpdate: false }),
                )

                act(() => {
                    result.current.handlers.handleLanguageChange([
                        { value: 'fr', label: 'French', isDefault: true },
                        { value: 'de', label: 'German', isDefault: false },
                    ])
                })

                expect(result.current.values.language).toBe('fr')
                expect(result.current.values.languages).toEqual([
                    { language: 'fr', primary: true },
                    { language: 'de' },
                ])
            })
        })
    })

    describe('isDirty', () => {
        it('should be false initially', () => {
            const integration = makeIntegration()
            const { result } = renderHook(() =>
                useBasicsForm({ integration, isUpdate: false }),
            )

            expect(result.current.isDirty).toBe(false)
        })

        it('should be true after modifying a value', () => {
            const integration = makeIntegration()
            const { result } = renderHook(() =>
                useBasicsForm({ integration, isUpdate: false }),
            )

            act(() => {
                result.current.handlers.handleNameChange('Modified Name')
            })

            expect(result.current.isDirty).toBe(true)
        })
    })
})
