import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { Components } from 'rest_api/help_center_api/client.generated'

import {
    KNOWLEDGE_ALERT_KIND,
    reducer,
    storeConfigurationToState,
} from '../storeActivationReducer'

jest.mock('pages/aiAgent/Activation/utils', () => ({
    ...jest.requireActual('pages/aiAgent/Activation/utils'),
    getAiSalesAgentEmailEnabledFlag: jest.fn(() => true),
}))

const helpCentersFaq = [{ id: 1 } as Components.Schemas.GetHelpCenterDto]

describe('storeActivationReducer', () => {
    const EMPTY_STATE = {}
    const flags = {}

    const mockStoreConfig: StoreConfiguration = {
        storeName: 'Test Store',
        scopes: [AiAgentScope.Support],
        chatChannelDeactivatedDatetime: null,
        emailChannelDeactivatedDatetime: null,
        monitoredChatIntegrations: [1],
        monitoredEmailIntegrations: [{ id: 2, email: 'test@example.com' }],
        helpCenterId: 1,
    } as any

    describe('when getAiSalesAgentEmailEnabledFlag is true', () => {
        it('should enable sales when only email is enabled', () => {
            const state = storeConfigurationToState(EMPTY_STATE, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [mockStoreConfig],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                helpCentersFaq,
                flags,
            })

            const state2 = reducer(state, {
                type: 'CHANGE_SUPPORT_CHAT',
                storeName: 'Test Store',
                newValue: false,
            })

            const newState = reducer(state2, {
                type: 'CHANGE_SALES',
                storeName: 'Test Store',
                newValue: true,
            })

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
                helpCentersFaq,
                flags,
            })

            const state2 = reducer(state, {
                type: 'CHANGE_SUPPORT_EMAIL',
                storeName: 'Test Store',
                newValue: false,
            })

            const state3 = reducer(state2, {
                type: 'CHANGE_SUPPORT_CHAT',
                storeName: 'Test Store',
                newValue: true,
            })

            const newState = reducer(state3, {
                type: 'CHANGE_SALES',
                storeName: 'Test Store',
                newValue: true,
            })

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
                helpCentersFaq,
                flags,
            })

            const state2 = reducer(state, {
                type: 'CHANGE_SUPPORT_EMAIL',
                storeName: 'Test Store',
                newValue: false,
            })

            const newState = reducer(state2, {
                type: 'CHANGE_SUPPORT_CHAT',
                storeName: 'Test Store',
                newValue: false,
            })

            expect(newState['Test Store'].sales.enabled).toBe(false)
            expect(newState['Test Store'].sales.isDisabled).toBe(true)
        })

        it('should disable sales when support is disabled', () => {
            const state = storeConfigurationToState(EMPTY_STATE, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [mockStoreConfig],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                helpCentersFaq,
                flags,
            })

            const newState = reducer(state, {
                type: 'CHANGE_SUPPORT',
                storeName: 'Test Store',
                newValue: false,
            })

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
                helpCentersFaq,
                flags,
            })

            const intermediateState = reducer(state, {
                type: 'CHANGE_SUPPORT_CHAT',
                storeName: 'Test Store',
                newValue: true,
            })

            const newState = reducer(intermediateState, {
                type: 'CHANGE_SUPPORT_EMAIL',
                storeName: 'Test Store',
                newValue: true,
            })

            expect(newState['Test Store'].sales.enabled).toBe(true)
            expect(newState['Test Store'].sales.isDisabled).toBe(false)
        })

        it.each([
            {
                description: 'no knowledge (undefined)',
                helpCentersFaq: undefined,
                helpCenterId: 1,
            },
            {
                description: 'no knowledge (empty)',
                helpCentersFaq: [],
                helpCenterId: 1,
            },
            {
                description: 'helpcenter not find in knowledge',
                helpCentersFaq: [
                    { id: 2 } as Components.Schemas.GetHelpCenterDto,
                ],
                helpCenterId: 1,
            },
        ])(
            'should show an alert and disable email + chat when $description',
            ({ helpCentersFaq, helpCenterId }) => {
                const state = reducer(EMPTY_STATE, {
                    type: 'UPDATE_STORE_CONFIGURATION',
                    storeConfigurations: [{ ...mockStoreConfig, helpCenterId }],
                    selfServiceChatChannels: {
                        'Test Store': [{ value: { id: 1 } } as any],
                    },
                    helpCentersFaq,
                    flags,
                })

                expect(state['Test Store'].support.email.enabled).toBe(false)
                expect(state['Test Store'].support.chat.enabled).toBe(false)
                expect(state['Test Store'].sales.enabled).toBe(false)
                expect(state['Test Store'].alerts).toEqual([
                    {
                        kind: KNOWLEDGE_ALERT_KIND,
                        cta: {
                            label: 'Visit Knowledge',
                            to: '/app/automation/shopify/Test Store/ai-agent/knowledge',
                        },
                        message:
                            'At least one knowledge source required. Update your knowledge tab to be able to activate AI Agent.',
                        type: 'warning',
                    },
                ])
            },
        )
    })

    describe('when getAiSalesAgentEmailEnabledFlag is false', () => {
        beforeEach(() => {
            jest.mock('pages/aiAgent/Activation/utils', () => ({
                ...jest.requireActual('pages/aiAgent/Activation/utils'),
                getAiSalesAgentEmailEnabledFlag: jest.fn(() => false),
            }))
            jest.resetModules()
        })

        it('should enable sales when only chat is enabled', () => {
            const {
                storeConfigurationToState,
                reducer,
            } = require('../storeActivationReducer')

            const state = storeConfigurationToState(EMPTY_STATE, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [mockStoreConfig],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                helpCentersFaq,
                flags,
            })

            const state2 = reducer(state, {
                type: 'CHANGE_SUPPORT_EMAIL',
                storeName: 'Test Store',
                newValue: false,
            })

            const state3 = reducer(state2, {
                type: 'CHANGE_SUPPORT_CHAT',
                storeName: 'Test Store',
                newValue: true,
            })

            const newState = reducer(state3, {
                type: 'CHANGE_SALES',
                storeName: 'Test Store',
                newValue: true,
            })

            expect(newState['Test Store'].sales.enabled).toBe(true)
            expect(newState['Test Store'].sales.isDisabled).toBe(false)
        })

        it('should enable sales when only email is enabled', () => {
            const {
                storeConfigurationToState,
                reducer,
            } = require('../storeActivationReducer')

            const state = storeConfigurationToState(EMPTY_STATE, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [mockStoreConfig],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                helpCentersFaq,
                flags,
            })

            const state2 = reducer(state, {
                type: 'CHANGE_SUPPORT_CHAT',
                storeName: 'Test Store',
                newValue: false,
            })

            const state3 = reducer(state2, {
                type: 'CHANGE_SUPPORT_EMAIL',
                storeName: 'Test Store',
                newValue: true,
            })

            const newState = reducer(state3, {
                type: 'CHANGE_SALES',
                storeName: 'Test Store',
                newValue: true,
            })

            expect(newState['Test Store'].sales.enabled).toBe(false)
            expect(newState['Test Store'].sales.isDisabled).toBe(true)
        })

        it('should not support sales when none is enabled', () => {
            const {
                storeConfigurationToState,
                reducer,
            } = require('../storeActivationReducer')
            const state = storeConfigurationToState(EMPTY_STATE, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [mockStoreConfig],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                helpCentersFaq,
                flags,
            })

            const state2 = reducer(state, {
                type: 'CHANGE_SUPPORT_EMAIL',
                storeName: 'Test Store',
                newValue: false,
            })

            const newState = reducer(state2, {
                type: 'CHANGE_SUPPORT_CHAT',
                storeName: 'Test Store',
                newValue: false,
            })

            expect(newState['Test Store'].sales.enabled).toBe(false)
            expect(newState['Test Store'].sales.isDisabled).toBe(true)
        })

        it('should disable sales when support is disabled', () => {
            const {
                storeConfigurationToState,
                reducer,
            } = require('../storeActivationReducer')
            const state = storeConfigurationToState(EMPTY_STATE, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [mockStoreConfig],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
                helpCentersFaq,
                flags,
            })

            const newState = reducer(state, {
                type: 'CHANGE_SUPPORT',
                storeName: 'Test Store',
                newValue: false,
            })

            expect(newState['Test Store'].sales.enabled).toBe(false)
            expect(newState['Test Store'].sales.isDisabled).toBe(true)
        })

        it('should not affect sales when enabling email if chat is already enabled', () => {
            const {
                storeConfigurationToState,
                reducer,
            } = require('../storeActivationReducer')
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
                helpCentersFaq,
                flags,
            })

            const intermediateState = reducer(state, {
                type: 'CHANGE_SUPPORT_CHAT',
                storeName: 'Test Store',
                newValue: true,
            })

            const newState = reducer(intermediateState, {
                type: 'CHANGE_SUPPORT_EMAIL',
                storeName: 'Test Store',
                newValue: true,
            })

            expect(newState['Test Store'].sales.enabled).toBe(true)
            expect(newState['Test Store'].sales.isDisabled).toBe(false)
        })
    })
})
