import { reportError } from '@repo/logging'
import { renderHook, waitFor } from '@testing-library/react'
import { isAxiosError } from 'axios'

import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { usePlaygroundResources } from '../usePlaygroundResources'

jest.mock('hooks/useAppDispatch')
jest.mock('axios')
jest.mock('state/notifications/actions')
jest.mock('@repo/logging')
jest.mock('../../../hooks/useGetOrCreateSnippetHelpCenter')

// Mock the queries module before importing
jest.mock('models/aiAgent/queries', () => ({
    useGetStoreConfigurationPure: jest.fn(),
    useGetAccountConfiguration: jest.fn(),
}))

const mockUseAppDispatch = require('hooks/useAppDispatch').default as jest.Mock
const mockUseGetStoreConfigurationPure = require('models/aiAgent/queries')
    .useGetStoreConfigurationPure as jest.Mock
const mockUseGetAccountConfiguration = require('models/aiAgent/queries')
    .useGetAccountConfiguration as jest.Mock
const mockUseGetOrCreateSnippetHelpCenter =
    require('../../../hooks/useGetOrCreateSnippetHelpCenter')
        .useGetOrCreateSnippetHelpCenter as jest.Mock
const mockIsAxiosError = isAxiosError as jest.MockedFunction<
    typeof isAxiosError
>
const mockNotify = notify as jest.MockedFunction<typeof notify>
const mockReportError = reportError as jest.MockedFunction<typeof reportError>

