import { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react-hooks'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import createMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { toImmutable } from 'common/utils'
import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { AiAgentActivationModal } from 'pages/aiAgent/Activation/components/AiAgentActivationModal/AiAgentActivationModal'
import { StoreActivation } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCard'
import { getStoreConfigurationFixture } from 'pages/aiAgent/Activation/hooks/tests/fixtures/store-configurations.fixture'
import { useTrialEligibility } from 'pages/aiAgent/hooks/useTrialEligibility'
import { useStartAiSalesAgentTrialForMultipleStores } from 'pages/aiAgent/Overview/hooks/useStartAiSalesAgentTrialForMultipleStores'
import { getStoresEligibleForTrial } from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

// Mock the StoreCard component
jest.mock(
    '../../AiAgentActivationStoreCard/AiAgentActivationStoreCard',
    () => ({
        AiAgentActivationStoreCard: jest.fn(
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
jest.mock('pages/aiAgent/hooks/useTrialEligibility')
const useTrialEligibilityMock = assumeMock(useTrialEligibility)

jest.mock('pages/aiAgent/utils/aiSalesAgentTrialUtils')
const mockStore = createMockStore([thunk])
const queryClient = mockQueryClient()

const getStoresEligibleForTrialMock = assumeMock(getStoresEligibleForTrial)

describe('AiAgentActivationModal', () => {
    const mockStoreActivations: Record<string, StoreActivation> = {
        store1: {
            name: 'Store 1',
            title: 'Store 1',
            alerts: [],
            configuration: getStoreConfigurationFixture({
                storeName: 'store1',
                shopType: 'shopify',
            }),
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
        store2: {
            name: 'Store 2',
            title: 'Store 2',
            alerts: [],
            configuration: getStoreConfigurationFixture({
                storeName: 'store2',
                shopType: 'shopify',
            }),
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
    }

    getStoresEligibleForTrialMock.mockReturnValue([mockStoreActivations.store2])

    const defaultProps: ComponentProps<typeof AiAgentActivationModal> = {
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

    const renderWithProvider = (params?: any) =>
        render(
            <QueryClientProvider client={queryClient}>
                <Provider
                    store={mockStore({
                        billing: toImmutable({
                            products: [],
                        }),
                    })}
                >
                    <AiAgentActivationModal {...defaultProps} {...params} />
                </Provider>
            </QueryClientProvider>,
        )
    useTrialEligibilityMock.mockReturnValue({
        canStartTrial: false,
        isLoading: false,
    })

    beforeEach(() => {
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

    it('renders modal with correct title and progress', () => {
        renderWithProvider()

        expect(
            screen.getByText('Manage AI Agent Activation'),
        ).toBeInTheDocument()
        expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('renders store cards for each store activation', () => {
        renderWithProvider()

        const storeCards = screen.getAllByTestId('mock-store-card')
        expect(storeCards).toHaveLength(2)

        const storeNames = screen.getAllByTestId('store-name')
        expect(storeNames[0]).toHaveTextContent('Store 1')
        expect(storeNames[1]).toHaveTextContent('Store 2')
    })

    it('forwards sales change callback correctly', () => {
        renderWithProvider()

        const toggleButtons = screen.getAllByText('Toggle Sales')
        fireEvent.click(toggleButtons[0])

        expect(defaultProps.onSalesChange).toHaveBeenCalledWith('store1', true)
    })

    it('forwards support change callback correctly', () => {
        renderWithProvider()

        const toggleButtons = screen.getAllByText('Toggle Support')
        fireEvent.click(toggleButtons[0])

        expect(defaultProps.onSupportChange).toHaveBeenCalledWith(
            'store1',
            true,
        )
    })

    it('forwards support chat change callback correctly', () => {
        renderWithProvider()

        const toggleButtons = screen.getAllByText('Toggle Chat')
        fireEvent.click(toggleButtons[0])

        expect(defaultProps.onSupportChatChange).toHaveBeenCalledWith(
            'store1',
            true,
        )
    })

    it('forwards support email change callback correctly', () => {
        renderWithProvider()

        const toggleButtons = screen.getAllByText('Toggle Email')
        fireEvent.click(toggleButtons[0])

        expect(defaultProps.onSupportEmailChange).toHaveBeenCalledWith(
            'store1',
            true,
        )
    })

    it('handles save button click', () => {
        renderWithProvider()

        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)

        expect(defaultProps.onSaveClick).toHaveBeenCalled()
    })

    it('handles cancel button click', () => {
        renderWithProvider()

        const cancelButton = screen.getByText('Cancel')
        fireEvent.click(cancelButton)

        expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('shows loading state in the modal when isFetchLoading is true', () => {
        renderWithProvider({ isFetchLoading: true })

        expect(screen.getAllByText('Loading...')).toHaveLength(2)
    })

    it('shows disabled state on save button when isSaveLoading is true', () => {
        renderWithProvider({ isSaveLoading: true })

        const saveButton = screen.getByText('Save')
        expect(saveButton.parentElement).toHaveAttribute(
            'aria-disabled',
            'true',
        )
    })

    it('forwards closeModal callback to store cards', () => {
        renderWithProvider()

        const closeButtons = screen.getAllByText('Close Modal')
        fireEvent.click(closeButtons[0])

        expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should show the banner when not on usd-6 plan', () => {
        useCanUseAiSalesAgentMock.mockReturnValue(false)

        renderWithProvider()

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

    it('should show the banner with Start Trial button when eligible', async () => {
        useTrialEligibilityMock.mockReturnValue({
            canStartTrial: true,
            isLoading: false,
        })
        useCanUseAiSalesAgentMock.mockReturnValue(false)

        renderWithProvider()

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

    it('should not show the banner when on usd-6 plan', () => {
        useCanUseAiSalesAgentMock.mockReturnValue(true)

        renderWithProvider()

        expect(
            screen.queryByText('Upgrade AI Agent with Sales Skills'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText(
                'Increase your chat conversation rate and maximize revenue opportunities.',
            ),
        ).not.toBeInTheDocument()
    })
})
