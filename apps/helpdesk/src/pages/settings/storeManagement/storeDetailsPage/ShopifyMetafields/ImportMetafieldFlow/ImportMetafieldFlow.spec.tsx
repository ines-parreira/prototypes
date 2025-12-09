import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ImportMetafieldFlow from './ImportMetafieldFlow'
import { mockImportableFields } from './MetafieldsImportList/data'

jest.mock('./hooks/useImportWizard')
jest.mock('./hooks/useFieldSelection')
jest.mock('./hooks/useImportMetafields')
jest.mock('hooks/useNotify')

const { useImportWizard } = jest.requireMock('./hooks/useImportWizard')
const { useFieldSelection } = jest.requireMock('./hooks/useFieldSelection')
const { useImportMetafields } = jest.requireMock('./hooks/useImportMetafields')
const { useNotify } = jest.requireMock('hooks/useNotify')

describe('ImportMetafieldFlow', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    const mockSelectCategory = jest.fn()
    const mockBackToCategories = jest.fn()
    const mockReset = jest.fn()
    const mockUpdateSelection = jest.fn()
    const mockGetSelectionForCategory = jest.fn()
    const mockGetSelectionCount = jest.fn()
    const mockClearSelectionForCategory = jest.fn()
    const mockClearAllSelections = jest.fn()
    const mockImportMetafields = jest.fn()
    const mockOnClose = jest.fn()
    const mockSuccess = jest.fn()
    const mockError = jest.fn()

    const defaultWizardState = {
        step: 'categories' as const,
        selectedCategory: null,
        selectCategory: mockSelectCategory,
        backToCategories: mockBackToCategories,
        reset: mockReset,
    }

    const defaultFieldSelectionState = {
        updateSelection: mockUpdateSelection,
        getSelectionForCategory: mockGetSelectionForCategory,
        getSelectionCount: mockGetSelectionCount,
        allSelectedFields: [],
        clearSelectionForCategory: mockClearSelectionForCategory,
        clearAllSelections: mockClearAllSelections,
    }

    const renderComponent = (props: {
        isOpen: boolean
        onClose: () => void
    }) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <ImportMetafieldFlow {...props} />
            </QueryClientProvider>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()

        useImportWizard.mockReturnValue(defaultWizardState)
        useFieldSelection.mockReturnValue(defaultFieldSelectionState)
        useImportMetafields.mockReturnValue({
            mutateAsync: mockImportMetafields,
        })
        useNotify.mockReturnValue({
            success: mockSuccess,
            error: mockError,
        })

        mockGetSelectionCount.mockReturnValue(0)
        mockGetSelectionForCategory.mockReturnValue([])
    })

    describe('Modal rendering', () => {
        it('should render the modal with correct structure when isOpen is true', () => {
            renderComponent({ isOpen: true, onClose: mockOnClose })

            expect(
                screen.getByText('Import Shopify metafields to Gorgias'),
            ).toBeInTheDocument()
        })

        it('should not render modal content when isOpen is false', () => {
            renderComponent({ isOpen: false, onClose: mockOnClose })

            expect(
                screen.queryByText('Import Shopify metafields to Gorgias'),
            ).not.toBeInTheDocument()
        })

        it('should call onClose, reset, and clearAllSelections when close button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent({ isOpen: true, onClose: mockOnClose })

            const closeIcon = screen.getByText('close')
            const closeButton = closeIcon.closest('button')!

            await act(() => user.click(closeButton))

            expect(mockClearAllSelections).toHaveBeenCalledTimes(1)
            expect(mockReset).toHaveBeenCalledTimes(1)
            expect(mockOnClose).toHaveBeenCalledTimes(1)
        })
    })

    describe('Categories step', () => {
        it('should render all categories', () => {
            renderComponent({ isOpen: true, onClose: mockOnClose })

            expect(screen.getByText('Customer')).toBeInTheDocument()
            expect(screen.getByText('Order')).toBeInTheDocument()
            expect(screen.getByText('Draft Order')).toBeInTheDocument()
        })

        it('should display selection counts on categories', () => {
            mockGetSelectionCount.mockImplementation((category) => {
                if (category === 'order') return 3
                if (category === 'customer') return 5
                return 0
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            expect(screen.getByText('3 selected')).toBeInTheDocument()
            expect(screen.getByText('5 selected')).toBeInTheDocument()
        })

        it('should not show import button when no selections exist', () => {
            mockGetSelectionCount.mockReturnValue(0)

            renderComponent({ isOpen: true, onClose: mockOnClose })

            expect(
                screen.queryByRole('button', { name: /^import$/i }),
            ).not.toBeInTheDocument()
        })

        it('should show import button when at least one selection exists', () => {
            mockGetSelectionCount.mockImplementation((category) => {
                if (category === 'order') return 2
                return 0
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            expect(
                screen.getByRole('button', { name: /^import$/i }),
            ).toBeInTheDocument()
        })

        it('should call selectCategory when clicking category chevron button', async () => {
            const user = userEvent.setup()
            renderComponent({ isOpen: true, onClose: mockOnClose })

            const orderText = screen.getByText('Order')
            const categoryContainer = orderText.closest('.categoryContainer')
            const chevronButton = categoryContainer?.querySelector('button')

            await act(() => user.click(chevronButton!))

            expect(mockSelectCategory).toHaveBeenCalledTimes(1)
            expect(mockSelectCategory).toHaveBeenCalledWith('order')
        })
    })

    describe('Wizard navigation flow', () => {
        it('should render MetafieldsImportList when a category is selected', () => {
            useImportWizard.mockReturnValue({
                ...defaultWizardState,
                step: 'list',
                selectedCategory: 'customer',
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            expect(screen.getByText('Customer')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Choose up to 10 metafields to import to Gorgias.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /back to category/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /^continue$/i }),
            ).toBeInTheDocument()
        })

        it('should call clearSelectionForCategory and backToCategories when back button is clicked', async () => {
            const user = userEvent.setup()
            useImportWizard.mockReturnValue({
                ...defaultWizardState,
                step: 'list',
                selectedCategory: 'order',
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            const backButton = screen.getByRole('button', {
                name: /back to category/i,
            })

            await act(() => user.click(backButton))

            expect(mockClearSelectionForCategory).toHaveBeenCalledTimes(1)
            expect(mockClearSelectionForCategory).toHaveBeenCalledWith('order')
            expect(mockBackToCategories).toHaveBeenCalledTimes(1)
        })

        it('should call backToCategories when continue button is clicked', async () => {
            const user = userEvent.setup()
            useImportWizard.mockReturnValue({
                ...defaultWizardState,
                step: 'list',
                selectedCategory: 'customer',
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            const continueButton = screen.getByRole('button', {
                name: /^continue$/i,
            })

            await act(() => user.click(continueButton))

            expect(mockBackToCategories).toHaveBeenCalledTimes(1)
        })

        it('should pass selected metafields to MetafieldsImportList', () => {
            const selectedFields = mockImportableFields.filter(
                (field) => field.category === 'customer',
            )
            mockGetSelectionForCategory.mockReturnValue(selectedFields)

            useImportWizard.mockReturnValue({
                ...defaultWizardState,
                step: 'list',
                selectedCategory: 'customer',
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            expect(mockGetSelectionForCategory).toHaveBeenCalledWith('customer')

            const checkboxes = screen.getAllByRole('checkbox')
            const dataCheckboxes = checkboxes.filter(
                (cb) => cb.id !== 'checkbox-0',
            )
            dataCheckboxes.forEach((checkbox) => {
                expect(checkbox).toBeChecked()
            })
        })

        it('should call updateSelection when selection changes in MetafieldsImportList', async () => {
            const user = userEvent.setup()
            useImportWizard.mockReturnValue({
                ...defaultWizardState,
                step: 'list',
                selectedCategory: 'draft_order',
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            const checkboxes = screen.getAllByRole('checkbox')
            const firstRowCheckbox = checkboxes[1]

            await act(() => user.click(firstRowCheckbox))

            await waitFor(() => {
                expect(mockUpdateSelection).toHaveBeenCalled()
            })

            const callArgs = mockUpdateSelection.mock.calls[0]
            expect(callArgs[0]).toBe('draft_order')
            expect(callArgs[1]).toHaveLength(1)
        })
    })

    describe('Field selection & import', () => {
        it('should trigger import mutation with selected fields when import button is clicked', async () => {
            const user = userEvent.setup()
            const selectedFields = [
                mockImportableFields[0],
                mockImportableFields[1],
            ]

            mockGetSelectionCount.mockImplementation((category) => {
                if (category === 'order') return 1
                if (category === 'customer') return 1
                return 0
            })

            useFieldSelection.mockReturnValue({
                ...defaultFieldSelectionState,
                allSelectedFields: selectedFields,
            })

            mockImportMetafields.mockResolvedValue({})

            renderComponent({ isOpen: true, onClose: mockOnClose })

            const importButton = screen.getByRole('button', {
                name: /^import$/i,
            })

            await act(() => user.click(importButton))

            await waitFor(() => {
                expect(mockImportMetafields).toHaveBeenCalledTimes(1)
            })

            expect(mockImportMetafields).toHaveBeenCalledWith({
                fields: selectedFields,
            })
            expect(mockClearAllSelections).toHaveBeenCalledTimes(1)
            expect(mockReset).toHaveBeenCalledTimes(1)
            expect(mockOnClose).toHaveBeenCalledTimes(1)
        })

        it('should not trigger import when no fields are selected', () => {
            mockGetSelectionCount.mockReturnValue(0)

            useFieldSelection.mockReturnValue({
                ...defaultFieldSelectionState,
                allSelectedFields: [],
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            expect(
                screen.queryByRole('button', { name: /^import$/i }),
            ).not.toBeInTheDocument()
        })

        it('should not call import when allSelectedFields is empty even if import is triggered', async () => {
            const user = userEvent.setup()
            mockGetSelectionCount.mockReturnValue(1)

            useFieldSelection.mockReturnValue({
                ...defaultFieldSelectionState,
                allSelectedFields: [],
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            const importButton = screen.getByRole('button', {
                name: /^import$/i,
            })

            await act(() => user.click(importButton))

            expect(mockImportMetafields).not.toHaveBeenCalled()
        })

        it('should not call import when allSelectedFields is null', async () => {
            const user = userEvent.setup()
            mockGetSelectionCount.mockReturnValue(1)

            useFieldSelection.mockReturnValue({
                ...defaultFieldSelectionState,
                allSelectedFields: null as any,
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            const importButton = screen.getByRole('button', {
                name: /^import$/i,
            })

            await act(() => user.click(importButton))

            expect(mockImportMetafields).not.toHaveBeenCalled()
            expect(mockClearAllSelections).not.toHaveBeenCalled()
            expect(mockReset).not.toHaveBeenCalled()
            expect(mockOnClose).not.toHaveBeenCalled()
        })

        it('should not call import when allSelectedFields is undefined', async () => {
            const user = userEvent.setup()
            mockGetSelectionCount.mockReturnValue(1)

            useFieldSelection.mockReturnValue({
                ...defaultFieldSelectionState,
                allSelectedFields: undefined as any,
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            const importButton = screen.getByRole('button', {
                name: /^import$/i,
            })

            await act(() => user.click(importButton))

            expect(mockImportMetafields).not.toHaveBeenCalled()
            expect(mockClearAllSelections).not.toHaveBeenCalled()
            expect(mockReset).not.toHaveBeenCalled()
            expect(mockOnClose).not.toHaveBeenCalled()
        })

        it('should dispatch success notification with count when import succeeds', async () => {
            const user = userEvent.setup()
            const selectedFields = [
                mockImportableFields[0],
                mockImportableFields[1],
                mockImportableFields[2],
            ]

            mockGetSelectionCount.mockImplementation((category) => {
                if (category === 'order') return 2
                if (category === 'customer') return 1
                return 0
            })

            useFieldSelection.mockReturnValue({
                ...defaultFieldSelectionState,
                allSelectedFields: selectedFields,
            })

            mockImportMetafields.mockResolvedValue({})

            renderComponent({ isOpen: true, onClose: mockOnClose })

            const importButton = screen.getByRole('button', {
                name: /^import$/i,
            })

            await act(() => user.click(importButton))

            await waitFor(() => {
                expect(mockSuccess).toHaveBeenCalledTimes(1)
            })

            expect(mockSuccess).toHaveBeenCalledWith(
                'Success! 3 metafields added',
            )
            expect(mockError).not.toHaveBeenCalled()
        })

        it('should dispatch error notification when import fails', async () => {
            const user = userEvent.setup()
            const selectedFields = [mockImportableFields[0]]

            mockGetSelectionCount.mockImplementation((category) => {
                if (category === 'customer') return 1
                return 0
            })

            useFieldSelection.mockReturnValue({
                ...defaultFieldSelectionState,
                allSelectedFields: selectedFields,
            })

            mockImportMetafields.mockRejectedValue(new Error('API Error'))

            renderComponent({ isOpen: true, onClose: mockOnClose })

            const importButton = screen.getByRole('button', {
                name: /^import$/i,
            })

            await act(() => user.click(importButton))

            await waitFor(() => {
                expect(mockError).toHaveBeenCalledTimes(1)
            })

            expect(mockError).toHaveBeenCalledWith(
                'There was an issue adding your Shopify metafields to Gorgias. Please try again.',
            )
            expect(mockSuccess).not.toHaveBeenCalled()
            expect(mockOnClose).not.toHaveBeenCalled()
        })
    })

    describe('State integration', () => {
        it('should pass categoriesWithCount with correct selection counts', () => {
            mockGetSelectionCount.mockImplementation((category) => {
                const counts = {
                    customer: 2,
                    order: 5,
                    draft_order: 0,
                } as Record<string, number>
                return counts[category] || 0
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            expect(mockGetSelectionCount).toHaveBeenCalledWith('customer')
            expect(mockGetSelectionCount).toHaveBeenCalledWith('order')
            expect(mockGetSelectionCount).toHaveBeenCalledWith('draft_order')

            expect(screen.getByText('2 selected')).toBeInTheDocument()
            expect(screen.getByText('5 selected')).toBeInTheDocument()
        })

        it('should render nothing when step is list but selectedCategory is null', () => {
            useImportWizard.mockReturnValue({
                ...defaultWizardState,
                step: 'list',
                selectedCategory: null,
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            expect(
                screen.queryByText(
                    'Choose up to 10 metafields to import to Gorgias.',
                ),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /back to category/i }),
            ).not.toBeInTheDocument()
        })

        it('should render MetafieldsImportList when step is list and selectedCategory exists', () => {
            useImportWizard.mockReturnValue({
                ...defaultWizardState,
                step: 'list',
                selectedCategory: 'order',
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            expect(screen.getByText('Order')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Choose up to 10 metafields to import to Gorgias.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /back to category/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /^continue$/i }),
            ).toBeInTheDocument()
        })
    })
})
