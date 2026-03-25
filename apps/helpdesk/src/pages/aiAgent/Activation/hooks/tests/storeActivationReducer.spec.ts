import type { StoreConfiguration } from 'models/aiAgent/types'
import { AiAgentScope } from 'models/aiAgent/types'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'
import type { Components } from 'rest_api/help_center_api/client.generated'

import type { Flags, State } from '../storeActivationReducer'
import {
    checkIsMissingKnowledge,
    getChatActivation,
    isSalesEnabledWithNewActivationXp,
    KNOWLEDGE_ALERT_KIND,
    reducer,
    stateToUpdatedStoreConfiguration,
    storeConfigurationToState,
} from '../storeActivationReducer'

const helpCentersFaq = [{ id: 1 } as Components.Schemas.GetHelpCenterDto]
const STORE_HELP_CENTER_ID = 1
const STORE_SNIPPET_HELP_CENTER_ID = 42

describe('storeActivationReducer', () => {
    const changeSales = (state: State, flags: Flags) => {
        if (flags.hasAiAgentNewActivationXp) {
            return state
        }

        return reducer(state, {
            type: 'CHANGE_SALES',
            storeName: 'Test Store',
            newValue: !state['Test Store'].sales.enabled,
            flags,
        })
    }

    const changeSupport = (state: State, flags: Flags) => {
        if (flags.hasAiAgentNewActivationXp) {
            return state
        }

        return reducer(state, {
            type: 'CHANGE_SUPPORT',
            storeName: 'Test Store',
            newValue: !state['Test Store'].support.enabled,
            flags,
        })
    }

    const EMPTY_STATE = {}
    const LD_FLAGS = {}

    const mockStoreConfig: StoreConfiguration = {
        storeName: 'Test Store',
        scopes: [AiAgentScope.Support],
        chatChannelDeactivatedDatetime: null,
        emailChannelDeactivatedDatetime: null,
        monitoredChatIntegrations: [1],
        monitoredEmailIntegrations: [{ id: 2, email: 'test@example.com' }],
        helpCenterId: STORE_HELP_CENTER_ID,
        snippetHelpCenterId: STORE_SNIPPET_HELP_CENTER_ID,
    } as any

    describe.each([
        { hasAiAgentNewActivationXp: true },
        { hasAiAgentNewActivationXp: false },
    ])(
        'when aiSalesAgentEmailEnabled is true + beta on new automation plan + hasAiAgentNewActivationXp is $hasAiAgentNewActivationXp',
        ({ hasAiAgentNewActivationXp }) => {
            const flags = {
                hasAiAgentNewActivationXp,
                aiSalesAgentEmailEnabled: true,
            }

            it('should enable sales when only email is enabled', () => {
                const state = storeConfigurationToState(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [mockStoreConfig],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    emailIntegrations: [
                        {
                            id: 2,
                        } as any,
                    ],
                    helpCentersFaq,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const state2 = reducer(state, {
                    type: 'CHANGE_SUPPORT_CHAT',
                    storeName: 'Test Store',
                    newValue: false,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const newState = changeSales(state2, flags)

                expect(newState['Test Store'].sales.enabled).toBe(true)
                expect(newState['Test Store'].sales.isDisabled).toBe(false)
            })

            it('should enable sales when only chat is enabled', () => {
                const state = storeConfigurationToState(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [mockStoreConfig],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    emailIntegrations: [
                        {
                            id: 2,
                        } as any,
                    ],
                    helpCentersFaq,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const state2 = reducer(state, {
                    type: 'CHANGE_SUPPORT_EMAIL',
                    storeName: 'Test Store',
                    newValue: false,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const state3 = reducer(state2, {
                    type: 'CHANGE_SUPPORT_CHAT',
                    storeName: 'Test Store',
                    newValue: true,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const newState = changeSales(state3, flags)

                expect(newState['Test Store'].sales.enabled).toBe(true)
                expect(newState['Test Store'].sales.isDisabled).toBe(false)
            })

            it('should not support sales when none is enabled', () => {
                if (flags.hasAiAgentNewActivationXp) {
                    // This test is irrelevant for the new activation flow because sales setting is based on beta+plan
                    return
                }

                const state = storeConfigurationToState(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [mockStoreConfig],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    emailIntegrations: [
                        {
                            id: 2,
                        } as any,
                    ],
                    helpCentersFaq,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const state2 = reducer(state, {
                    type: 'CHANGE_SUPPORT_EMAIL',
                    storeName: 'Test Store',
                    newValue: false,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const newState = reducer(state2, {
                    type: 'CHANGE_SUPPORT_CHAT',
                    storeName: 'Test Store',
                    newValue: false,
                    flags,
                    hasNewAutomatePlan: true,
                })

                expect(newState['Test Store'].sales.enabled).toBe(false)
                expect(newState['Test Store'].sales.isDisabled).toBe(true)
            })

            it('should disable sales when support is disabled', () => {
                if (flags.hasAiAgentNewActivationXp) {
                    // This test is irrelevant for the new activation flow because we cannot toggle support
                    return
                }

                const state = storeConfigurationToState(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [mockStoreConfig],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    emailIntegrations: [
                        {
                            id: 2,
                        } as any,
                    ],
                    helpCentersFaq,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const newState = changeSupport(state, flags)

                expect(newState['Test Store'].sales.enabled).toBe(false)
                expect(newState['Test Store'].sales.isDisabled).toBe(true)
            })

            it('should not affect sales when enabling email if chat is already enabled', () => {
                const state = storeConfigurationToState(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [
                        {
                            ...mockStoreConfig,
                            scopes: [AiAgentScope.Support, AiAgentScope.Sales],
                        },
                    ],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    emailIntegrations: [
                        {
                            id: 2,
                        } as any,
                    ],
                    helpCentersFaq,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const intermediateState = reducer(state, {
                    type: 'CHANGE_SUPPORT_CHAT',
                    storeName: 'Test Store',
                    newValue: true,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const newState = reducer(intermediateState, {
                    type: 'CHANGE_SUPPORT_EMAIL',
                    storeName: 'Test Store',
                    newValue: true,
                    flags,
                    hasNewAutomatePlan: true,
                })

                expect(newState['Test Store'].sales.enabled).toBe(true)
                expect(newState['Test Store'].sales.isDisabled).toBe(false)
            })
        },
    )

    describe.each([
        { hasAiAgentNewActivationXp: true },
        { hasAiAgentNewActivationXp: false },
    ])(
        'when aiSalesAgentEmailEnabled is false + beta on new automation plan + hasAiAgentNewActivationXp is $hasAiAgentNewActivationXp',
        ({ hasAiAgentNewActivationXp }) => {
            const flags = {
                hasAiAgentNewActivationXp,
                aiSalesAgentEmailEnabled: false,
            }

            it('should enable sales when only chat is enabled', () => {
                const state = storeConfigurationToState(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [mockStoreConfig],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    emailIntegrations: [
                        {
                            id: 2,
                        } as any,
                    ],
                    helpCentersFaq,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const state2 = reducer(state, {
                    type: 'CHANGE_SUPPORT_EMAIL',
                    storeName: 'Test Store',
                    newValue: false,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const state3 = reducer(state2, {
                    type: 'CHANGE_SUPPORT_CHAT',
                    storeName: 'Test Store',
                    newValue: true,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const newState = changeSales(state3, flags)

                expect(newState['Test Store'].sales.enabled).toBe(true)
                expect(newState['Test Store'].sales.isDisabled).toBe(false)
            })

            it('should enable sales when only email is enabled', () => {
                if (flags.hasAiAgentNewActivationXp) {
                    // This test is irrelevant for the new activation flow because sales setting is based on beta+plan
                    return
                }

                const state = storeConfigurationToState(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [mockStoreConfig],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    emailIntegrations: [
                        {
                            id: 2,
                        } as any,
                    ],
                    helpCentersFaq,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const state2 = reducer(state, {
                    type: 'CHANGE_SUPPORT_CHAT',
                    storeName: 'Test Store',
                    newValue: false,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const state3 = reducer(state2, {
                    type: 'CHANGE_SUPPORT_EMAIL',
                    storeName: 'Test Store',
                    newValue: true,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const newState = changeSales(state3, flags)

                expect(newState['Test Store'].sales.enabled).toBe(false)
                expect(newState['Test Store'].sales.isDisabled).toBe(false)
            })

            it('should not support sales when none is enabled', () => {
                if (flags.hasAiAgentNewActivationXp) {
                    // This test is irrelevant for the new activation flow because sales setting is based on beta+plan
                    return
                }

                const state = storeConfigurationToState(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [mockStoreConfig],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    emailIntegrations: [
                        {
                            id: 2,
                        } as any,
                    ],
                    helpCentersFaq,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const state2 = reducer(state, {
                    type: 'CHANGE_SUPPORT_EMAIL',
                    storeName: 'Test Store',
                    newValue: false,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const newState = reducer(state2, {
                    type: 'CHANGE_SUPPORT_CHAT',
                    storeName: 'Test Store',
                    newValue: false,
                    flags,
                    hasNewAutomatePlan: true,
                })

                expect(newState['Test Store'].sales.enabled).toBe(false)
                expect(newState['Test Store'].sales.isDisabled).toBe(true)
            })

            it('should disable sales when support is disabled', () => {
                if (flags.hasAiAgentNewActivationXp) {
                    // This test is irrelevant for the new activation flow because we cannot toggle support
                    return
                }

                const state = storeConfigurationToState(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [mockStoreConfig],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    emailIntegrations: [
                        {
                            id: 2,
                        } as any,
                    ],
                    helpCentersFaq,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const newState = changeSupport(state, flags)

                expect(newState['Test Store'].sales.enabled).toBe(false)
                expect(newState['Test Store'].sales.isDisabled).toBe(true)
            })

            it('should not affect sales when enabling email if chat is already enabled', () => {
                const state = storeConfigurationToState(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [
                        {
                            ...mockStoreConfig,
                            scopes: [AiAgentScope.Support, AiAgentScope.Sales],
                        },
                    ],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    emailIntegrations: [
                        {
                            id: 2,
                        } as any,
                    ],
                    helpCentersFaq,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const intermediateState = reducer(state, {
                    type: 'CHANGE_SUPPORT_CHAT',
                    storeName: 'Test Store',
                    newValue: true,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const newState = reducer(intermediateState, {
                    type: 'CHANGE_SUPPORT_EMAIL',
                    storeName: 'Test Store',
                    newValue: true,
                    flags,
                    hasNewAutomatePlan: true,
                })

                expect(newState['Test Store'].sales.enabled).toBe(true)
                expect(newState['Test Store'].sales.isDisabled).toBe(false)
            })
        },
    )

    it.each([
        {
            description: 'no knowledge (undefined) and no public resources',
            helpCentersFaq: undefined,
            helpCenterId: STORE_HELP_CENTER_ID,
            storesKnowledgeStatus: {
                [mockStoreConfig.storeName]: {
                    has_public_resources: false,
                },
            } as any,
        },
        {
            description: 'no knowledge (empty) and no public resources',
            helpCentersFaq: [],
            helpCenterId: STORE_HELP_CENTER_ID,
            storesKnowledgeStatus: {
                [mockStoreConfig.storeName]: {
                    has_public_resources: false,
                },
            } as any,
        },
        {
            description:
                'helpcenter not find in knowledge and no public resources',
            helpCentersFaq: [{ id: 2 } as Components.Schemas.GetHelpCenterDto],
            helpCenterId: STORE_HELP_CENTER_ID,
            storesKnowledgeStatus: {
                [mockStoreConfig.storeName]: {
                    has_public_resources: false,
                },
            } as any,
        },
    ])(
        'should show an alert and disable email + chat when $description',
        ({ helpCentersFaq, helpCenterId, storesKnowledgeStatus }) => {
            const state = reducer(EMPTY_STATE, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [{ ...mockStoreConfig, helpCenterId }],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                emailIntegrations: [
                    {
                        id: 2,
                    } as any,
                ],
                chatIntegrationStatus: [{ chatId: 1, installed: true } as any],
                helpCentersFaq,
                storesKnowledgeStatus,
                flags: {
                    hasAiAgentNewActivationXp: false,
                    aiSalesAgentEmailEnabled: false,
                },
                hasNewAutomatePlan: false,
            })

            expect(state['Test Store'].support.email.enabled).toBe(false)
            expect(state['Test Store'].support.chat.enabled).toBe(false)
            expect(state['Test Store'].sales.enabled).toBe(false)
            expect(state['Test Store'].alerts).toEqual([
                {
                    kind: KNOWLEDGE_ALERT_KIND,
                    cta: {
                        label: 'Visit Knowledge',
                        to: '/app/ai-agent/shopify/Test Store/knowledge',
                    },
                    message:
                        'At least one knowledge source required. Update your knowledge tab to be able to activate AI Agent.',
                    type: 'warning',
                },
            ])
        },
    )

    it.each([
        {
            description:
                'helpcenter found in knowledge and no public resources',
            helpCentersFaq: [
                {
                    id: STORE_HELP_CENTER_ID,
                } as Components.Schemas.GetHelpCenterDto,
            ],
            helpCenterId: STORE_HELP_CENTER_ID,
            storesKnowledgeStatus: {
                [mockStoreConfig.storeName]: {
                    has_public_resources: false,
                },
            } as any,
        },
        {
            description:
                'no helpcenter found in knowledge and has public resources',
            helpCentersFaq: [{ id: 2 } as Components.Schemas.GetHelpCenterDto],
            helpCenterId: STORE_HELP_CENTER_ID,
            storesKnowledgeStatus: {
                [mockStoreConfig.storeName]: {
                    has_public_resources: true,
                },
            } as any,
        },
    ])(
        'should have no alert when $description',
        ({ helpCentersFaq, helpCenterId, storesKnowledgeStatus }) => {
            const state = reducer(EMPTY_STATE, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [{ ...mockStoreConfig, helpCenterId }],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                emailIntegrations: [
                    {
                        id: 2,
                    } as any,
                ],
                chatIntegrationStatus: [{ chatId: 1, installed: true } as any],
                helpCentersFaq,
                storesKnowledgeStatus,
                flags: {
                    hasAiAgentNewActivationXp: false,
                    aiSalesAgentEmailEnabled: false,
                },
                hasNewAutomatePlan: false,
            })

            expect(state['Test Store'].support.email.enabled).toBe(true)
            expect(state['Test Store'].support.chat.enabled).toBe(true)
            expect(state['Test Store'].sales.enabled).toBe(false)
            expect(state['Test Store'].alerts).toHaveLength(0)
        },
    )

    it('should disable chat when no chat installed', () => {
        const state = reducer(EMPTY_STATE, {
            type: 'UPDATE_STORE_CONFIGURATION',
            storeConfigurations: [
                { ...mockStoreConfig, monitoredChatIntegrations: [1] },
            ],
            selfServiceChatChannels: {
                'Test Store': [
                    { value: { id: 1 } } as any,
                    { value: { id: 2 } } as any,
                ],
            },
            emailIntegrations: [
                {
                    id: 2,
                } as any,
            ],
            chatIntegrationStatus: [
                { chatId: 1, installed: false } as any,
                { chatId: 2, installed: true } as any,
            ],
            helpCentersFaq,
            // No impact on chat enabled/disabled
            flags: {
                hasAiAgentNewActivationXp: false,
                aiSalesAgentEmailEnabled: false,
            },
            hasNewAutomatePlan: false,
        })

        expect(state['Test Store'].support.chat.enabled).toBe(false)
        expect(state['Test Store'].support.chat.isIntegrationMissing).toBe(
            false,
        )
        expect(state['Test Store'].support.chat.isInstallationMissing).toBe(
            true,
        )
        expect(state['Test Store'].support.chat.availableChats).toEqual([1])
    })

    it('should disable chat when no chat not in selfservice', () => {
        const state = reducer(EMPTY_STATE, {
            type: 'UPDATE_STORE_CONFIGURATION',
            storeConfigurations: [mockStoreConfig],
            selfServiceChatChannels: {
                'Test Store': [],
            },
            emailIntegrations: [
                {
                    id: 2,
                } as any,
            ],
            chatIntegrationStatus: [{ chatId: 1, installed: false } as any],
            helpCentersFaq,
            // No impact on chat enabled/disabled
            flags: {
                hasAiAgentNewActivationXp: false,
                aiSalesAgentEmailEnabled: false,
            },
            hasNewAutomatePlan: false,
        })

        expect(state['Test Store'].support.chat.enabled).toBe(false)
        expect(state['Test Store'].support.chat.isIntegrationMissing).toBe(true)
        expect(state['Test Store'].support.chat.isInstallationMissing).toBe(
            false,
        )
        expect(state['Test Store'].support.chat.availableChats).toEqual([])
    })

    it('should disable email when integration is not available', () => {
        const state = reducer(EMPTY_STATE, {
            type: 'UPDATE_STORE_CONFIGURATION',
            storeConfigurations: [
                {
                    ...mockStoreConfig,
                    monitoredEmailIntegrations: [
                        { id: 2, email: 'test@test.com' },
                    ],
                },
            ],
            selfServiceChatChannels: {
                'Test Store': [{ value: { id: 1 } } as any],
            },
            emailIntegrations: [
                {
                    id: 3,
                } as any,
            ],
            chatIntegrationStatus: [{ chatId: 1, installed: true } as any],
            helpCentersFaq,
            // No impact on email enabled/disabled
            flags: {
                hasAiAgentNewActivationXp: false,
                aiSalesAgentEmailEnabled: false,
            },
            hasNewAutomatePlan: false,
        })

        expect(state['Test Store'].support.email.enabled).toBe(false)
        expect(state['Test Store'].support.email.isIntegrationMissing).toBe(
            true,
        )
    })

    describe('isSalesEnabledWithNewActivationXp', () => {
        it('should return true if beta account on new pricing and does not have sales', () => {
            expect(
                isSalesEnabledWithNewActivationXp({
                    hasNewAutomatePlan: true,
                    storeHasSales: false,
                }),
            ).toBe(true)
        })

        it('should return false if beta account not on new pricing and does not have sales', () => {
            expect(
                isSalesEnabledWithNewActivationXp({
                    hasNewAutomatePlan: false,
                    storeHasSales: false,
                }),
            ).toBe(false)
        })

        it('should return true if it has already sales', () => {
            expect(
                isSalesEnabledWithNewActivationXp({
                    hasNewAutomatePlan: false,
                    storeHasSales: true,
                }),
            ).toBe(true)
        })
    })

    describe('stateToUpdatedStoreConfiguration', () => {
        describe('when account has sales', () => {
            // Has sales
            const flags = {
                hasAiAgentNewActivationXp: true,
                aiSalesAgentEmailEnabled: true,
            }

            it('should add support+sales scope and default sales settings when activating sales', () => {
                const state = storeConfigurationToState(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [{ ...mockStoreConfig, scopes: [] }],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    helpCentersFaq,
                    ldFlags: LD_FLAGS,
                    flags,
                    hasNewAutomatePlan: true,
                    emailIntegrations: [
                        {
                            id: 2,
                        } as any,
                    ],
                } as any)

                const result = stateToUpdatedStoreConfiguration(state)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual(
                    expect.objectContaining({
                        scopes: [AiAgentScope.Support, AiAgentScope.Sales],
                        salesPersuasionLevel: PersuasionLevel.Educational,
                        salesDiscountStrategyLevel: DiscountStrategy.NoDiscount,
                        salesDiscountMax: null,
                    }),
                )
            })

            it('should not change sales settings when sales is already activated', () => {
                const state = reducer(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [
                        {
                            ...mockStoreConfig,
                            scopes: [AiAgentScope.Support, AiAgentScope.Sales],
                            salesPersuasionLevel: PersuasionLevel.Assertive,
                            salesDiscountStrategyLevel:
                                DiscountStrategy.Maximized,
                            salesDiscountMax: 10,
                        },
                    ],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    helpCentersFaq,
                    flags,
                    hasNewAutomatePlan: true,
                    emailIntegrations: [
                        {
                            id: 2,
                        } as any,
                    ],
                })

                const result = stateToUpdatedStoreConfiguration(state)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual(
                    expect.objectContaining({
                        scopes: expect.arrayContaining([
                            AiAgentScope.Sales,
                            AiAgentScope.Support,
                        ]),
                        salesPersuasionLevel: PersuasionLevel.Assertive,
                        salesDiscountStrategyLevel: DiscountStrategy.Maximized,
                        salesDiscountMax: 10,
                        chatChannelDeactivatedDatetime: null,
                        emailChannelDeactivatedDatetime: null,
                    }),
                )
            })

            it('should not override chatChannelDeactivatedDatetime or emailChannelDeactivatedDatetime when chat not changed', () => {
                const chatChannelDeactivatedDatetime =
                    '2025-04-24T00:00:00.000Z'
                const emailChannelDeactivatedDatetime =
                    '2025-04-25T00:00:00.000Z'

                const state = reducer(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [
                        {
                            ...mockStoreConfig,
                            chatChannelDeactivatedDatetime,
                            emailChannelDeactivatedDatetime,
                        },
                    ],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    helpCentersFaq,
                    flags,
                    hasNewAutomatePlan: true,
                    emailIntegrations: [
                        {
                            id: 2,
                        } as any,
                    ],
                })

                const result = stateToUpdatedStoreConfiguration(state)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual(
                    expect.objectContaining({
                        chatChannelDeactivatedDatetime,
                        emailChannelDeactivatedDatetime,
                    }),
                )
            })

            it('should set chatChannelDeactivatedDatetime or emailChannelDeactivatedDatetime when changing from on to off', () => {
                const state = reducer(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [
                        {
                            ...mockStoreConfig,
                            chatChannelDeactivatedDatetime: null,
                            emailChannelDeactivatedDatetime: null,
                        },
                    ],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    helpCentersFaq,
                    flags,
                    hasNewAutomatePlan: true,
                    emailIntegrations: [
                        {
                            id: 2,
                        } as any,
                    ],
                })

                const state2 = reducer(state, {
                    type: 'CHANGE_SUPPORT_CHAT',
                    storeName: 'Test Store',
                    newValue: false,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const state3 = reducer(state2, {
                    type: 'CHANGE_SUPPORT_EMAIL',
                    storeName: 'Test Store',
                    newValue: false,
                    flags,
                    hasNewAutomatePlan: true,
                })

                const result = stateToUpdatedStoreConfiguration(state3)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual(
                    expect.objectContaining({
                        chatChannelDeactivatedDatetime: expect.any(String),
                        emailChannelDeactivatedDatetime: expect.any(String),
                    }),
                )
            })
        })

        describe('when account does not have sales', () => {
            // Does not have sales
            const flags = {
                hasAiAgentNewActivationXp: false,
                aiSalesAgentEmailEnabled: false,
            }

            it('should add support scope', () => {
                const state = storeConfigurationToState(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [{ ...mockStoreConfig, scopes: [] }],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    helpCentersFaq,
                    flags,
                    hasNewAutomatePlan: true,
                    emailIntegrations: [
                        {
                            id: 2,
                        } as any,
                    ],
                })

                const result = stateToUpdatedStoreConfiguration(state)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual(
                    expect.objectContaining({
                        scopes: [AiAgentScope.Support],
                    }),
                )
            })
        })
    })

    describe('getChatActivation', () => {
        it('should enable chat when chat in selfservice, is installed and has knowledge', () => {
            const { enabled, installationMissing, integrationMissing } =
                getChatActivation({
                    storeConfiguration: mockStoreConfig,
                    selfServiceChatChannels: [{ value: { id: 1 } } as any],
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    helpCentersFaq,
                })

            expect(enabled).toBe(true)
            expect(integrationMissing).toBe(false)
            expect(installationMissing).toBe(false)
        })

        it('should enable chat when support scope is missing but chat is installed', () => {
            const { enabled, installationMissing, integrationMissing } =
                getChatActivation({
                    storeConfiguration: { ...mockStoreConfig, scopes: [] },
                    selfServiceChatChannels: [{ value: { id: 1 } } as any],
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    helpCentersFaq,
                })

            expect(enabled).toBe(true)
            expect(integrationMissing).toBe(false)
            expect(installationMissing).toBe(false)
        })

        it('should disable chat when chat deactivation date is present but chat is installed', () => {
            const { enabled, installationMissing, integrationMissing } =
                getChatActivation({
                    storeConfiguration: {
                        ...mockStoreConfig,
                        chatChannelDeactivatedDatetime:
                            '2025-04-24T00:00:00.000Z',
                    },
                    selfServiceChatChannels: [{ value: { id: 1 } } as any],
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                    helpCentersFaq,
                })

            expect(enabled).toBe(false)
            expect(integrationMissing).toBe(false)
            expect(installationMissing).toBe(false)
        })

        it('should disable chat when knowledge is missing but chat is installed', () => {
            const { enabled, installationMissing, integrationMissing } =
                getChatActivation({
                    storeConfiguration: mockStoreConfig,
                    selfServiceChatChannels: [{ value: { id: 1 } } as any],
                    chatIntegrationStatus: [
                        { chatId: 1, installed: true } as any,
                    ],
                })

            expect(enabled).toBe(false)
            expect(integrationMissing).toBe(false)
            expect(installationMissing).toBe(false)
        })

        it('should disable chat when no chat installed but integration is not missing', () => {
            const { enabled, installationMissing, integrationMissing } =
                getChatActivation({
                    storeConfiguration: mockStoreConfig,
                    selfServiceChatChannels: [{ value: { id: 1 } } as any],
                    chatIntegrationStatus: [
                        { chatId: 1, installed: false } as any,
                    ],
                    helpCentersFaq,
                })

            expect(enabled).toBe(false)
            expect(integrationMissing).toBe(false)
            expect(installationMissing).toBe(true)
        })

        it('should disable chat when no chat not in selfservice', () => {
            const { enabled, installationMissing, integrationMissing } =
                getChatActivation({
                    storeConfiguration: mockStoreConfig,
                    selfServiceChatChannels: [],
                    chatIntegrationStatus: [
                        { chatId: 1, installed: false } as any,
                    ],
                    helpCentersFaq,
                })

            expect(enabled).toBe(false)
            expect(integrationMissing).toBe(true)
            expect(installationMissing).toBe(false)
        })

        it('should return available chat integrations', () => {
            const { availableMonitoredChat } = getChatActivation({
                storeConfiguration: mockStoreConfig,
                selfServiceChatChannels: [{ value: { id: 1 } } as any],
                chatIntegrationStatus: [
                    { chatId: 1, installed: true },
                    { chatId: 2, installed: true },
                ] as any,
                helpCentersFaq,
            })

            expect(availableMonitoredChat).toStrictEqual([1])
        })
    })

    describe('UPDATE_PRICING action', () => {
        it('should update sales enabled status when hasNewAutomatePlan changes to true', () => {
            const initialState = storeConfigurationToState(EMPTY_STATE, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [
                    {
                        ...mockStoreConfig,
                        scopes: [AiAgentScope.Support, AiAgentScope.Sales],
                    },
                ],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                chatIntegrationStatus: [{ chatId: 1, installed: true } as any],
                emailIntegrations: [{ id: 2 } as any],
                helpCentersFaq,
                flags: {
                    hasAiAgentNewActivationXp: true,
                    aiSalesAgentEmailEnabled: true,
                },
                hasNewAutomatePlan: false,
            })

            expect(initialState['Test Store'].sales.enabled).toBe(true)
            expect(initialState['Test Store'].sales.isDisabled).toBe(false)

            const updatedState = reducer(initialState, {
                type: 'UPDATE_PRICING',
                flags: {
                    hasAiAgentNewActivationXp: true,
                    aiSalesAgentEmailEnabled: true,
                },
            })

            expect(updatedState['Test Store'].sales.enabled).toBe(true)
            expect(updatedState['Test Store'].sales.isDisabled).toBe(false)
        })

        it('should disable sales when store does not have sales scope and hasNewAutomatePlan is false', () => {
            const initialState = storeConfigurationToState(EMPTY_STATE, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [
                    {
                        ...mockStoreConfig,
                        scopes: [AiAgentScope.Support],
                    },
                ],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                chatIntegrationStatus: [{ chatId: 1, installed: true } as any],
                emailIntegrations: [{ id: 2 } as any],
                helpCentersFaq,
                flags: {
                    hasAiAgentNewActivationXp: true,
                    aiSalesAgentEmailEnabled: true,
                },
                hasNewAutomatePlan: false,
            })

            expect(initialState['Test Store'].sales.enabled).toBe(false)
            expect(initialState['Test Store'].sales.isDisabled).toBe(true)

            const updatedState = reducer(initialState, {
                type: 'UPDATE_PRICING',
                flags: {
                    hasAiAgentNewActivationXp: true,
                    aiSalesAgentEmailEnabled: true,
                },
            })

            expect(updatedState['Test Store'].sales.enabled).toBe(true)
            expect(updatedState['Test Store'].sales.isDisabled).toBe(false)
        })

        it('should not update state when hasAiAgentNewActivationXp is false', () => {
            const initialState = storeConfigurationToState(EMPTY_STATE, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [mockStoreConfig],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                chatIntegrationStatus: [{ chatId: 1, installed: true } as any],
                emailIntegrations: [{ id: 2 } as any],
                helpCentersFaq,
                flags: {
                    hasAiAgentNewActivationXp: false,
                    aiSalesAgentEmailEnabled: false,
                },
                hasNewAutomatePlan: false,
            })

            const updatedState = reducer(initialState, {
                type: 'UPDATE_PRICING',
                flags: {
                    hasAiAgentNewActivationXp: false,
                    aiSalesAgentEmailEnabled: false,
                },
            })

            expect(updatedState).toEqual(initialState)
        })
    })

    describe('checkIsMissingKnowledge', () => {
        it('should return true when no knowledge sources are available', () => {
            const isMissing = checkIsMissingKnowledge({
                helpCentersFaq: [],
                helpCenterId: null,
                storeKnowledgeStatus: {
                    has_public_resources: false,
                    help_center_id: 123,
                    is_store_domain_synced: false,
                    has_external_documents: false,
                    shop_name: 'Test Store',
                },
            })

            expect(isMissing).toBe(true)
        })

        it('should return false when a help center is availble', () => {
            const isMissing = checkIsMissingKnowledge({
                helpCentersFaq: [{ id: 1 } as any],
                helpCenterId: 1,
                storeKnowledgeStatus: {
                    has_public_resources: false,
                    help_center_id: 123,
                    is_store_domain_synced: false,
                    has_external_documents: false,
                    shop_name: 'Test Store',
                },
            })

            expect(isMissing).toBe(false)
        })

        it('should return false when public resources are available', () => {
            const isMissing = checkIsMissingKnowledge({
                helpCentersFaq: [],
                helpCenterId: 1,
                storeKnowledgeStatus: {
                    has_public_resources: true,
                    help_center_id: 123,
                    is_store_domain_synced: false,
                    has_external_documents: false,
                    shop_name: 'Test Store',
                },
            })

            expect(isMissing).toBe(false)
        })

        it('should return true when store has been synced once', () => {
            const isMissing = checkIsMissingKnowledge({
                helpCentersFaq: [],
                helpCenterId: null,
                storeKnowledgeStatus: {
                    has_public_resources: false,
                    help_center_id: 123,
                    is_store_domain_synced: true,
                    has_external_documents: false,
                    shop_name: 'Test Store',
                },
            })

            expect(isMissing).toBe(false)
        })

        it('should return true when external documents are available', () => {
            const isMissing = checkIsMissingKnowledge({
                helpCentersFaq: [],
                helpCenterId: null,
                storeKnowledgeStatus: {
                    has_public_resources: false,
                    help_center_id: 123,
                    is_store_domain_synced: false,
                    has_external_documents: true,
                    shop_name: 'Test Store',
                },
            })

            expect(isMissing).toBe(false)
        })
    })
})
