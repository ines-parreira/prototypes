import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mockImportableFields } from './data'
import MetafieldsImportList from './MetafieldsImportList'

const mockOnSelectionChange = jest.fn()
const mockOnBack = jest.fn()
const mockOnContinue = jest.fn()

describe('MetafieldsImportList', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render with correct category headings', () => {
        render(
            <MetafieldsImportList
                category="customer"
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
                category="customer"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
                maxFieldsImported={false}
            />,
        )

        expect(
            screen.queryByText(/Maximum number of metafields imported/i),
        ).not.toBeInTheDocument()
    })

    it('should display MaxFieldsImportedBanner when maxFieldsImported is true', () => {
        render(
            <MetafieldsImportList
                category="customer"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
                maxFieldsImported={true}
            />,
        )

        expect(
            screen.getByText(/Maximum number of metafields imported/i),
        ).toBeInTheDocument()
    })

    it('should filter data by category', () => {
        render(
            <MetafieldsImportList
                category="customer"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />,
        )

        const customerField = mockImportableFields.find(
            (field) => field.category === 'customer',
        )
        const orderField = mockImportableFields.find(
            (field) => field.category === 'order',
        )

        expect(screen.getByText(customerField!.name)).toBeInTheDocument()
        expect(screen.queryByText(orderField!.name)).not.toBeInTheDocument()
    })

    it('should call onBack when Back button is clicked', async () => {
        const user = userEvent.setup()

        render(
            <MetafieldsImportList
                category="customer"
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

        render(
            <MetafieldsImportList
                category="customer"
                selectedMetafields={[]}
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

    it('should initialize table with selected metafields', () => {
        const selectedFields = mockImportableFields.filter(
            (field) => field.category === 'customer',
        )

        render(
            <MetafieldsImportList
                category="customer"
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
                category="draft_order"
                selectedMetafields={[]}
                onSelectionChange={mockOnSelectionChange}
                onBack={mockOnBack}
                onContinue={mockOnContinue}
            />,
        )

        const draftOrderFields = mockImportableFields.filter(
            (field) => field.category === 'draft_order',
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
            (field) => field.category === 'draft_order',
        )

        render(
            <MetafieldsImportList
                category="draft_order"
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
                category="draft_order"
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
            (field) => field.category === 'customer',
        )

        render(
            <MetafieldsImportList
                category="customer"
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
})
