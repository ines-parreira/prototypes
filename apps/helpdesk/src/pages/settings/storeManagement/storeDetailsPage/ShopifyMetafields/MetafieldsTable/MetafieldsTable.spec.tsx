import { assumeMock } from '@repo/testing'
import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { useDeleteMetafield } from '../hooks/useDeleteMetafield'
import { useToggleMetafieldVisibility } from '../hooks/useToggleMetafieldVisibility'
import { columns } from './Columns'
import MetafieldsTable from './MetafieldsTable'
import type { Field } from './types'

jest.mock('../hooks/useToggleMetafieldVisibility')
const useToggleMetafieldVisibilityMock = assumeMock(
    useToggleMetafieldVisibility,
)

jest.mock('../hooks/useDeleteMetafield')
const useDeleteMetafieldMock = assumeMock(useDeleteMetafield)

const mockToggleVisibility = jest.fn()
const mockDeleteMetafield = jest.fn()

const mockFields: Field[] = [
    {
        id: '1',
        name: 'Customer Email',
        type: 'single_line_text',
        category: 'customer',
        isVisible: true,
    },
    {
        id: '2',
        name: 'Order Notes',
        type: 'multi_line_text',
        category: 'order',
        isVisible: false,
    },
    {
        id: '3',
        name: 'Draft Date',
        type: 'date',
        category: 'draft_order',
        isVisible: true,
    },
]

