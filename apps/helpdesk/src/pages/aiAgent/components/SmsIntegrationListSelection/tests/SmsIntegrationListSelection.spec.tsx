import React from 'react'

import { fireEvent, screen, waitFor } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import { SmsPhoneNumber } from '../../StoreConfigForm/types'
import { SmsIntegrationListSelection } from '../SmsIntegrationListSelection'

jest.mock('../../StoreConfigForm/hooks/useSmsPhoneNumbers', () => ({
    useSmsPhoneNumbers: jest.fn(),
}))

jest.mock('pages/common/components/dropdown/Dropdown', () => ({
    __esModule: true,
    default: ({ children, isOpen, onToggle }: any) => (
        <div data-testid="dropdown" onClick={onToggle}>
            {isOpen && children}
        </div>
    ),
}))

jest.mock('pages/common/components/dropdown/DropdownBody', () => ({
    __esModule: true,
    default: ({ children }: any) => (
        <div data-testid="dropdown-body">{children}</div>
    ),
}))

jest.mock('pages/common/components/dropdown/DropdownItem', () => ({
    __esModule: true,
    default: ({ children, onClick, option }: any) => (
        <div
            data-testid={`dropdown-item-${option.value}`}
            onClick={() => onClick(option.value)}
        >
            {children}
        </div>
    ),
}))

jest.mock('pages/common/components/dropdown/DropdownSearch', () => ({
    __esModule: true,
    default: () => <div data-testid="dropdown-search">Search</div>,
}))

jest.mock('pages/common/forms/input/SelectInputBox', () => ({
    __esModule: true,
    default: React.forwardRef(
        (
            { children, onToggle, placeholder, hasError, error, label }: any,
            ref,
        ) => (
            <div data-testid="select-input-box" ref={ref as any}>
                <div data-testid="select-input-display">
                    {label?.length > 0 ? label.join(', ') : placeholder}
                </div>
                {hasError && (
                    <div data-testid="select-input-error">{error}</div>
                )}
                <button
                    data-testid="select-input-toggle"
                    onClick={() => onToggle(true)}
                >
                    Toggle
                </button>
                {children}
            </div>
        ),
    ),
    SelectInputBoxContext: {
        Consumer: ({ children }: any) => children({ onBlur: jest.fn() }),
    },
}))

