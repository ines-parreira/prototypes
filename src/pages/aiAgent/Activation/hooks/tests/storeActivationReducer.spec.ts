import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'

import { reducer, storeConfigurationToState } from '../storeActivationReducer'

jest.mock('pages/aiAgent/Activation/utils', () => ({
    ...jest.requireActual('pages/aiAgent/Activation/utils'),
    getAiSalesAgentEmailEnabledFlag: jest.fn(() => true),
}))

describe('storeActivationReducer', () => {
    const initialState = {}

    const mockStoreConfig: StoreConfiguration = {
        storeName: 'Test Store',
        scopes: [AiAgentScope.Support],
        chatChannelDeactivatedDatetime: null,
        emailChannelDeactivatedDatetime: null,
        monitoredChatIntegrations: [1],
        monitoredEmailIntegrations: [{ id: 2, email: 'test@example.com' }],
        helpCenterId: null,
    } as any

    describe('when getAiSalesAgentEmailEnabledFlag is true', () => {
        it('should enable sales when only email is enabled', () => {
            const state = storeConfigurationToState(initialState, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [mockStoreConfig],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
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
            const state = storeConfigurationToState(initialState, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [mockStoreConfig],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
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
            const state = storeConfigurationToState(initialState, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [mockStoreConfig],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
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
            const state = storeConfigurationToState(initialState, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [mockStoreConfig],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
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
            const state = storeConfigurationToState(initialState, {
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

            const state = storeConfigurationToState(initialState, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [mockStoreConfig],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
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

            const state = storeConfigurationToState(initialState, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [mockStoreConfig],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
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
            const state = storeConfigurationToState(initialState, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [mockStoreConfig],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
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
            const state = storeConfigurationToState(initialState, {
                type: 'UPDATE_STORE_CONFIGURATION',
                storeConfigurations: [mockStoreConfig],
                selfServiceChatChannels: {
                    'Test Store': [{ value: { id: 1 } } as any],
                },
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
            const state = storeConfigurationToState(initialState, {
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
