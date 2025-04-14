import { ComponentProps } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { getStoreConfigurationFixture } from '../../../hooks/tests/fixtures/store-configurations.fixture'
import { StoreActivation } from '../../AiAgentActivationStoreCard/AiAgentActivationStoreCard'
import { AiAgentActivationModal } from '../AiAgentActivationModal'

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
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders modal with correct title and progress', () => {
        render(<AiAgentActivationModal {...defaultProps} />)

        expect(
            screen.getByText('Manage AI Agent Activation'),
        ).toBeInTheDocument()
        expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('renders store cards for each store activation', () => {
        render(<AiAgentActivationModal {...defaultProps} />)

        const storeCards = screen.getAllByTestId('mock-store-card')
        expect(storeCards).toHaveLength(2)

        const storeNames = screen.getAllByTestId('store-name')
        expect(storeNames[0]).toHaveTextContent('Store 1')
        expect(storeNames[1]).toHaveTextContent('Store 2')
    })

    it('forwards sales change callback correctly', () => {
        render(<AiAgentActivationModal {...defaultProps} />)

        const toggleButtons = screen.getAllByText('Toggle Sales')
        fireEvent.click(toggleButtons[0])

        expect(defaultProps.onSalesChange).toHaveBeenCalledWith('store1', true)
    })

    it('forwards support change callback correctly', () => {
        render(<AiAgentActivationModal {...defaultProps} />)

        const toggleButtons = screen.getAllByText('Toggle Support')
        fireEvent.click(toggleButtons[0])

        expect(defaultProps.onSupportChange).toHaveBeenCalledWith(
            'store1',
            true,
        )
    })

    it('forwards support chat change callback correctly', () => {
        render(<AiAgentActivationModal {...defaultProps} />)

        const toggleButtons = screen.getAllByText('Toggle Chat')
        fireEvent.click(toggleButtons[0])

        expect(defaultProps.onSupportChatChange).toHaveBeenCalledWith(
            'store1',
            true,
        )
    })

    it('forwards support email change callback correctly', () => {
        render(<AiAgentActivationModal {...defaultProps} />)

        const toggleButtons = screen.getAllByText('Toggle Email')
        fireEvent.click(toggleButtons[0])

        expect(defaultProps.onSupportEmailChange).toHaveBeenCalledWith(
            'store1',
            true,
        )
    })

    it('handles save button click', () => {
        render(<AiAgentActivationModal {...defaultProps} />)

        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)

        expect(defaultProps.onSaveClick).toHaveBeenCalled()
    })

    it('handles cancel button click', () => {
        render(<AiAgentActivationModal {...defaultProps} />)

        const cancelButton = screen.getByText('Cancel')
        fireEvent.click(cancelButton)

        expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('shows loading state in the modal when isFetchLoading is true', () => {
        render(
            <AiAgentActivationModal {...defaultProps} isFetchLoading={true} />,
        )

        expect(screen.getAllByText('Loading...')).toHaveLength(2)
    })

    it('shows disabled state on save button when isSaveLoading is true', () => {
        render(
            <AiAgentActivationModal {...defaultProps} isSaveLoading={true} />,
        )

        const saveButton = screen.getByText('Save')
        expect(saveButton.parentElement).toHaveAttribute(
            'aria-disabled',
            'true',
        )
    })

    it('forwards closeModal callback to store cards', () => {
        render(<AiAgentActivationModal {...defaultProps} />)

        const closeButtons = screen.getAllByText('Close Modal')
        fireEvent.click(closeButtons[0])

        expect(defaultProps.onClose).toHaveBeenCalled()
    })
})
