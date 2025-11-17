import { assumeMock, renderHook, userEvent } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import { useLocation } from 'react-router-dom'
import createMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { toImmutable } from 'common/utils'
import type { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import {
    useTrialEligibility,
    useTrialEligibilityForManualActivationFromFeatureFlag,
} from 'pages/aiAgent/hooks/useTrialEligibility'
import {
    CtaButton,
    useGmvInfluencedCtaButton,
} from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluencedCtaButton'
import { getStoresEligibleForTrial } from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'

const mockStore = createMockStore([thunk])
const queryClient = new QueryClient({})

jest.mock('react-router-dom', () => ({ useLocation: jest.fn() }))
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations.ts')
const useStoreActivationsMock = assumeMock(useStoreActivations)
useStoreActivationsMock.mockReturnValue({
    storeActivations: {
        store1: {
            configuration: {
                storeName: 'store1',
            },
        },
    },
} as any)

jest.mock('pages/aiAgent/utils/aiSalesAgentTrialUtils')

const getStoresEligibleForTrialMock = assumeMock(getStoresEligibleForTrial)

jest.mock('pages/aiAgent/hooks/useTrialEligibility')
const useTrialEligibilityMock = assumeMock(useTrialEligibility)
const useTrialEligibilityForManualActivationFromFeatureFlagMock = assumeMock(
    useTrialEligibilityForManualActivationFromFeatureFlag,
)
jest.mock(
    'react-router-dom',
    () =>
        ({
            useHistory: () => ({
                push: jest.fn(),
            }),
            useLocation: jest.fn(),
        }) as Record<string, unknown>,
)

describe('CtaButton', () => {
    it('is on new plan', async () => {
        const props = {
            isOnNewPlan: true,
            canStartTrial: false,
            showActivationModal: jest.fn(),
            showEarlyAccessModal: jest.fn(),
            startTrial: jest.fn(),
        }
        const { getByRole } = render(<CtaButton {...props} />)

        await waitFor(() => {
            expect(getByRole('button', { name: 'Activate' })).toBeDefined()
        })
    })

    it('can start trial', async () => {
        const props = {
            isOnNewPlan: false,
            canStartTrial: true,
            showActivationModal: jest.fn(),
            showEarlyAccessModal: jest.fn(),
            startTrial: jest.fn(),
        }
        const { getByRole } = render(<CtaButton {...props} />)
        await waitFor(() => {
            expect(
                getByRole('button', { name: 'Try Shopping Assistant' }),
            ).toBeDefined()
        })
    })

    it('show early access modal', async () => {
        const props = {
            isOnNewPlan: false,
            canStartTrial: false,
            showActivationModal: jest.fn(),
            showEarlyAccessModal: jest.fn(),
            startTrial: jest.fn(),
        }
        const { getByRole } = render(<CtaButton {...props} />)
        await waitFor(() => {
            expect(getByRole('button', { name: 'Upgrade' })).toBeDefined()
        })
    })
})

describe('useGmvInfluencedCtaButton', () => {
    beforeEach(() => {
        ;(
            useLocation as jest.MockedFunction<typeof useLocation>
        ).mockReturnValue({
            pathname: '',
            search: '?foo=1&bar=baz',
            state: '',
            hash: '',
        })
        useTrialEligibilityMock.mockReturnValue({
            canStartTrial: true,
            isLoading: false,
        })
        useTrialEligibilityForManualActivationFromFeatureFlagMock.mockReturnValue(
            {
                canStartTrial: false,
            },
        )
    })
    // Example 1: Using Provider wrapper with mockStore
    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <Provider
                store={mockStore({
                    billing: toImmutable({
                        products: [],
                    }),
                })}
            >
                {children}
            </Provider>
        </QueryClientProvider>
    )
    it('should render nothing when gmvInfluencedLoading = true', () => {
        const props = {
            aiAgentType: 'support' as const,
            gmvInfluenced: undefined,
            gmvInfluencedLoading: true,
            isOnNewPlan: false,
            showEarlyAccessModal: jest.fn(),
            showActivationModal: jest.fn(),
        }
        renderHook(() => useGmvInfluencedCtaButton(props), {
            wrapper,
        })
        const button = screen.queryByRole('button', { name: 'Upgrade' })
        expect(button).not.toBeInTheDocument()
    })

    it('should render nothing when gmvInfluenced !== 0', () => {
        const props = {
            aiAgentType: 'support' as const,
            gmvInfluenced: 100,
            gmvInfluencedLoading: false,
            isOnNewPlan: false,
            showEarlyAccessModal: jest.fn(),
            showActivationModal: jest.fn(),
        }
        renderHook(() => useGmvInfluencedCtaButton(props), {
            wrapper,
        })
        const button = screen.queryByRole('button', { name: 'Upgrade' })
        expect(button).not.toBeInTheDocument()
    })

    it.each(['mixed' as const, 'sales' as const])(
        'should render nothing when %s',
        (aiAgentType) => {
            const props = {
                aiAgentType,
                gmvInfluenced: 0,
                gmvInfluencedLoading: false,
                isOnNewPlan: false,
                showEarlyAccessModal: jest.fn(),
                showActivationModal: jest.fn(),
            }
            renderHook(() => useGmvInfluencedCtaButton(props), {
                wrapper,
            })
            const button = screen.queryByRole('button', { name: 'Upgrade' })
            expect(button).not.toBeInTheDocument()
        },
    )

    it('should render the Upgrade button when aiAgentType is support + not on new plan + gmvInfluenced = 0', () => {
        const props = {
            aiAgentType: 'support' as const,
            gmvInfluenced: 0,
            gmvInfluencedLoading: false,
            isOnNewPlan: false,
            showEarlyAccessModal: jest.fn(),
            showActivationModal: jest.fn(),
        }
        const { result } = renderHook(() => useGmvInfluencedCtaButton(props), {
            wrapper,
        })

        const { findByText } = render(<>{result.current}</>)
        expect(findByText('Upgrade')).toBeDefined()
    })

    it('should render the Activate button when aiAgentType is support + not on new plan + gmvInfluenced = 0', () => {
        const props = {
            aiAgentType: 'support' as const,
            gmvInfluenced: 0,
            gmvInfluencedLoading: false,
            isOnNewPlan: true,
            showEarlyAccessModal: jest.fn(),
            showActivationModal: jest.fn(),
        }
        const { result } = renderHook(() => useGmvInfluencedCtaButton(props), {
            wrapper,
        })

        const { findByText } = render(<>{result.current}</>)
        expect(findByText('Activate')).toBeDefined()
    })

    it('should render the Try Shopping Assistant button when aiAgentType is support + on usd-5 plan + canStartTrial = true', async () => {
        const mockStoreActivations = {
            store1: {
                configuration: {
                    storeName: 'store1',
                },
                support: {
                    chat: {
                        isIntegrationMissing: false,
                    },
                },
            },
            store2: {
                configuration: {
                    storeName: 'store2',
                },
                support: {
                    chat: {
                        isIntegrationMissing: true,
                    },
                },
            },
        }
        useStoreActivationsMock.mockReturnValue({
            storeActivations: mockStoreActivations,
        } as any)
        getStoresEligibleForTrialMock.mockReturnValue([
            mockStoreActivations.store2,
        ] as StoreActivation[])
        const props = {
            aiAgentType: 'support' as const,
            gmvInfluenced: 0,
            gmvInfluencedLoading: false,
            isOnNewPlan: false,
            showEarlyAccessModal: jest.fn(),
            showActivationModal: jest.fn(),
        }
        const { result } = renderHook(() => useGmvInfluencedCtaButton(props), {
            wrapper,
        })

        const { findByText } = render(<>{result.current}</>)
        const button = await findByText('Try Shopping Assistant')
        expect(button).toBeDefined()
        act(async () => {
            userEvent.click(button)
        })
    })
})