describe('MetafieldsTable', () => {
    let user: ReturnType<typeof userEvent.setup>

    beforeEach(() => {
        user = userEvent.setup()
        useToggleMetafieldVisibilityMock.mockReturnValue({
            mutate: mockToggleVisibility,
            mutateAsync: jest.fn(),
            isLoading: false,
            isError: false,
            isSuccess: false,
            error: null,
        } as any)
        useDeleteMetafieldMock.mockReturnValue({
            mutate: mockDeleteMetafield,
            mutateAsync: jest.fn(),
            isLoading: false,
            isError: false,
            isSuccess: false,
            error: null,
        } as any)

        jest.clearAllMocks()
    })

    it('should render table with data', () => {
        renderWithStoreAndQueryClientProvider(
            <MetafieldsTable columns={columns} data={mockFields} />,
        )

        expect(screen.getByText('Customer Email')).toBeInTheDocument()
        expect(screen.getByText('Order Notes')).toBeInTheDocument()
        expect(screen.getByText('Draft Date')).toBeInTheDocument()
    })

    it('should display total count in toolbar', () => {
        renderWithStoreAndQueryClientProvider(
            <MetafieldsTable columns={columns} data={mockFields} />,
        )

        expect(screen.getByText(/3/)).toBeInTheDocument()
    })

    it('should call toggleVisibility when visibility button is clicked', async () => {
        renderWithStoreAndQueryClientProvider(
            <MetafieldsTable columns={columns} data={mockFields} />,
        )

        await waitFor(() => {
            expect(screen.getByText('Customer Email')).toBeInTheDocument()
        })

        const allButtons = screen.getAllByRole('button')
        const visibilityButtons = allButtons.filter(
            (btn) => btn.id === 'metafield-visibility-toggle',
        )
        const firstVisibilityButton = visibilityButtons[0]

        await act(() => user.click(firstVisibilityButton))

        expect(mockToggleVisibility).toHaveBeenCalledWith({
            id: '1',
            isVisible: false,
        })
    })

    it('should open remove modal when remove button is clicked', async () => {
        renderWithStoreAndQueryClientProvider(
            <MetafieldsTable columns={columns} data={mockFields} />,
        )

        await waitFor(() => {
            expect(screen.getByText('Customer Email')).toBeInTheDocument()
        })

        const allButtons = screen.getAllByRole('button')
        const removeButton = allButtons.find((btn) => btn.id === '1')

        if (removeButton) {
            await act(() => user.click(removeButton))
        }

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Remove metafield?')).toBeInTheDocument()
        })
    })

    it('should close remove modal when Cancel is clicked', async () => {
        renderWithStoreAndQueryClientProvider(
            <MetafieldsTable columns={columns} data={mockFields} />,
        )

        await waitFor(() => {
            expect(screen.getByText('Customer Email')).toBeInTheDocument()
        })

        const allButtons = screen.getAllByRole('button')
        const removeButton = allButtons.find((btn) => btn.id === '1')

        if (removeButton) {
            await act(() => user.click(removeButton))
        }

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        const dialog = screen.getByRole('dialog')
        const cancelButton = within(dialog).getByRole('button', {
            name: /cancel/i,
        })
        await act(() => user.click(cancelButton))

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    it('should call deleteMetafield when Remove is confirmed', async () => {
        renderWithStoreAndQueryClientProvider(
            <MetafieldsTable columns={columns} data={mockFields} />,
        )

        await waitFor(() => {
            expect(screen.getByText('Customer Email')).toBeInTheDocument()
        })

        const allButtons = screen.getAllByRole('button')
        const removeButton = allButtons.find((btn) => btn.id === '1')

        if (removeButton) {
            await act(() => user.click(removeButton))
        }

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        const dialog = screen.getByRole('dialog')
        const confirmButton = within(dialog).getByRole('button', {
            name: /remove/i,
        })
        await act(() => user.click(confirmButton))

        expect(mockDeleteMetafield).toHaveBeenCalledWith({
            id: expect.any(String),
        })
    })

    it('should render loading state', () => {
        renderWithStoreAndQueryClientProvider(
            <MetafieldsTable columns={columns} data={[]} isLoading={true} />,
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('should filter data based on search input', async () => {
        renderWithStoreAndQueryClientProvider(
            <MetafieldsTable columns={columns} data={mockFields} />,
        )

        const searchInput = screen.getByRole('textbox')
        await act(() => user.type(searchInput, 'Customer'))

        await waitFor(() => {
            expect(screen.getByText('Customer Email')).toBeInTheDocument()
            expect(screen.queryByText('Order Notes')).not.toBeInTheDocument()
        })
    })

    it('should default isVisible to true when not provided', async () => {
        const fieldWithoutVisibility: Field[] = [
            {
                id: '4',
                name: 'Product SKU',
                type: 'single_line_text',
                category: 'product',
            } as Field,
        ]

        renderWithStoreAndQueryClientProvider(
            <MetafieldsTable columns={columns} data={fieldWithoutVisibility} />,
        )

        await waitFor(() => {
            expect(screen.getByText('Product SKU')).toBeInTheDocument()
        })

        const allButtons = screen.getAllByRole('button')
        const visibilityButtons = allButtons.filter(
            (btn) => btn.id === 'metafield-visibility-toggle',
        )

        expect(visibilityButtons.length).toBeGreaterThan(0)

        if (visibilityButtons.length > 0) {
            await act(() => user.click(visibilityButtons[0]))
        }

        expect(mockToggleVisibility).toHaveBeenCalledWith({
            id: '4',
            isVisible: false,
        })
    })

    it('should open import modal when import button is clicked', async () => {
        renderWithStoreAndQueryClientProvider(
            <MetafieldsTable columns={columns} data={mockFields} />,
        )

        const importButton = screen.getByRole('button', { name: /import/i })
        await act(() => user.click(importButton))

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(
                screen.getByText('Import Shopify metafields to Gorgias'),
            ).toBeInTheDocument()
        })
    })

    it('should close import modal when close is triggered', async () => {
        renderWithStoreAndQueryClientProvider(
            <MetafieldsTable columns={columns} data={mockFields} />,
        )

        const importButton = screen.getByRole('button', { name: /import/i })
        await act(() => user.click(importButton))

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        const dialog = screen.getByRole('dialog')
        const buttons = within(dialog).getAllByRole('button')
        const closeButton = buttons[0]

        await act(() => user.click(closeButton))

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })
})
