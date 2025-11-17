import type { ComponentProps } from 'react'

import { assumeMock, userEvent } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import createMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { toImmutable } from 'common/utils'
import {
    atLeastOneStoreHasActiveTrialOnSpecificStores,
    useCanUseAiSalesAgent,
} from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { AiAgentActivationModal } from 'pages/aiAgent/Activation/components/AiAgentActivationModal/AiAgentActivationModal'
import { storeActivationFixture } from 'pages/aiAgent/Activation/hooks/storeActivation.fixture'
import type { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { getStoreConfigurationFixture } from 'pages/aiAgent/Activation/hooks/tests/fixtures/store-configurations.fixture'
import {
    useTrialEligibility,
    useTrialEligibilityForManualActivationFromFeatureFlag,
} from 'pages/aiAgent/hooks/useTrialEligibility'
import { useStartAiSalesAgentTrialForMultipleStores } from 'pages/aiAgent/Overview/hooks/useStartAiSalesAgentTrialForMultipleStores'
import { getStoresEligibleForTrial } from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

jest.mock(
    'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/LegacyAiAgentActivationStoreCard',
    () => ({
        LegacyAiAgentActivationStoreCard: jest.fn(
            ({
                store,
                onSalesChange,
                onSupportChange,
                onSupportChatChange,
                onSupportEmailChange,
                closeModal,
            }) => (
                <div data-testid="mock-store-card">
                    <button onClick={() => onSalesChange(true)}>
                        Toggle Sales
                    </button>
                    <button onClick={() => onSupportChange(true)}>
                        Toggle Support
                    </button>
                    <button onClick={() => onSupportChatChange(true)}>
                        Toggle Chat
                    </button>
                    <button onClick={() => onSupportEmailChange(true)}>
                        Toggle Email
                    </button>
                    <button onClick={closeModal}>Close Modal</button>
                    <div data-testid="store-name">{store.name}</div>
                </div>
            ),
        ),
    }),
)

jest.mock(
    '../../AiAgentActivationStoreCard/AiAgentActivationStoreCard',
    () => ({
        AiAgentActivationStoreCard: jest.fn(
            ({ store, onChatChange, onEmailChange, closeModal }) => (
                <div data-testid="mock-store-card">
                    <button onClick={() => onChatChange(true)}>
                        Toggle Chat
                    </button>
                    <button onClick={() => onEmailChange(true)}>
                        Toggle Email
                    </button>
                    <button onClick={closeModal}>Close Modal</button>
                    <div data-testid="store-name">{store.name}</div>
                </div>
            ),
        ),
    }),
)

jest.mock(
    'pages/aiAgent/Overview/hooks/useStartAiSalesAgentTrialForMultipleStores',
)

jest.mock(
    'pages/aiAgent/Overview/hooks/useStartAiSalesAgentTrialForMultipleStores',
    () => ({
        useStartAiSalesAgentTrialForMultipleStores: jest.fn(),
    }),
)

const mockUseStartTrialMock =
    useStartAiSalesAgentTrialForMultipleStores as jest.Mock

jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
const useCanUseAiSalesAgentMock = assumeMock(useCanUseAiSalesAgent)
const useAtLeastOneStoreHasActiveTrialOnSpecificStoresMock = assumeMock(
    atLeastOneStoreHasActiveTrialOnSpecificStores,
)
jest.mock('pages/aiAgent/hooks/useTrialEligibility')
const useTrialEligibilityMock = assumeMock(useTrialEligibility)
const useTrialEligibilityForManualActivationFromFeatureFlagMock = assumeMock(
    useTrialEligibilityForManualActivationFromFeatureFlag,
)

jest.mock('pages/aiAgent/utils/aiSalesAgentTrialUtils')
const mockStore = createMockStore([thunk])
const queryClient = mockQueryClient()

const getStoresEligibleForTrialMock = assumeMock(getStoresEligibleForTrial)

describe('AiAgentActivationModal', () => {
    const mockStoreActivations: Record<string, StoreActivation> = {
        store1: storeActivationFixture({
            storeName: 'store1',
            configuration: getStoreConfigurationFixture({
                storeName: 'store1',
                shopType: 'shopify',
            }),
            settings: {
                sales: {
                    isDisabled: false,
                    enabled: false,
                },
                support: {
                    enabled: false,
                    chat: {
                        enabled: false,
                        isIntegrationMissing: false,
                    },
                    email: {
                        enabled: false,
                        isIntegrationMissing: false,
                    },
                },
            },
        }),
        store2: storeActivationFixture({
            storeName: 'store2',
            configuration: getStoreConfigurationFixture({
                storeName: 'store2',
                shopType: 'shopify',
            }),
            settings: {
                sales: {
                    isDisabled: false,
                    enabled: true,
                },
                support: {
                    enabled: true,
                    chat: {
                        enabled: true,
                        isIntegrationMissing: false,
                    },
                    email: {
                        enabled: true,
                        isIntegrationMissing: false,
                    },
                },
            },
        }),
    }

    getStoresEligibleForTrialMock.mockReturnValue([mockStoreActivations.store2])

    const defaultProps: Omit<
        ComponentProps<typeof AiAgentActivationModal>,
        'hasAiAgentNewActivationXp'
    > = {
        isOpen: true,
        isFetchLoading: false,
        isSaveLoading: false,
        onClose: jest.fn(),
        progressPercentage: 50,
        storeActivations: mockStoreActivations,
        onSalesChange: jest.fn(),
        onSupportChange: jest.fn(),
        onSupportChatChange: jest.fn(),
        onSupportEmailChange: jest.fn(),
        onSaveClick: jest.fn(),
        onLearnMoreClick: jest.fn(),
    }

    const renderWithProvider = (
        hasAiAgentNewActivationXp: boolean,
        overrides?: Partial<
            Omit<
                ComponentProps<typeof AiAgentActivationModal>,
                'hasAiAgentNewActivationXp'
            >
        >,
    ) =>
        render(
            <QueryClientProvider client={queryClient}>
                <Provider
                    store={mockStore({
                        billing: toImmutable({
                            products: [],
                        }),
                    })}
                >
                    <AiAgentActivationModal
                        {...defaultProps}
                        {...overrides}
                        hasAiAgentNewActivationXp={hasAiAgentNewActivationXp}
                    />
                </Provider>
            </QueryClientProvider>,
        )
    useTrialEligibilityMock.mockReturnValue({
        canStartTrial: false,
        isLoading: false,
    })

    beforeEach(() => {
        useAtLeastOneStoreHasActiveTrialOnSpecificStoresMock.mockReturnValue(
            false,
        )
        useTrialEligibilityForManualActivationFromFeatureFlagMock.mockReturnValue(
            {
                canStartTrial: false,
            },
        )
        mockUseStartTrialMock.mockReturnValue({
            mutateAsync: (data: any, { onSuccess }: any) => {
                onSuccess()
            },
            isLoading: false,
        })

        jest.clearAllMocks()
    })

    afterEach(() => {
        queryClient.clear()
    })

    describe.each([
        { hasAiAgentNewActivationXp: true },
        { hasAiAgentNewActivationXp: false },
    ])(
        'when hasAiAgentNewActivationXp=$hasAiAgentNewActivationXp',
        ({ hasAiAgentNewActivationXp }) => {
            it('renders store cards for each store activation', () => {
                renderWithProvider(hasAiAgentNewActivationXp)

                const storeCards = screen.getAllByTestId('mock-store-card')
                expect(storeCards).toHaveLength(2)

                const storeNames = screen.getAllByTestId('store-name')
                expect(storeNames[0]).toHaveTextContent('store1')
                expect(storeNames[1]).toHaveTextContent('store2')
            })

            it('forwards support chat change callback correctly', () => {
                renderWithProvider(hasAiAgentNewActivationXp)

                const toggleButtons = screen.getAllByText('Toggle Chat')
                fireEvent.click(toggleButtons[0])

                expect(defaultProps.onSupportChatChange).toHaveBeenCalledWith(
                    'store1',
                    true,
                )
            })

            it('forwards support email change callback correctly', () => {
                renderWithProvider(hasAiAgentNewActivationXp)

                const toggleButtons = screen.getAllByText('Toggle Email')
                fireEvent.click(toggleButtons[0])

                expect(defaultProps.onSupportEmailChange).toHaveBeenCalledWith(
                    'store1',
                    true,
                )
            })

            it('handles save button click', () => {
                renderWithProvider(hasAiAgentNewActivationXp)

                const saveButton = screen.getByText('Save')
                fireEvent.click(saveButton)

                expect(defaultProps.onSaveClick).toHaveBeenCalled()
            })

            it('handles cancel button click', () => {
                renderWithProvider(hasAiAgentNewActivationXp)

                const cancelButton = screen.getByText('Cancel')
                fireEvent.click(cancelButton)

                expect(defaultProps.onClose).toHaveBeenCalled()
            })

            it('shows loading state in the modal when isFetchLoading is true', () => {
                renderWithProvider(hasAiAgentNewActivationXp, {
                    isFetchLoading: true,
                })

                expect(screen.getAllByText('Loading...')).toHaveLength(2)
            })

            it('shows disabled state on save button when isSaveLoading is true', () => {
                renderWithProvider(hasAiAgentNewActivationXp, {
                    isSaveLoading: true,
                })

                const saveButton = screen.getByText('Save')
                expect(saveButton.parentElement).toHaveAttribute(
                    'aria-disabled',
                    'true',
                )
            })

            it('forwards closeModal callback to store cards', () => {
                renderWithProvider(hasAiAgentNewActivationXp)

                const closeButtons = screen.getAllByText('Close Modal')
                fireEvent.click(closeButtons[0])

                expect(defaultProps.onClose).toHaveBeenCalled()
            })

            it('should show the banner when not on usd-6 plan', () => {
                useTrialEligibilityMock.mockReturnValue({
                    canStartTrial: false,
                    isLoading: false,
                })
                useCanUseAiSalesAgentMock.mockReturnValue(false)

                renderWithProvider(hasAiAgentNewActivationXp)

                expect(
                    screen.getByText('Upgrade AI Agent with Sales Skills'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        'Increase your chat conversation rate and maximize revenue opportunities.',
                    ),
                ).toBeInTheDocument()

                const learnMoreButton = screen.getByRole('button', {
                    name: /Learn More/,
                })
                userEvent.click(learnMoreButton)
                expect(defaultProps.onLearnMoreClick).toHaveBeenCalled()
            })

            it('should not show the banner when on usd-6 plan', () => {
                useCanUseAiSalesAgentMock.mockReturnValue(true)

                renderWithProvider(hasAiAgentNewActivationXp)

                expect(
                    screen.queryByText('Upgrade AI Agent with Sales Skills'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText(
                        'Increase your chat conversation rate and maximize revenue opportunities.',
                    ),
                ).not.toBeInTheDocument()
            })

            it('should show the banner with Start Trial button when eligible', async () => {
                useTrialEligibilityMock.mockReturnValue({
                    canStartTrial: true,
                    isLoading: false,
                })
                useCanUseAiSalesAgentMock.mockReturnValue(false)

                renderWithProvider(hasAiAgentNewActivationXp)

                expect(
                    screen.getByText('Upgrade AI Agent with Sales Skills'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        'Increase your chat conversation rate and maximize revenue opportunities.',
                    ),
                ).toBeInTheDocument()

                const startTrialButton = screen.getByRole('button', {
                    name: /Start Trial/,
                })
                expect(startTrialButton).toBeInTheDocument()
                act(() => {
                    userEvent.click(startTrialButton)
                })
                await waitFor(() => {
                    expect(
                        screen.getByText(/Complete Shopping Assistant/),
                    ).toBeInTheDocument()
                })
            })
        },
    )

    it('renders modal with correct title and progress when hasAiAgentNewActivationXp=false', () => {
        renderWithProvider(false)

        expect(
            screen.getByText('Manage AI Agent Activation'),
        ).toBeInTheDocument()
        expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('renders modal with correct title hasAiAgentNewActivationXp=true', () => {
        renderWithProvider(true)

        expect(screen.getByText('Enable AI Agent')).toBeInTheDocument()
    })

    it('forwards sales change callback correctly when hasAiAgentNewActivationXp=false', () => {
        renderWithProvider(false)

        const toggleButtons = screen.getAllByText('Toggle Sales')
        fireEvent.click(toggleButtons[0])

        expect(defaultProps.onSalesChange).toHaveBeenCalledWith(
            'store1',
            true,
            false,
        )
    })

    it('forwards support change callback correctly hasAiAgentNewActivationXp=false', () => {
        renderWithProvider(false)

        const toggleButtons = screen.getAllByText('Toggle Support')
        fireEvent.click(toggleButtons[0])

        expect(defaultProps.onSupportChange).toHaveBeenCalledWith(
            'store1',
            true,
        )
    })
})
