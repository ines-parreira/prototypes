import {renderHook} from '@testing-library/react-hooks/dom'

import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'

import {account} from 'fixtures/account'
import {user} from 'fixtures/users'
import {useGetStoresConfigurationForAccount} from 'models/aiAgent/queries'
import {AiAgentScope} from 'models/aiAgent/types'
import {IntegrationType} from 'models/integration/constants'
import {
    useAiAgentTypeForAccount,
    getAiAgentTypeFromScopes,
} from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import {getIntegration} from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import {RootState} from 'state/types'
import {assumeMock, mockStore} from 'utils/testing'

jest.mock('models/aiAgent/queries')
const useGetStoresConfigurationForAccountMock = assumeMock(
    useGetStoresConfigurationForAccount
)

describe('useAiAgentType', () => {
    describe('getAiAgentTypeFromScopes', () => {
        it('should return undefined when empty scope list', () => {
            expect(getAiAgentTypeFromScopes([])).toBeUndefined()
        })

        it('should return undefined when no scope', () => {
            expect(getAiAgentTypeFromScopes()).toBeUndefined()
        })

        it('should return sales when scope is sales', () => {
            expect(getAiAgentTypeFromScopes([AiAgentScope.Sales])).toEqual(
                'sales'
            )
        })

        it('should return support when scope is support', () => {
            expect(getAiAgentTypeFromScopes([AiAgentScope.Support])).toEqual(
                'support'
            )
        })

        it('should return mixed when scope is sales and support', () => {
            expect(
                getAiAgentTypeFromScopes([
                    AiAgentScope.Sales,
                    AiAgentScope.Support,
                ])
            ).toEqual('mixed')
        })
    })

    describe('useAiAgentTypeForAccount', () => {
        const defaultState = {
            currentUser: fromJS(user),
            currentAccount: fromJS(account),
            integrations: fromJS({
                integrations: [
                    getIntegration(1, IntegrationType.Shopify),
                    getIntegration(2, IntegrationType.Magento2),
                ],
            }),
        } as RootState

        const renderUseAiAgentTypeForAccount = () =>
            renderHook(() => useAiAgentTypeForAccount(), {
                wrapper: ({children}) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            })

        it('should return sales when all stores scope are sales', () => {
            useGetStoresConfigurationForAccountMock.mockReturnValue({
                isLoading: false,
                data: [
                    {
                        status: 200,
                        data: {
                            storeConfiguration: {
                                scopes: [AiAgentScope.Sales],
                            },
                        },
                    },
                    {
                        status: 200,
                        data: {
                            storeConfiguration: {
                                scopes: [AiAgentScope.Sales],
                            },
                        },
                    },
                ],
            } as any)

            const {result} = renderUseAiAgentTypeForAccount()
            expect(result.current).toEqual({
                isLoading: false,
                aiAgentType: 'sales',
            })
        })

        it('should return support when all stores scope are support', () => {
            useGetStoresConfigurationForAccountMock.mockReturnValue({
                isLoading: false,
                data: [
                    {
                        status: 200,
                        data: {
                            storeConfiguration: {
                                scopes: [AiAgentScope.Support],
                            },
                        },
                    },
                    {
                        status: 200,
                        data: {
                            storeConfiguration: {
                                scopes: [AiAgentScope.Support],
                            },
                        },
                    },
                ],
            } as any)

            const {result} = renderUseAiAgentTypeForAccount()

            expect(result.current).toEqual({
                isLoading: false,
                aiAgentType: 'support',
            })
        })

        it('should return support when some stores scope are support and some are sales', () => {
            useGetStoresConfigurationForAccountMock.mockReturnValue({
                isLoading: false,
                data: [
                    {
                        status: 200,
                        data: {
                            storeConfiguration: {
                                scopes: [
                                    AiAgentScope.Support,
                                    AiAgentScope.Sales,
                                ],
                            },
                        },
                    },
                ],
            } as any)

            const {result} = renderUseAiAgentTypeForAccount()
            expect(result.current).toEqual({
                isLoading: false,
                aiAgentType: 'mixed',
            })
        })

        it('should return support when some stores scope are support and sales', () => {
            useGetStoresConfigurationForAccountMock.mockReturnValue({
                isLoading: false,
                data: [
                    {
                        status: 200,
                        data: {
                            storeConfiguration: {
                                scopes: [AiAgentScope.Support],
                            },
                        },
                    },
                    {
                        status: 200,
                        data: {
                            storeConfiguration: {
                                scopes: [
                                    AiAgentScope.Support,
                                    AiAgentScope.Sales,
                                ],
                            },
                        },
                    },
                ],
            } as any)

            const {result} = renderUseAiAgentTypeForAccount()
            expect(result.current).toEqual({
                isLoading: false,
                aiAgentType: 'mixed',
            })
        })
    })
})
