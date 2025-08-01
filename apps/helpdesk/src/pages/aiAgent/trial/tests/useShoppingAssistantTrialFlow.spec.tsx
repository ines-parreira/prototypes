import * as React from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import { useModalManager, useModalManagerApi } from 'hooks/useModalManager'
import { storeActivationFixture } from 'pages/aiAgent/Activation/hooks/storeActivation.fixture'

import { useShoppingAssistantTrialFlow } from '../hooks/useShoppingAssistantTrialFlow'
import { useStartShoppingAssistantTrial } from '../hooks/useStartShoppingAssistantTrial'

// Mock the useStartShoppingAssistantTrial hook
jest.mock('../hooks/useStartShoppingAssistantTrial')
jest.mock('hooks/useModalManager')

const mockUseStartShoppingAssistantTrial = assumeMock(
    useStartShoppingAssistantTrial,
)
const mockUseModalManager = assumeMock(useModalManager)

describe('useShoppingAssistantTrialFlow', () => {
    const mockAccountDomain = 'test-domain'
    const mockStoreActivations = {
        store1: storeActivationFixture({ storeName: 'Test Store 1' }),
        store2: storeActivationFixture({ storeName: 'Test Store 2' }),
    }
    const mockOnUpgradeModalClose = jest.fn()
    const mockOnSuccessModalOpen = jest.fn()

    let queryClient: QueryClient
    let mockMutateAsync: jest.Mock
    let wrapper: React.FC<{ children: React.ReactNode }>
    let mockModalManager: useModalManagerApi

    beforeEach(() => {
        jest.clearAllMocks()

        // Mock modal manager
        mockModalManager = {
            isOpen: jest.fn().mockReturnValue(false),
            openModal: jest.fn(),
            closeModal: jest.fn(),
            getParams: jest.fn().mockReturnValue(null),
            on: jest.fn(),
        }
        mockUseModalManager.mockReturnValue(mockModalManager)

        // Create a new QueryClient for each test
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
        const history = createMemoryHistory({ initialEntries: ['/'] })

        // Create wrapper with QueryClientProvider
        wrapper = ({ children }: { children: React.ReactNode }) => (
            <Router history={history}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Router>
        )

        // Mock the mutation
        mockMutateAsync = jest.fn()
        mockUseStartShoppingAssistantTrial.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isLoading: false,
            mutate: jest.fn(),
            reset: jest.fn(),
            isIdle: true,
            isPaused: false,
            isSuccess: false,
            isError: false,
            data: undefined,
            error: null,
            failureCount: 0,
            failureReason: null,
            status: 'idle',
            variables: undefined,
            context: undefined,
        })
    })

    afterEach(() => {
        queryClient.clear()
    })

    describe('initial state', () => {
        it('should have correct initial state', () => {
            const { result } = renderHook(
                () =>
                    useShoppingAssistantTrialFlow({
                        accountDomain: mockAccountDomain,
                        storeActivations: mockStoreActivations,
                    }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(false)
            expect(result.current.isTrialModalOpen).toBe(false)
            expect(result.current.isSuccessModalOpen).toBe(false)
        })
    })

    describe('modal state management', () => {
        it('should open upgrade modal when openUpgradeModal is called', () => {
            const { result } = renderHook(
                () =>
                    useShoppingAssistantTrialFlow({
                        accountDomain: mockAccountDomain,
                        storeActivations: mockStoreActivations,
                    }),
                { wrapper },
            )

            act(() => {
                result.current.openTrialUpgradeModal()
            })

            expect(mockModalManager.openModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialUpgradeModal',
            )
        })

        it('should close upgrade modal and call callback when closeUpgradeModal is called', () => {
            const { result } = renderHook(
                () =>
                    useShoppingAssistantTrialFlow({
                        accountDomain: mockAccountDomain,
                        storeActivations: mockStoreActivations,
                        onUpgradeModalClose: mockOnUpgradeModalClose,
                    }),
                { wrapper },
            )

            // First open the modal
            act(() => {
                result.current.openTrialUpgradeModal()
            })

            // Then close it
            act(() => {
                result.current.closeTrialUpgradeModal()
            })

            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialUpgradeModal',
            )
            expect(mockOnUpgradeModalClose).toHaveBeenCalledTimes(1)
        })

        it('should close success modal when closeSuccessModal is called', () => {
            // Set up mock to return true for success modal initially
            mockModalManager.isOpen = jest.fn().mockReturnValue(true)

            const { result } = renderHook(
                () =>
                    useShoppingAssistantTrialFlow({
                        accountDomain: mockAccountDomain,
                        storeActivations: mockStoreActivations,
                    }),
                { wrapper },
            )

            // Verify success modal is open
            expect(result.current.isSuccessModalOpen).toBe(true)

            // Close the success modal
            act(() => {
                result.current.closeSuccessModal()
            })

            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantSuccessModal',
            )
        })
    })

    describe('startTrial functionality', () => {
        it('should call mutateAsync with correct parameters', () => {
            const { result } = renderHook(
                () =>
                    useShoppingAssistantTrialFlow({
                        accountDomain: mockAccountDomain,
                        storeActivations: mockStoreActivations,
                    }),
                { wrapper },
            )

            act(() => {
                result.current.startTrial()
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                {
                    accountDomain: mockAccountDomain,
                    storeActivations: mockStoreActivations,
                },
                expect.any(Object),
            )
        })

        it('should handle successful trial start', async () => {
            const { result } = renderHook(
                () =>
                    useShoppingAssistantTrialFlow({
                        accountDomain: mockAccountDomain,
                        storeActivations: mockStoreActivations,
                        onUpgradeModalClose: mockOnUpgradeModalClose,
                        onSuccessModalOpen: mockOnSuccessModalOpen,
                    }),
                { wrapper },
            )

            // Open upgrade modal first
            act(() => {
                result.current.openTrialUpgradeModal()
            })

            expect(mockModalManager.openModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialUpgradeModal',
            )

            // Start trial
            act(() => {
                result.current.startTrial()
            })

            // Simulate successful mutation
            const onSuccessCallback = mockMutateAsync.mock.calls[0][1].onSuccess
            await act(async () => {
                await onSuccessCallback()
            })

            // Check modal manager calls
            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialUpgradeModal',
            )
            expect(mockModalManager.openModal).toHaveBeenCalledWith(
                'ShoppingAssistantSuccessModal',
            )

            // Check callbacks were called
            expect(mockOnUpgradeModalClose).toHaveBeenCalledTimes(1)
            expect(mockOnSuccessModalOpen).toHaveBeenCalledTimes(1)
        })

        it('should reflect loading state from mutation', () => {
            mockUseStartShoppingAssistantTrial.mockReturnValue({
                mutateAsync: mockMutateAsync,
                isLoading: true,
                mutate: jest.fn(),
                reset: jest.fn(),
                isIdle: false,
                isPaused: false,
                isSuccess: false,
                isError: false,
                data: undefined,
                error: null,
                failureCount: 0,
                failureReason: null,
                status: 'loading',
                variables: undefined,
                context: undefined,
            })

            const { result } = renderHook(
                () =>
                    useShoppingAssistantTrialFlow({
                        accountDomain: mockAccountDomain,
                        storeActivations: mockStoreActivations,
                    }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)
        })
    })

    describe('callback functions', () => {
        it('should not throw when callbacks are not provided', () => {
            const { result } = renderHook(
                () =>
                    useShoppingAssistantTrialFlow({
                        accountDomain: mockAccountDomain,
                        storeActivations: mockStoreActivations,
                    }),
                { wrapper },
            )

            // Should not throw
            expect(() => {
                act(() => {
                    result.current.closeTrialUpgradeModal()
                })
            }).not.toThrow()

            // Start trial and trigger success
            act(() => {
                result.current.startTrial()
            })

            const onSuccessCallback = mockMutateAsync.mock.calls[0][1].onSuccess

            // Should not throw
            expect(() => {
                act(() => {
                    onSuccessCallback()
                })
            }).not.toThrow()
        })

        it('should handle multiple calls to callbacks gracefully', () => {
            const { result } = renderHook(
                () =>
                    useShoppingAssistantTrialFlow({
                        accountDomain: mockAccountDomain,
                        storeActivations: mockStoreActivations,
                        onUpgradeModalClose: mockOnUpgradeModalClose,
                    }),
                { wrapper },
            )

            // Call closeUpgradeModal multiple times
            act(() => {
                result.current.closeTrialUpgradeModal()
                result.current.closeTrialUpgradeModal()
                result.current.closeTrialUpgradeModal()
            })

            // Callback should be called once per closeUpgradeModal call
            expect(mockOnUpgradeModalClose).toHaveBeenCalledTimes(3)
        })
    })

    describe('integration', () => {
        it('should handle complete flow from opening modal to successful trial', async () => {
            const { result } = renderHook(
                () =>
                    useShoppingAssistantTrialFlow({
                        accountDomain: mockAccountDomain,
                        storeActivations: mockStoreActivations,
                        onUpgradeModalClose: mockOnUpgradeModalClose,
                        onSuccessModalOpen: mockOnSuccessModalOpen,
                    }),
                { wrapper },
            )

            // 1. Open upgrade modal
            act(() => {
                result.current.openTrialUpgradeModal()
            })
            expect(mockModalManager.openModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialUpgradeModal',
            )

            // 2. Start trial
            act(() => {
                result.current.startTrial()
            })

            // 3. Simulate successful mutation
            const onSuccessCallback = mockMutateAsync.mock.calls[0][1].onSuccess
            await act(async () => {
                await onSuccessCallback()
            })

            // 4. Verify final state
            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialUpgradeModal',
            )
            expect(mockModalManager.openModal).toHaveBeenCalledWith(
                'ShoppingAssistantSuccessModal',
            )
            expect(mockOnUpgradeModalClose).toHaveBeenCalledTimes(1)
            expect(mockOnSuccessModalOpen).toHaveBeenCalledTimes(1)

            // 5. Close success modal
            act(() => {
                result.current.closeSuccessModal()
            })
            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantSuccessModal',
            )
        })
    })
})
