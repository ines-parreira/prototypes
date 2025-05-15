import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { Components } from 'rest_api/help_center_api/client.generated'

import {
    Flags,
    isSalesEnabledWithNewActivationXp,
    KNOWLEDGE_ALERT_KIND,
    reducer,
    State,
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
                isAiSalesBetaUser: true,
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
                    helpCentersFaq,
                    ldFlags: LD_FLAGS,
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
                    helpCentersFaq,
                    ldFlags: LD_FLAGS,
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
                const state = storeConfigurationToState(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [mockStoreConfig],
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
                    helpCentersFaq,
                    ldFlags: LD_FLAGS,
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
                    helpCentersFaq,
                    ldFlags: LD_FLAGS,
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
                isAiSalesBetaUser: true,
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
                    helpCentersFaq,
                    ldFlags: LD_FLAGS,
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
                const state = storeConfigurationToState(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [mockStoreConfig],
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
                const state = storeConfigurationToState(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [mockStoreConfig],
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
                    helpCentersFaq,
                    ldFlags: LD_FLAGS,
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
                    helpCentersFaq,
                    ldFlags: LD_FLAGS,
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
            publicResources: {
                'Test Store': [],
            },
        },
        {
            description: 'no knowledge (empty) and no public resources',
            helpCentersFaq: [],
            helpCenterId: STORE_HELP_CENTER_ID,
            publicResources: {
                'Test Store': [],
            },
        },
        {
            description:
                'helpcenter not find in knowledge and no public resources',
            helpCentersFaq: [{ id: 2 } as Components.Schemas.GetHelpCenterDto],
            helpCenterId: STORE_HELP_CENTER_ID,
            publicResources: {
                'Test Store': [],
            },
        },
    ])(
        'should show an alert and disable email + chat when $description',
        ({ helpCentersFaq, helpCenterId, publicResources }) => {
            const state = reducer(EMPTY_STATE, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [{ ...mockStoreConfig, helpCenterId }],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                chatIntegrationStatus: [{ chatId: 1, installed: true } as any],
                helpCentersFaq,
                ldFlags: LD_FLAGS,
                publicResources,
                flags: {
                    isAiSalesBetaUser: false,
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
            publicResources: {
                'Test Store': [],
            },
        },
        {
            description:
                'no helpcenter found in knowledge and has public resources',
            helpCentersFaq: [{ id: 2 } as Components.Schemas.GetHelpCenterDto],
            helpCenterId: STORE_HELP_CENTER_ID,
            publicResources: {
                'Test Store': [{ id: 1 } as any],
            },
        },
    ])(
        'should have no alert when $description',
        ({ helpCentersFaq, helpCenterId, publicResources }) => {
            const state = reducer(EMPTY_STATE, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [{ ...mockStoreConfig, helpCenterId }],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                chatIntegrationStatus: [{ chatId: 1, installed: true } as any],
                helpCentersFaq,
                ldFlags: LD_FLAGS,
                publicResources,
                flags: {
                    isAiSalesBetaUser: false,
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
            chatIntegrationStatus: [
                { chatId: 1, installed: false } as any,
                { chatId: 2, installed: true } as any,
            ],
            helpCentersFaq,
            ldFlags: LD_FLAGS,
            // No impact on chat enabled/disabled
            flags: {
                isAiSalesBetaUser: false,
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
            chatIntegrationStatus: [{ chatId: 1, installed: false } as any],
            helpCentersFaq,
            ldFlags: LD_FLAGS,
            // No impact on chat enabled/disabled
            flags: {
                isAiSalesBetaUser: false,
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

    describe('isSalesEnabledWithNewActivationXp', () => {
        describe('when aiSalesAgentEmailEnabled is true', () => {
            const aiSalesAgentEmailEnabled = true

            describe.each([
                { isChatEnabled: true, isEmailEnabled: true },
                { isChatEnabled: true, isEmailEnabled: false },
                { isChatEnabled: false, isEmailEnabled: true },
            ])(
                'when chat is $isChatEnabled and email is $isEmailEnabled',
                ({ isChatEnabled, isEmailEnabled }) => {
                    it('should be true when beta account on new automate plan and store does not have sales', () => {
                        expect(
                            isSalesEnabledWithNewActivationXp({
                                isAiSalesBetaUser: true,
                                hasNewAutomatePlan: true,
                                storeHasSales: false,
                                aiSalesAgentEmailEnabled,
                                isChatEnabled,
                                isEmailEnabled,
                            }),
                        ).toBe(true)
                    })

                    it('should be true when beta account on new automate plan and store already has sales', () => {
                        expect(
                            isSalesEnabledWithNewActivationXp({
                                isAiSalesBetaUser: true,
                                hasNewAutomatePlan: true,
                                storeHasSales: true,
                                aiSalesAgentEmailEnabled,
                                isChatEnabled,
                                isEmailEnabled,
                            }),
                        ).toBe(true)
                    })

                    it('should be false when beta account on old automate plan and store does not have sales', () => {
                        expect(
                            isSalesEnabledWithNewActivationXp({
                                isAiSalesBetaUser: true,
                                hasNewAutomatePlan: false,
                                storeHasSales: false,
                                aiSalesAgentEmailEnabled,
                                isChatEnabled,
                                isEmailEnabled,
                            }),
                        ).toBe(false)
                    })

                    it('should be true when beta account on old automate plan and store already has sales (Alpha/Demo/Trial)', () => {
                        expect(
                            isSalesEnabledWithNewActivationXp({
                                isAiSalesBetaUser: true,
                                hasNewAutomatePlan: false,
                                storeHasSales: true,
                                aiSalesAgentEmailEnabled,
                                isChatEnabled,
                                isEmailEnabled,
                            }),
                        ).toBe(true)
                    })

                    it('should be false when not on beta account on new automate plan and store does not have sales', () => {
                        expect(
                            isSalesEnabledWithNewActivationXp({
                                isAiSalesBetaUser: false,
                                hasNewAutomatePlan: true,
                                storeHasSales: false,
                                aiSalesAgentEmailEnabled,
                                isChatEnabled,
                                isEmailEnabled,
                            }),
                        ).toBe(false)
                    })

                    it('should be true when not on beta account on new automate plan and store already has sales', () => {
                        expect(
                            isSalesEnabledWithNewActivationXp({
                                isAiSalesBetaUser: false,
                                hasNewAutomatePlan: true,
                                storeHasSales: true,
                                aiSalesAgentEmailEnabled,
                                isChatEnabled,
                                isEmailEnabled,
                            }),
                        ).toBe(true)
                    })
                },
            )

            describe('when chat is disabled and email is disabled', () => {
                const isChatEnabled = false
                const isEmailEnabled = false

                it('should be false when beta account on new automate plan and store does not have sales', () => {
                    expect(
                        isSalesEnabledWithNewActivationXp({
                            isAiSalesBetaUser: true,
                            hasNewAutomatePlan: true,
                            storeHasSales: false,
                            aiSalesAgentEmailEnabled,
                            isChatEnabled,
                            isEmailEnabled,
                        }),
                    ).toBe(false)
                })

                it('should be false when beta account on new automate plan and store already has sales', () => {
                    expect(
                        isSalesEnabledWithNewActivationXp({
                            isAiSalesBetaUser: true,
                            hasNewAutomatePlan: true,
                            storeHasSales: true,
                            aiSalesAgentEmailEnabled,
                            isChatEnabled,
                            isEmailEnabled,
                        }),
                    ).toBe(false)
                })

                it('should be false when beta account on old automate plan and store does not have sales', () => {
                    expect(
                        isSalesEnabledWithNewActivationXp({
                            isAiSalesBetaUser: true,
                            hasNewAutomatePlan: false,
                            storeHasSales: false,
                            aiSalesAgentEmailEnabled,
                            isChatEnabled,
                            isEmailEnabled,
                        }),
                    ).toBe(false)
                })

                it('should be false when beta account on old automate plan and store already has sales (Alpha/Demo/Trial)', () => {
                    expect(
                        isSalesEnabledWithNewActivationXp({
                            isAiSalesBetaUser: true,
                            hasNewAutomatePlan: false,
                            storeHasSales: true,
                            aiSalesAgentEmailEnabled,
                            isChatEnabled,
                            isEmailEnabled,
                        }),
                    ).toBe(false)
                })

                it('should be false when not on beta account on new automate plan and store does not have sales', () => {
                    expect(
                        isSalesEnabledWithNewActivationXp({
                            isAiSalesBetaUser: false,
                            hasNewAutomatePlan: true,
                            storeHasSales: false,
                            aiSalesAgentEmailEnabled,
                            isChatEnabled,
                            isEmailEnabled,
                        }),
                    ).toBe(false)
                })
            })
        })

        describe('when aiSalesAgentEmailEnabled is false', () => {
            const aiSalesAgentEmailEnabled = false

            describe('when chat is enabled and email is enabled', () => {
                const isChatEnabled = true
                const isEmailEnabled = true

                it('should be true when beta account on new automate plan and store does not have sales', () => {
                    expect(
                        isSalesEnabledWithNewActivationXp({
                            isAiSalesBetaUser: true,
                            hasNewAutomatePlan: true,
                            storeHasSales: false,
                            aiSalesAgentEmailEnabled,
                            isChatEnabled,
                            isEmailEnabled,
                        }),
                    ).toBe(true)
                })

                it('should be true when beta account on new automate plan and store already has sales', () => {
                    expect(
                        isSalesEnabledWithNewActivationXp({
                            isAiSalesBetaUser: true,
                            hasNewAutomatePlan: true,
                            storeHasSales: true,
                            aiSalesAgentEmailEnabled,
                            isChatEnabled,
                            isEmailEnabled,
                        }),
                    ).toBe(true)
                })

                it('should be false when beta account on old automate plan and store does not have sales', () => {
                    expect(
                        isSalesEnabledWithNewActivationXp({
                            isAiSalesBetaUser: true,
                            hasNewAutomatePlan: false,
                            storeHasSales: false,
                            aiSalesAgentEmailEnabled,
                            isChatEnabled,
                            isEmailEnabled,
                        }),
                    ).toBe(false)
                })

                it('should be true when beta account on old automate plan and store already has sales (Alpha/Demo/Trial)', () => {
                    expect(
                        isSalesEnabledWithNewActivationXp({
                            isAiSalesBetaUser: true,
                            hasNewAutomatePlan: false,
                            storeHasSales: true,
                            aiSalesAgentEmailEnabled,
                            isChatEnabled,
                            isEmailEnabled,
                        }),
                    ).toBe(true)
                })

                it('should be false when not on beta account on new automate plan and store does not have sales', () => {
                    expect(
                        isSalesEnabledWithNewActivationXp({
                            isAiSalesBetaUser: false,
                            hasNewAutomatePlan: true,
                            storeHasSales: false,
                            aiSalesAgentEmailEnabled,
                            isChatEnabled,
                            isEmailEnabled,
                        }),
                    ).toBe(false)
                })
            })

            describe('when chat is disabled and email is enabled', () => {
                const isChatEnabled = false
                const isEmailEnabled = true

                it('should be false when beta account on new automate plan and store does not have sales', () => {
                    expect(
                        isSalesEnabledWithNewActivationXp({
                            isAiSalesBetaUser: true,
                            hasNewAutomatePlan: true,
                            storeHasSales: false,
                            aiSalesAgentEmailEnabled,
                            isChatEnabled,
                            isEmailEnabled,
                        }),
                    ).toBe(false)
                })

                it('should be false when beta account on new automate plan and store already has sales', () => {
                    expect(
                        isSalesEnabledWithNewActivationXp({
                            isAiSalesBetaUser: true,
                            hasNewAutomatePlan: true,
                            storeHasSales: true,
                            aiSalesAgentEmailEnabled,
                            isChatEnabled,
                            isEmailEnabled,
                        }),
                    ).toBe(false)
                })

                it('should be false when beta account on old automate plan and store does not have sales', () => {
                    expect(
                        isSalesEnabledWithNewActivationXp({
                            isAiSalesBetaUser: true,
                            hasNewAutomatePlan: false,
                            storeHasSales: false,
                            aiSalesAgentEmailEnabled,
                            isChatEnabled,
                            isEmailEnabled,
                        }),
                    ).toBe(false)
                })

                it('should be false when beta account on old automate plan and store already has sales (Alpha/Demo/Trial)', () => {
                    expect(
                        isSalesEnabledWithNewActivationXp({
                            isAiSalesBetaUser: true,
                            hasNewAutomatePlan: false,
                            storeHasSales: true,
                            aiSalesAgentEmailEnabled,
                            isChatEnabled,
                            isEmailEnabled,
                        }),
                    ).toBe(false)
                })

                it('should be false when not on beta account on new automate plan and store does not have sales', () => {
                    expect(
                        isSalesEnabledWithNewActivationXp({
                            isAiSalesBetaUser: false,
                            hasNewAutomatePlan: true,
                            storeHasSales: false,
                            aiSalesAgentEmailEnabled,
                            isChatEnabled,
                            isEmailEnabled,
                        }),
                    ).toBe(false)
                })
            })
        })
    })

    describe('stateToUpdatedStoreConfiguration', () => {
        const flags = {
            isAiSalesBetaUser: true,
            hasAiAgentNewActivationXp: true,
            aiSalesAgentEmailEnabled: true,
        }

        it('should add sales scope and default sales settings when activating sales', () => {
            const state = storeConfigurationToState(EMPTY_STATE, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [
                    { ...mockStoreConfig, scopes: [AiAgentScope.Support] },
                ],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                chatIntegrationStatus: [{ chatId: 1, installed: true } as any],
                helpCentersFaq,
                ldFlags: LD_FLAGS,
                flags,
                hasNewAutomatePlan: true,
            })

            const result = stateToUpdatedStoreConfiguration(state)

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(
                expect.objectContaining({
                    scopes: expect.arrayContaining([
                        AiAgentScope.Sales,
                        AiAgentScope.Support,
                    ]),
                    salesPersuasionLevel: PersuasionLevel.Educational,
                    salesDiscountStrategyLevel: DiscountStrategy.NoDiscount,
                    salesDiscountMax: null,
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: null,
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
                        salesDiscountStrategyLevel: DiscountStrategy.Maximized,
                        salesDiscountMax: 10,
                    },
                ],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                chatIntegrationStatus: [{ chatId: 1, installed: true } as any],
                helpCentersFaq,
                ldFlags: LD_FLAGS,
                flags,
                hasNewAutomatePlan: true,
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
            const chatChannelDeactivatedDatetime = '2025-04-24T00:00:00.000Z'
            const emailChannelDeactivatedDatetime = '2025-04-25T00:00:00.000Z'

            const state = reducer(EMPTY_STATE, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [
                    {
                        ...mockStoreConfig,
                        scopes: [],
                        chatChannelDeactivatedDatetime,
                        emailChannelDeactivatedDatetime,
                    },
                ],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                chatIntegrationStatus: [{ chatId: 1, installed: true } as any],
                helpCentersFaq,
                ldFlags: LD_FLAGS,
                flags,
                hasNewAutomatePlan: true,
            })

            const result = stateToUpdatedStoreConfiguration(state)

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(
                expect.objectContaining({
                    scopes: [],
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
                        scopes: [AiAgentScope.Support],
                        chatChannelDeactivatedDatetime: null,
                        emailChannelDeactivatedDatetime: null,
                    },
                ],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                chatIntegrationStatus: [{ chatId: 1, installed: true } as any],
                helpCentersFaq,
                ldFlags: LD_FLAGS,
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
                newValue: false,
                flags,
                hasNewAutomatePlan: true,
            })

            const result = stateToUpdatedStoreConfiguration(state3)

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(
                expect.objectContaining({
                    scopes: [],
                    chatChannelDeactivatedDatetime: expect.any(String),
                    emailChannelDeactivatedDatetime: expect.any(String),
                }),
            )
        })
    })
})