describe('SmsIntegrationListSelection', () => {
    const mockSmsIntegrations: SmsPhoneNumber[] = [
        {
            id: 1,
            phoneNumberName: 'SMS Integration 1',
            address: '+1234567890',
            isDeactivated: false,
            channel: 'sms',
            type: 'sms',
            name: 'SMS Integration 1',
        },
        {
            id: 2,
            phoneNumberName: 'SMS Integration 2',
            address: '+1234567890',
            isDeactivated: false,
            channel: 'sms',
            type: 'sms',
            name: 'SMS Integration 2',
        },
        {
            id: 3,
            phoneNumberName: 'SMS Integration 3',
            address: '+1234567890',
            isDeactivated: false,
            channel: 'sms',
            type: 'sms',
            name: 'SMS Integration 3',
        },
    ]

    const defaultProps = {
        onSelectionChange: jest.fn(),
        selectedIds: [],
        smsItems: mockSmsIntegrations,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders with placeholder when no SMS integrations are selected', () => {
        renderWithRouter(<SmsIntegrationListSelection {...defaultProps} />)

        expect(screen.getByTestId('select-input-display')).toHaveTextContent(
            'Select one or more SMS integrations',
        )
    })

    it('displays selected SMS integration names', () => {
        const props = {
            ...defaultProps,
            selectedIds: [1, 3],
        }

        renderWithRouter(<SmsIntegrationListSelection {...props} />)

        expect(screen.getByTestId('select-input-display')).toHaveTextContent(
            'SMS Integration 1, SMS Integration 3',
        )
    })

    it('opens dropdown when toggle is clicked', async () => {
        renderWithRouter(<SmsIntegrationListSelection {...defaultProps} />)

        fireEvent.click(screen.getByTestId('select-input-toggle'))

        await waitFor(() => {
            expect(screen.getByTestId('dropdown')).toBeInTheDocument()
            expect(screen.getByTestId('dropdown-body')).toBeInTheDocument()
        })
    })

    it('renders all SMS integration items in dropdown', async () => {
        renderWithRouter(<SmsIntegrationListSelection {...defaultProps} />)

        fireEvent.click(screen.getByTestId('select-input-toggle'))

        await waitFor(() => {
            expect(screen.getByTestId('dropdown-item-1')).toBeInTheDocument()
            expect(screen.getByTestId('dropdown-item-2')).toBeInTheDocument()
            expect(screen.getByTestId('dropdown-item-3')).toBeInTheDocument()
        })

        expect(screen.getByTestId('dropdown-item-1')).toHaveTextContent(
            'SMS Integration 1',
        )
        expect(screen.getByTestId('dropdown-item-2')).toHaveTextContent(
            'SMS Integration 2',
        )
        expect(screen.getByTestId('dropdown-item-3')).toHaveTextContent(
            'SMS Integration 3',
        )
    })

    it('calls onSelectionChange when an unselected item is clicked', async () => {
        const mockOnSelectionChange = jest.fn()
        const props = {
            ...defaultProps,
            onSelectionChange: mockOnSelectionChange,
            selectedIds: [2],
        }

        renderWithRouter(<SmsIntegrationListSelection {...props} />)

        fireEvent.click(screen.getByTestId('select-input-toggle'))

        await waitFor(() => {
            expect(screen.getByTestId('dropdown-item-1')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByTestId('dropdown-item-1'))

        expect(mockOnSelectionChange).toHaveBeenCalledWith([2, 1])
    })

    it('calls onSelectionChange when a selected item is clicked to deselect', async () => {
        const mockOnSelectionChange = jest.fn()
        const props = {
            ...defaultProps,
            onSelectionChange: mockOnSelectionChange,
            selectedIds: [1, 2],
        }

        renderWithRouter(<SmsIntegrationListSelection {...props} />)

        fireEvent.click(screen.getByTestId('select-input-toggle'))

        await waitFor(() => {
            expect(screen.getByTestId('dropdown-item-2')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByTestId('dropdown-item-2'))

        expect(mockOnSelectionChange).toHaveBeenCalledWith([1])
    })

    it('displays error message when hasError is true', () => {
        const props = {
            ...defaultProps,
            hasError: true,
            error: 'SMS integration is required',
        }

        renderWithRouter(<SmsIntegrationListSelection {...props} />)

        expect(screen.getByTestId('select-input-error')).toHaveTextContent(
            'SMS integration is required',
        )
    })

    it('handles empty SMS items array', () => {
        const props = {
            ...defaultProps,
            smsItems: [],
        }

        renderWithRouter(<SmsIntegrationListSelection {...props} />)

        expect(screen.getByTestId('select-input-display')).toHaveTextContent(
            'Select one or more SMS integrations',
        )
    })

    it('handles selected IDs that do not match any SMS items', () => {
        const props = {
            ...defaultProps,
            selectedIds: [999],
        }

        renderWithRouter(<SmsIntegrationListSelection {...props} />)

        expect(screen.getByTestId('select-input-display')).toHaveTextContent(
            'Select one or more SMS integrations',
        )
    })

    it('sorts SMS items when sortingCallback is provided', async () => {
        const sortingCallback = (a: SmsPhoneNumber, b: SmsPhoneNumber) =>
            b.name.localeCompare(a.name)

        const props = {
            ...defaultProps,
            sortingCallback,
        }

        renderWithRouter(<SmsIntegrationListSelection {...props} />)

        fireEvent.click(screen.getByTestId('select-input-toggle'))

        await waitFor(() => {
            expect(screen.getByTestId('dropdown-item-3')).toBeInTheDocument()
        })

        const items = screen.getAllByTestId(/dropdown-item-\d+/)
        expect(items[0]).toHaveTextContent('SMS Integration 3')
        expect(items[1]).toHaveTextContent('SMS Integration 2')
        expect(items[2]).toHaveTextContent('SMS Integration 1')
    })

    it('passes labelId to SelectInputBox', () => {
        const props = {
            ...defaultProps,
            labelId: 'test-label-id',
        }

        renderWithRouter(<SmsIntegrationListSelection {...props} />)

        expect(screen.getByTestId('select-input-box')).toBeInTheDocument()
    })

    it('handles disabled state', () => {
        const props = {
            ...defaultProps,
            isDisabled: true,
        }

        renderWithRouter(<SmsIntegrationListSelection {...props} />)

        expect(screen.getByTestId('select-input-box')).toBeInTheDocument()
    })

    it('handles multiple selections correctly', async () => {
        const mockOnSelectionChange = jest.fn()
        const props = {
            ...defaultProps,
            onSelectionChange: mockOnSelectionChange,
            selectedIds: [],
        }

        renderWithRouter(<SmsIntegrationListSelection {...props} />)

        fireEvent.click(screen.getByTestId('select-input-toggle'))

        await waitFor(() => {
            expect(screen.getByTestId('dropdown-item-1')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByTestId('dropdown-item-1'))
        expect(mockOnSelectionChange).toHaveBeenCalledWith([1])

        mockOnSelectionChange.mockClear()

        fireEvent.click(screen.getByTestId('dropdown-item-2'))
        expect(mockOnSelectionChange).toHaveBeenCalledWith([2])
    })
})
