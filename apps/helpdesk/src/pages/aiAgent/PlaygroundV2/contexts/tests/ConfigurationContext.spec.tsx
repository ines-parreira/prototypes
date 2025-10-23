import { renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'

import {
    ConfigurationProvider,
    useConfigurationContext,
} from '../ConfigurationContext'

jest.mock('../../hooks/useAiAgentHttpIntegration', () => ({
    useAiAgentHttpIntegration: jest.fn(() => ({
        httpIntegrationId: 789,
        baseUrl: 'https://test-base-url.com',
    })),
}))

jest.mock('../../hooks/useShopNameResolution', () => ({
    useShopNameResolution: jest.fn((shopName?: string) => ({
        resolvedShopName: shopName || 'test-shop',
    })),
}))

jest.mock('../../hooks/usePlaygroundResources', () => ({
    usePlaygroundResources: jest.fn(() => ({
        storeConfiguration: getStoreConfigurationFixture({
            storeName: 'test-store',
            monitoredChatIntegrations: [456],
        }),
        accountConfiguration: {
            httpIntegration: { id: 999 },
            gorgiasDomain: 'test-domain.gorgias.com',
            accountId: 123,
        },
        snippetHelpCenterId: 456,
        isLoading: false,
    })),
}))

describe('ConfigurationContext', () => {
    const mockStore = configureMockStore([thunk])({
        currentAccount: fromJS({
            domain: 'test-domain.gorgias.com',
        }),
    })

    describe('useConfigurationContext', () => {
        it('should throw error when used outside provider', () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {})

            expect(() => {
                renderHook(() => useConfigurationContext())
            }).toThrow(
                'usePlaygroundConfigurationContext must be used within PlaygroundConfigurationProvider',
            )

            consoleErrorSpy.mockRestore()
        })

        it('should return context value when used inside provider', () => {
            const { result } = renderHook(() => useConfigurationContext(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>
                        <ConfigurationProvider>
                            {children}
                        </ConfigurationProvider>
                    </Provider>
                ),
            })

            expect(result.current).toBeDefined()
            expect(result.current.storeConfiguration).toBeDefined()
            expect(result.current.accountConfiguration).toBeDefined()
            expect(result.current.snippetHelpCenterId).toBe(456)
            expect(result.current.httpIntegrationId).toBe(789)
            expect(result.current.baseUrl).toBe('https://test-base-url.com')
            expect(result.current.gorgiasDomain).toBe('test-domain.gorgias.com')
            expect(result.current.accountId).toBe(123)
            expect(result.current.chatIntegrationId).toBe(456)
            expect(result.current.shopName).toBe('test-store')
        })

        it('should include store configuration', () => {
            const { result } = renderHook(() => useConfigurationContext(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>
                        <ConfigurationProvider>
                            {children}
                        </ConfigurationProvider>
                    </Provider>
                ),
            })

            expect(result.current.storeConfiguration).toBeDefined()
            expect(result.current.storeConfiguration?.storeName).toBe(
                'test-store',
            )
        })

        it('should include account configuration', () => {
            const { result } = renderHook(() => useConfigurationContext(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>
                        <ConfigurationProvider>
                            {children}
                        </ConfigurationProvider>
                    </Provider>
                ),
            })

            expect(result.current.accountConfiguration).toBeDefined()
            expect(result.current.accountConfiguration?.accountId).toBe(123)
            expect(result.current.accountConfiguration?.gorgiasDomain).toBe(
                'test-domain.gorgias.com',
            )
            expect(
                result.current.accountConfiguration?.httpIntegration?.id,
            ).toBe(999)
        })

        it('should include help center IDs', () => {
            const { result } = renderHook(() => useConfigurationContext(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>
                        <ConfigurationProvider>
                            {children}
                        </ConfigurationProvider>
                    </Provider>
                ),
            })

            expect(result.current.snippetHelpCenterId).toBe(456)
        })

        it('should include integration IDs', () => {
            const { result } = renderHook(() => useConfigurationContext(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>
                        <ConfigurationProvider>
                            {children}
                        </ConfigurationProvider>
                    </Provider>
                ),
            })

            expect(result.current.httpIntegrationId).toBe(789)
            expect(result.current.chatIntegrationId).toBe(456)
        })
    })

    describe('ConfigurationProvider', () => {
        it('should use shopName from props', () => {
            const useShopNameResolution =
                require('../../hooks/useShopNameResolution')
                    .useShopNameResolution as jest.Mock

            renderHook(() => useConfigurationContext(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>
                        <ConfigurationProvider shopName="custom-shop">
                            {children}
                        </ConfigurationProvider>
                    </Provider>
                ),
            })

            expect(useShopNameResolution).toHaveBeenCalledWith('custom-shop')
        })

        it('should pass account domain to usePlaygroundResources', () => {
            const usePlaygroundResources =
                require('../../hooks/usePlaygroundResources')
                    .usePlaygroundResources as jest.Mock

            renderHook(() => useConfigurationContext(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>
                        <ConfigurationProvider>
                            {children}
                        </ConfigurationProvider>
                    </Provider>
                ),
            })

            expect(usePlaygroundResources).toHaveBeenCalledWith({
                shopName: 'test-shop',
                accountDomain: 'test-domain.gorgias.com',
            })
        })

        it('should prefer httpIntegrationId from hook over accountConfiguration', () => {
            const { result } = renderHook(() => useConfigurationContext(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>
                        <ConfigurationProvider>
                            {children}
                        </ConfigurationProvider>
                    </Provider>
                ),
            })

            expect(result.current.httpIntegrationId).toBe(789)
        })

        it('should fallback to accountConfiguration httpIntegration when hook returns null', () => {
            const useAiAgentHttpIntegration =
                require('../../hooks/useAiAgentHttpIntegration')
                    .useAiAgentHttpIntegration as jest.Mock

            useAiAgentHttpIntegration.mockReturnValueOnce({
                httpIntegrationId: null,
                baseUrl: 'https://test-base-url.com',
            })

            const { result } = renderHook(() => useConfigurationContext(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>
                        <ConfigurationProvider>
                            {children}
                        </ConfigurationProvider>
                    </Provider>
                ),
            })

            expect(result.current.httpIntegrationId).toBe(999)
        })

        it('should use first chat integration from monitoredChatIntegrations', () => {
            const { result } = renderHook(() => useConfigurationContext(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>
                        <ConfigurationProvider>
                            {children}
                        </ConfigurationProvider>
                    </Provider>
                ),
            })

            expect(result.current.chatIntegrationId).toBe(456)
        })

        it('should prefer storeName from storeConfiguration over resolved shop name', () => {
            const { result } = renderHook(() => useConfigurationContext(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>
                        <ConfigurationProvider>
                            {children}
                        </ConfigurationProvider>
                    </Provider>
                ),
            })

            expect(result.current.shopName).toBe('test-store')
        })

        it('should fallback to resolved shop name when storeConfiguration is null', () => {
            const usePlaygroundResources =
                require('../../hooks/usePlaygroundResources')
                    .usePlaygroundResources as jest.Mock

            usePlaygroundResources.mockReturnValueOnce({
                storeConfiguration: null,
                accountConfiguration: null,
                snippetHelpCenterId: undefined,
                isLoading: false,
            })

            const { result } = renderHook(() => useConfigurationContext(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>
                        <ConfigurationProvider>
                            {children}
                        </ConfigurationProvider>
                    </Provider>
                ),
            })

            expect(result.current.shopName).toBe('test-shop')
        })

        it('should handle empty values gracefully', () => {
            const usePlaygroundResources =
                require('../../hooks/usePlaygroundResources')
                    .usePlaygroundResources as jest.Mock
            const useAiAgentHttpIntegration =
                require('../../hooks/useAiAgentHttpIntegration')
                    .useAiAgentHttpIntegration as jest.Mock

            usePlaygroundResources.mockReturnValueOnce({
                storeConfiguration: null,
                accountConfiguration: null,
                snippetHelpCenterId: undefined,
                isLoading: false,
            })

            useAiAgentHttpIntegration.mockReturnValueOnce({
                httpIntegrationId: null,
                baseUrl: '',
            })

            const { result } = renderHook(() => useConfigurationContext(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>
                        <ConfigurationProvider>
                            {children}
                        </ConfigurationProvider>
                    </Provider>
                ),
            })

            expect(result.current.storeConfiguration).toBeNull()
            expect(result.current.accountConfiguration).toBeNull()
            expect(result.current.snippetHelpCenterId).toBeUndefined()
            expect(result.current.httpIntegrationId).toBe(0)
            expect(result.current.baseUrl).toBe('')
            expect(result.current.gorgiasDomain).toBe('')
            expect(result.current.accountId).toBe(0)
            expect(result.current.chatIntegrationId).toBeUndefined()
        })
    })
})