describe('usePlaygroundResources', () => {
    const mockDispatch = jest.fn()

    const mockStoreConfiguration = {
        helpCenterId: 123,
        snippetHelpCenterId: 456,
        storeName: 'test-shop',
        shopType: 'shopify',
        monitoredChatIntegrations: [789],
    }

    const mockAccountConfiguration = {
        accountId: 1,
        gorgiasDomain: 'test-domain.gorgias.com',
        httpIntegration: { id: 999 },
    }

    const mockSnippetHelpCenter = {
        id: 456,
        name: 'Snippet Help Center',
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockIsAxiosError.mockReturnValue(false)
    })

    describe('successful data loading', () => {
        it('should return all data when all queries succeed', () => {
            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: { data: { storeConfiguration: mockStoreConfiguration } },
                isLoading: false,
                error: undefined,
            })

            mockUseGetAccountConfiguration.mockReturnValue({
                data: {
                    data: { accountConfiguration: mockAccountConfiguration },
                },
                isLoading: false,
                error: undefined,
            })

            mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
                helpCenter: mockSnippetHelpCenter,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundResources({
                    shopName: 'test-shop',
                    accountDomain: 'test-domain.gorgias.com',
                }),
            )

            expect(result.current.storeConfiguration).toEqual(
                mockStoreConfiguration,
            )
            expect(result.current.accountConfiguration).toEqual(
                mockAccountConfiguration,
            )
            expect(result.current.snippetHelpCenterId).toBe(456)
            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBeUndefined()
        })

        it('should combine loading states correctly', () => {
            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: undefined,
                isLoading: true,
                error: undefined,
            })

            mockUseGetAccountConfiguration.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundResources({
                    shopName: 'test-shop',
                    accountDomain: 'test-domain.gorgias.com',
                }),
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('should return true for isLoading when any query is loading', () => {
            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetAccountConfiguration.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
                helpCenter: undefined,
                isLoading: true,
            })

            const { result } = renderHook(() =>
                usePlaygroundResources({
                    shopName: 'test-shop',
                    accountDomain: 'test-domain.gorgias.com',
                }),
            )

            expect(result.current.isLoading).toBe(true)
        })
    })

    describe('error handling', () => {
        it('should set storeConfigurationNotInitialized to true on 404 error', async () => {
            const mockError = {
                response: { status: 404 },
            }

            mockIsAxiosError.mockReturnValue(true)

            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: mockError,
            })

            mockUseGetAccountConfiguration.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundResources({
                    shopName: 'test-shop',
                    accountDomain: 'test-domain.gorgias.com',
                }),
            )

            await waitFor(() => {
                expect(result.current.storeConfigurationNotInitialized).toBe(
                    true,
                )
            })

            expect(mockDispatch).not.toHaveBeenCalled()
            expect(mockReportError).not.toHaveBeenCalled()
        })

        it('should dispatch notification and report error on non-404 error', async () => {
            const mockError = new Error('Network error')

            mockIsAxiosError.mockReturnValue(false)

            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: mockError,
            })

            mockUseGetAccountConfiguration.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundResources({
                    shopName: 'test-shop',
                    accountDomain: 'test-domain.gorgias.com',
                }),
            )

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled()
            })

            expect(mockNotify).toHaveBeenCalledWith({
                message:
                    'There was an error initializing the AI Agent Test mode',
                status: NotificationStatus.Error,
            })

            expect(mockReportError).toHaveBeenCalledWith(mockError, {
                tags: { team: 'automate-ai-agent' },
                extra: {
                    context:
                        'Error fetching store configuration for AI Agent Playground',
                },
            })

            expect(result.current.storeConfigurationNotInitialized).toBe(false)
        })

        it('should handle axios error with non-404 status', async () => {
            const mockError = {
                response: { status: 500 },
            }

            mockIsAxiosError.mockReturnValue(true)

            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: mockError,
            })

            mockUseGetAccountConfiguration.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            renderHook(() =>
                usePlaygroundResources({
                    shopName: 'test-shop',
                    accountDomain: 'test-domain.gorgias.com',
                }),
            )

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled()
            })

            expect(mockNotify).toHaveBeenCalledWith({
                message:
                    'There was an error initializing the AI Agent Test mode',
                status: NotificationStatus.Error,
            })
        })

        it('should expose store fetch error', () => {
            const mockError = new Error('Store fetch error')

            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: mockError,
            })

            mockUseGetAccountConfiguration.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundResources({
                    shopName: 'test-shop',
                    accountDomain: 'test-domain.gorgias.com',
                }),
            )

            expect(result.current.error).toBe(mockError)
        })

        it('should expose account fetch error', () => {
            const mockError = new Error('Account fetch error')

            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetAccountConfiguration.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: mockError,
            })

            mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundResources({
                    shopName: 'test-shop',
                    accountDomain: 'test-domain.gorgias.com',
                }),
            )

            expect(result.current.error).toBe(mockError)
        })
    })

    describe('query configuration', () => {
        it('should call useGetStoreConfigurationPure with correct params', () => {
            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetAccountConfiguration.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            renderHook(() =>
                usePlaygroundResources({
                    shopName: 'my-shop',
                    accountDomain: 'my-domain.gorgias.com',
                }),
            )

            expect(mockUseGetStoreConfigurationPure).toHaveBeenCalledWith(
                {
                    accountDomain: 'my-domain.gorgias.com',
                    storeName: 'my-shop',
                },
                { retry: 1, refetchOnWindowFocus: false },
            )
        })

        it('should call useGetAccountConfiguration with correct params', () => {
            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetAccountConfiguration.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            renderHook(() =>
                usePlaygroundResources({
                    shopName: 'my-shop',
                    accountDomain: 'my-domain.gorgias.com',
                }),
            )

            expect(mockUseGetAccountConfiguration).toHaveBeenCalledWith(
                'my-domain.gorgias.com',
                { retry: 1, refetchOnWindowFocus: false },
            )
        })

        it('should call useGetOrCreateSnippetHelpCenter with correct params', () => {
            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetAccountConfiguration.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            renderHook(() =>
                usePlaygroundResources({
                    shopName: 'my-shop',
                    accountDomain: 'my-domain.gorgias.com',
                }),
            )

            expect(mockUseGetOrCreateSnippetHelpCenter).toHaveBeenCalledWith({
                accountDomain: 'my-domain.gorgias.com',
                shopName: 'my-shop',
            })
        })
    })

    describe('data extraction', () => {
        it('should extract storeConfiguration from nested data structure', () => {
            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: { data: { storeConfiguration: mockStoreConfiguration } },
                isLoading: false,
                error: undefined,
            })

            mockUseGetAccountConfiguration.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundResources({
                    shopName: 'test-shop',
                    accountDomain: 'test-domain.gorgias.com',
                }),
            )

            expect(result.current.storeConfiguration).toEqual(
                mockStoreConfiguration,
            )
        })

        it('should extract accountConfiguration from nested data structure', () => {
            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetAccountConfiguration.mockReturnValue({
                data: {
                    data: { accountConfiguration: mockAccountConfiguration },
                },
                isLoading: false,
                error: undefined,
            })

            mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundResources({
                    shopName: 'test-shop',
                    accountDomain: 'test-domain.gorgias.com',
                }),
            )

            expect(result.current.accountConfiguration).toEqual(
                mockAccountConfiguration,
            )
        })

        it('should extract snippetHelpCenterId from help center', () => {
            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetAccountConfiguration.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
                helpCenter: { id: 789, name: 'Test HC' },
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundResources({
                    shopName: 'test-shop',
                    accountDomain: 'test-domain.gorgias.com',
                }),
            )

            expect(result.current.snippetHelpCenterId).toBe(789)
        })

        it('should return undefined for missing data', () => {
            mockUseGetStoreConfigurationPure.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetAccountConfiguration.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: undefined,
            })

            mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
                helpCenter: undefined,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                usePlaygroundResources({
                    shopName: 'test-shop',
                    accountDomain: 'test-domain.gorgias.com',
                }),
            )

            expect(result.current.storeConfiguration).toBeUndefined()
            expect(result.current.accountConfiguration).toBeUndefined()
            expect(result.current.snippetHelpCenterId).toBeUndefined()
        })
    })
})
