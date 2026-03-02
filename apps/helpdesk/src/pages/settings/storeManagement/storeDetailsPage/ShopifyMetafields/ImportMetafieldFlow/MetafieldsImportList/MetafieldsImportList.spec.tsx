import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { SupportedCategories } from '../../types'
import { mockImportableFields } from './data'
import MetafieldsImportList from './MetafieldsImportList'

jest.mock('../../hooks/useImportableMetafields')

const { useImportableMetafields } = jest.requireMock(
    '../../hooks/useImportableMetafields',
)

const mockOnSelectionChange = jest.fn()
const mockOnBack = jest.fn()
const mockOnContinue = jest.fn()

describe('MetafieldsImportList', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useImportableMetafields.mockReturnValue({
            data: mockImportableFields,
            isLoading: false,
            isError: false,
            error: null,
        })
    })

    it('should render with correct category headings', () => {
        render(
            <MetafieldsImportList
                category="Customer"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />,
        )

        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Type')).toBeInTheDocument()
        expect(screen.getByText('Customer')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Choose up to 10 metafields to import to Gorgias.',
            ),
        ).toBeInTheDocument()
    })

    it('should not display MaxFieldsImportedBanner when maxFieldsImported is false', () => {
        render(
            <MetafieldsImportList
                category="Customer"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
                isAtMaxFields={false}
            />,
        )

        expect(
            screen.queryByText(/Maximum number of metafields imported/i),
        ).not.toBeInTheDocument()
    })

    it('should display MaxFieldsImportedBanner when maxFieldsImported is true', () => {
        render(
            <MetafieldsImportList
                category="Customer"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
                isAtMaxFields
            />,
        )

        expect(
            screen.getByText(/Maximum number of metafields imported/i),
        ).toBeInTheDocument()
    })

    it('should filter data by category', () => {
        render(
            <MetafieldsImportList
                category="Customer"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />,
        )

        const customerField = mockImportableFields.find(
            (field) => field.category === 'Customer',
        )
        const orderField = mockImportableFields.find(
            (field) => field.category === 'Order',
        )

        expect(screen.getByText(customerField!.name)).toBeInTheDocument()
        expect(screen.queryByText(orderField!.name)).not.toBeInTheDocument()
    })

    it('should call onBack when Back button is clicked', async () => {
        const user = userEvent.setup()

        render(
            <MetafieldsImportList
                category="Customer"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />,
        )

        const backButton = screen.getByRole('button', {
            name: /back to category/i,
        })

        await act(() => user.click(backButton))

        expect(mockOnBack).toHaveBeenCalledTimes(1)
    })

    it('should call onContinue when Continue button is clicked', async () => {
        const user = userEvent.setup()
        const selectedFields = mockImportableFields.filter(
            (field) => field.category === 'Customer',
        )

        render(
            <MetafieldsImportList
                category="Customer"
                selectedMetafields={selectedFields}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />,
        )

        const continueButton = screen.getByRole('button', {
            name: /^continue$/i,
        })

        await act(() => user.click(continueButton))

        expect(mockOnContinue).toHaveBeenCalledTimes(1)
    })

    it('should disable Continue button when no items are selected', () => {
        render(
            <MetafieldsImportList
                category="Customer"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />,
        )

        const continueButton = screen.getByRole('button', {
            name: /^continue$/i,
        })

        expect(continueButton).toBeDisabled()
    })

    it('should enable Continue button when items are selected', () => {
        const selectedFields = mockImportableFields.filter(
            (field) => field.category === 'Customer',
        )

        render(
            <MetafieldsImportList
                category="Customer"
                selectedMetafields={selectedFields}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />,
        )

        const continueButton = screen.getByRole('button', {
            name: /^continue$/i,
        })

        expect(continueButton).not.toBeDisabled()
    })

    it('should initialize table with selected metafields', () => {
        const selectedFields = mockImportableFields.filter(
            (field) => field.category === 'Customer',
        )

        render(
            <MetafieldsImportList
                category="Customer"
                selectedMetafields={selectedFields}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />,
        )

        const checkboxes = screen.getAllByRole('checkbox')
        const dataCheckboxes = checkboxes.filter((cb) => cb.id !== 'checkbox-0')

        expect(dataCheckboxes.length).toBeGreaterThan(0)
        dataCheckboxes.forEach((checkbox) => {
            expect(checkbox).toBeChecked()
        })
    })

    it('should filter table data based on search input', async () => {
        const user = userEvent.setup()

        render(
            <MetafieldsImportList
                category="DraftOrder"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />,
        )

        const draftOrderFields = mockImportableFields.filter(
            (field) => field.category === 'DraftOrder',
        )
        const firstField = draftOrderFields[0]
        const secondField = draftOrderFields[1]

        expect(screen.getByText(firstField.name)).toBeInTheDocument()
        expect(screen.getByText(secondField.name)).toBeInTheDocument()

        const searchInput = screen.getByRole('textbox')
        await act(() => user.type(searchInput, 'package size 2'))

        await waitFor(() => {
            expect(screen.getByText(secondField.name)).toBeInTheDocument()
            expect(screen.queryByText(firstField.name)).not.toBeInTheDocument()
        })
    })

    it('should display select count in toolbar', () => {
        const selectedFields = mockImportableFields.filter(
            (field) => field.category === 'DraftOrder',
        )

        render(
            <MetafieldsImportList
                category="DraftOrder"
                selectedMetafields={selectedFields}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />,
        )

        expect(screen.getByText(/3 items selected/i)).toBeInTheDocument()
    })

    it('should handle multiple row selection', async () => {
        const user = userEvent.setup()

        render(
            <MetafieldsImportList
                category="DraftOrder"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />,
        )

        const checkboxes = screen.getAllByRole('checkbox')
        const firstRowCheckbox = checkboxes[1]
        const secondRowCheckbox = checkboxes[2]

        await act(() => user.click(firstRowCheckbox))

        await waitFor(() => {
            expect(mockOnSelectionChange).toHaveBeenCalled()
        })

        const firstCallArgs = mockOnSelectionChange.mock.calls[0][0]
        expect(firstCallArgs.length).toBe(1)

        await act(() => user.click(secondRowCheckbox))

        await waitFor(() => {
            expect(mockOnSelectionChange).toHaveBeenCalledTimes(2)
        })

        const secondCallArgs =
            mockOnSelectionChange.mock.calls[
                mockOnSelectionChange.mock.calls.length - 1
            ][0]
        expect(secondCallArgs.length).toBe(2)
    })

    it('should handle deselecting a row', async () => {
        const user = userEvent.setup()
        const selectedFields = mockImportableFields.filter(
            (field) => field.category === 'Customer',
        )

        render(
            <MetafieldsImportList
                category="Customer"
                selectedMetafields={selectedFields}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />,
        )

        const checkboxes = screen.getAllByRole('checkbox')
        const firstRowCheckbox = checkboxes[1]

        expect(firstRowCheckbox).toBeChecked()

        await act(() => user.click(firstRowCheckbox))

        await waitFor(() => {
            expect(mockOnSelectionChange).toHaveBeenCalled()
        })

        const callArgs = mockOnSelectionChange.mock.calls[0][0]
        expect(callArgs.length).toBe(0)
    })

    it('should limit selection to 10 items when select all is clicked', async () => {
        const user = userEvent.setup()
        const importedFields = mockImportableFields
            .filter((field) => field.category === 'DraftOrder')
            .slice(0, 5)

        render(
            <MetafieldsImportList
                category="DraftOrder"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
                importedFields={importedFields}
            />,
        )

        const checkboxes = screen.getAllByRole('checkbox')
        const selectAllCheckbox = checkboxes[0]

        await act(() => user.click(selectAllCheckbox))

        await waitFor(() => {
            expect(mockOnSelectionChange).toHaveBeenCalled()
        })

        const callArgs = mockOnSelectionChange.mock.calls[0][0]
        expect(callArgs.length).toBe(5)
    })

    it('should select maximum of 10 items when select all is clicked with no imported fields', async () => {
        const user = userEvent.setup()

        render(
            <MetafieldsImportList
                category="DraftOrder"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
                importedFields={[]}
            />,
        )

        const checkboxes = screen.getAllByRole('checkbox')
        const selectAllCheckbox = checkboxes[0]

        await act(() => user.click(selectAllCheckbox))

        await waitFor(() => {
            expect(mockOnSelectionChange).toHaveBeenCalled()
        })

        const callArgs = mockOnSelectionChange.mock.calls[0][0]
        expect(callArgs.length).toBe(10)
    })

    it('should disable checkbox when limit is reached for unselected field', () => {
        const importedFields = mockImportableFields
            .filter((field) => field.category === 'DraftOrder')
            .slice(0, 10)

        render(
            <MetafieldsImportList
                category="DraftOrder"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
                importedFields={importedFields}
            />,
        )

        const checkboxes = screen.getAllByRole('checkbox')
        const dataCheckboxes = checkboxes.filter(
            (cb) => !cb.getAttribute('aria-label')?.includes('Select all'),
        )

        expect(dataCheckboxes.length).toBeGreaterThan(0)
        dataCheckboxes.forEach((checkbox) => {
            expect(checkbox).toBeDisabled()
        })
    })

    it('should not disable checkbox for already selected field when limit is reached', () => {
        const selectedFields = mockImportableFields
            .filter((field) => field.category === 'DraftOrder')
            .slice(0, 1)

        const importedFields = mockImportableFields
            .filter((field) => field.category === 'DraftOrder')
            .slice(1, 10)

        render(
            <MetafieldsImportList
                category="DraftOrder"
                selectedMetafields={selectedFields}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
                importedFields={importedFields}
            />,
        )

        const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[]
        const selectedCheckbox = checkboxes.find((cb) => cb.checked)

        expect(selectedCheckbox).toBeDefined()
        expect(selectedCheckbox).toBeChecked()
        expect(selectedCheckbox).not.toBeDisabled()
    })

    it('should disable unsupported field type checkbox regardless of limit', () => {
        const unsupportedField = mockImportableFields.find(
            (field) => field.type === 'page_reference',
        )!

        render(
            <MetafieldsImportList
                category={unsupportedField.category as SupportedCategories}
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
                importedFields={[]}
            />,
        )

        expect(screen.getByText(unsupportedField.name)).toBeInTheDocument()

        const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[]
        const dataCheckboxes = checkboxes.filter((cb) => cb.id !== 'checkbox-0')
        const unsupportedCheckbox = dataCheckboxes.find((cb) => cb.disabled)

        expect(unsupportedCheckbox).toBeDefined()
        expect(unsupportedCheckbox).toBeDisabled()
    })

    it('should render empty state when no metafields are available', () => {
        useImportableMetafields.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: null,
        })

        render(
            <MetafieldsImportList
                category="Customer"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />,
        )

        expect(
            screen.getByRole('heading', { name: /no metafields available/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /there are no metafields available to import in this category/i,
            ),
        ).toBeInTheDocument()
    })

    describe('Filters', () => {
        it('should render the Type filter component', () => {
            render(
                <MetafieldsImportList
                    category="DraftOrder"
                    selectedMetafields={[]}
                    onSelectionChange={mockOnSelectionChange}
                    onBack={mockOnBack}
                    onContinue={mockOnContinue}
                />,
            )

            expect(screen.getByText('Type')).toBeInTheDocument()
        })

        it('should render filter with correct metafield type options', () => {
            render(
                <MetafieldsImportList
                    category="DraftOrder"
                    selectedMetafields={[]}
                    onSelectionChange={mockOnSelectionChange}
                    onBack={mockOnBack}
                    onContinue={mockOnContinue}
                />,
            )

            expect(screen.getByText('Type')).toBeInTheDocument()
            const draftOrderFields = mockImportableFields
                .slice(0, 10)
                .filter((field) => field.category === 'DraftOrder')
            draftOrderFields.forEach((field) => {
                expect(screen.getByText(field.name)).toBeInTheDocument()
            })
        })
    })
})
