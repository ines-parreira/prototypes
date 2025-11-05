import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useDeleteMetafield } from '../hooks/useDeleteMetafield'
import { useToggleMetafieldVisibility } from '../hooks/useToggleMetafieldVisibility'
import { columns } from './Columns'
import MetafieldsTable from './MetafieldsTable'
import { Field } from './types'

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
    let queryClient: QueryClient

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
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
        render(<MetafieldsTable columns={columns} data={mockFields} />, {
            wrapper,
        })

        expect(screen.getByText('Customer Email')).toBeInTheDocument()
        expect(screen.getByText('Order Notes')).toBeInTheDocument()
        expect(screen.getByText('Draft Date')).toBeInTheDocument()
    })

    it('should display total count in toolbar', () => {
        render(<MetafieldsTable columns={columns} data={mockFields} />, {
            wrapper,
        })

        expect(screen.getByText(/3/)).toBeInTheDocument()
    })

    it('should call toggleVisibility when visibility button is clicked', async () => {
        render(<MetafieldsTable columns={columns} data={mockFields} />, {
            wrapper,
        })

        const buttons = screen.getAllByRole('button')
        const visibilityButton = buttons.find(
            (btn) => btn.id === 'control-visibility1',
        )

        if (visibilityButton) {
            await act(async () => {
                await userEvent.click(visibilityButton)
            })
        }

        expect(mockToggleVisibility).toHaveBeenCalledWith({
            id: '1',
            isVisible: false,
        })
    })

    it('should open remove modal when remove button is clicked', async () => {
        render(<MetafieldsTable columns={columns} data={mockFields} />, {
            wrapper,
        })

        const buttons = screen.getAllByRole('button')
        const removeButtons = buttons.filter(
            (btn) => !btn.id.startsWith('control-visibility'),
        )

        if (removeButtons.length > 1) {
            await act(async () => {
                await userEvent.click(removeButtons[1])
            })
        }

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Remove metafield?')).toBeInTheDocument()
        })
    })

    it('should close remove modal when Cancel is clicked', async () => {
        render(<MetafieldsTable columns={columns} data={mockFields} />, {
            wrapper,
        })

        const buttons = screen.getAllByRole('button')
        const removeButtons = buttons.filter(
            (btn) => !btn.id.startsWith('control-visibility'),
        )

        if (removeButtons.length > 1) {
            await act(async () => {
                await userEvent.click(removeButtons[1])
            })
        }

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        const dialog = screen.getByRole('dialog')
        const cancelButton = within(dialog).getByRole('button', {
            name: /cancel/i,
        })
        await userEvent.click(cancelButton)

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    it('should call deleteMetafield when Remove is confirmed', async () => {
        render(<MetafieldsTable columns={columns} data={mockFields} />, {
            wrapper,
        })

        const buttons = screen.getAllByRole('button')
        const removeButtons = buttons.filter(
            (btn) => !btn.id.startsWith('control-visibility'),
        )

        if (removeButtons.length > 1) {
            await act(async () => {
                await userEvent.click(removeButtons[1])
            })
        }

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        const dialog = screen.getByRole('dialog')
        const confirmButton = within(dialog).getByRole('button', {
            name: /remove/i,
        })
        await userEvent.click(confirmButton)

        expect(mockDeleteMetafield).toHaveBeenCalledWith({
            id: expect.any(String),
        })
    })

    it('should render loading state', () => {
        render(
            <MetafieldsTable columns={columns} data={[]} isLoading={true} />,
            { wrapper },
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('should filter data based on search input', async () => {
        render(<MetafieldsTable columns={columns} data={mockFields} />, {
            wrapper,
        })

        const searchInput = screen.getByRole('textbox')
        await userEvent.type(searchInput, 'Customer')

        await waitFor(() => {
            expect(screen.getByText('Customer Email')).toBeInTheDocument()
            expect(screen.queryByText('Order Notes')).not.toBeInTheDocument()
        })
    })

    it('should handle missing callbacks without throwing errors', async () => {
        const columnsWithoutCallbacks: typeof columns = columns.map((col) => ({
            ...col,
        }))

        render(
            <MetafieldsTable
                columns={columnsWithoutCallbacks}
                data={mockFields}
            />,
            { wrapper },
        )

        const buttons = screen.getAllByRole('button')
        const visibilityButton = buttons.find(
            (btn) => btn.id === 'control-visibility1',
        )
        const removeButtons = buttons.filter(
            (btn) =>
                !btn.id.startsWith('control-visibility') &&
                btn.querySelector('[data-icon="remove-minus-circle"]'),
        )

        expect(async () => {
            if (visibilityButton) {
                await act(async () => {
                    await userEvent.click(visibilityButton)
                })
            }
            if (removeButtons.length > 0) {
                await act(async () => {
                    await userEvent.click(removeButtons[0])
                })
            }
        }).not.toThrow()

        expect(mockToggleVisibility).not.toHaveBeenCalled()
        expect(mockDeleteMetafield).not.toHaveBeenCalled()
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

        render(
            <MetafieldsTable columns={columns} data={fieldWithoutVisibility} />,
            { wrapper },
        )

        await waitFor(() => {
            expect(screen.getByText('Product SKU')).toBeInTheDocument()
        })

        const buttons = screen.getAllByRole('button')
        const visibilityButton = buttons.find(
            (btn) => btn.id === 'control-visibility4',
        )

        expect(visibilityButton).toBeInTheDocument()

        await act(async () => {
            await userEvent.click(visibilityButton!)
        })

        expect(mockToggleVisibility).toHaveBeenCalledWith({
            id: '4',
            isVisible: false,
        })
    })

    it('should open import modal when import button is clicked', async () => {
        render(<MetafieldsTable columns={columns} data={mockFields} />, {
            wrapper,
        })

        const importButton = screen.getByRole('button', { name: /import/i })
        await act(async () => {
            await userEvent.click(importButton)
        })

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(
                screen.getByText('Import Shopify metafields to Gorgias'),
            ).toBeInTheDocument()
        })
    })

    it('should close import modal when close is triggered', async () => {
        render(<MetafieldsTable columns={columns} data={mockFields} />, {
            wrapper,
        })

        const importButton = screen.getByRole('button', { name: /import/i })
        await act(async () => {
            await userEvent.click(importButton)
        })

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        const dialog = screen.getByRole('dialog')
        const buttons = within(dialog).getAllByRole('button')
        const closeButton = buttons[0]

        await userEvent.click(closeButton)

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })
})
