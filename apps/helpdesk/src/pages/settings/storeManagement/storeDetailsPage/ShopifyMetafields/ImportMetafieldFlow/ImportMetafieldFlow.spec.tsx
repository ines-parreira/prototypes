import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'

import {
    mockListMetafieldDefinitionsHandler,
    mockMetafieldDefinition,
    mockUpdateMetafieldDefinitionHandler,
} from '@gorgias/helpdesk-mocks'
import type { MetafieldOwnerType } from '@gorgias/helpdesk-types'

import { mockStore } from 'utils/testing'

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

const INTEGRATION_ID = 123

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('ImportMetafieldFlow', () => {
    let queryClient: QueryClient

    const mockSelectCategory = jest.fn()
    const mockBackToCategories = jest.fn()
    const mockReset = jest.fn()
    const mockUpdateSelection = jest.fn()
    const mockGetSelectionForCategory = jest.fn()
    const mockGetSelectionCount = jest.fn()
    const mockClearSelectionForCategory = jest.fn()
    const mockClearAllSelections = jest.fn()
    const mockOnClose = jest.fn()
    const mockSuccess = jest.fn()
    const mockError = jest.fn()
    const mockImportMetafields = jest.fn()

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
        const store = mockStore({})
        return render(
            <MemoryRouter
                initialEntries={[`/integrations/${INTEGRATION_ID}/settings`]}
            >
                <Route path="/integrations/:id/settings">
                    <Provider store={store}>
                        <QueryClientProvider client={queryClient}>
                            <ImportMetafieldFlow {...props} />
                        </QueryClientProvider>
                    </Provider>
                </Route>
            </MemoryRouter>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()

        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })

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

        const mockUpdateHandler = mockUpdateMetafieldDefinitionHandler()
        const mockListHandler = mockListMetafieldDefinitionsHandler(async () =>
            HttpResponse.json({
                data: mockImportableFields.map((field) =>
                    mockMetafieldDefinition({
                        id: field.id,
                        name: field.name,
                        type: field.type,
                        ownerType: field.category as MetafieldOwnerType,
                        isVisible: field.isVisible,
                    }),
                ),
                meta: { next_cursor: null, prev_cursor: null },
                object: 'list',
                uri: `/api/integrations/${INTEGRATION_ID}/metafield-definitions`,
            }),
        )
        server.use(mockUpdateHandler.handler, mockListHandler.handler)
    })

    afterEach(() => {
        queryClient.clear()
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

        it('should call onClose when close button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent({ isOpen: true, onClose: mockOnClose })

            const closeIcon = screen.getByText('close')
            const closeButton = closeIcon.closest('button')!

            await act(() => user.click(closeButton))

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
                if (category === 'Order') return 3
                if (category === 'Customer') return 5
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
            mockGetSelectionCount.mockImplementation((category) =>
                category === 'Order' ? 2 : 0,
            )
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

            expect(mockSelectCategory).toHaveBeenCalledWith('Order')
        })
    })

    describe('Wizard navigation flow', () => {
        it('should render MetafieldsImportList when a category is selected', async () => {
            useImportWizard.mockReturnValue({
                ...defaultWizardState,
                step: 'list',
                selectedCategory: 'Customer',
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            await waitFor(() => {
                expect(screen.getByText('Customer')).toBeInTheDocument()
            })

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
                selectedCategory: 'Order',
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /back to category/i }),
                ).toBeInTheDocument()
            })

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: /back to category/i }),
                ),
            )

            expect(mockClearSelectionForCategory).toHaveBeenCalledWith('Order')
            expect(mockBackToCategories).toHaveBeenCalledTimes(1)
        })

        it('should call backToCategories when continue button is clicked', async () => {
            const user = userEvent.setup()
            const selectedFields = mockImportableFields.filter(
                (field) => field.category === 'Customer',
            )
            mockGetSelectionForCategory.mockReturnValue(selectedFields)

            useImportWizard.mockReturnValue({
                ...defaultWizardState,
                step: 'list',
                selectedCategory: 'Customer',
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /^continue$/i }),
                ).toBeInTheDocument()
            })

            await act(() =>
                user.click(screen.getByRole('button', { name: /^continue$/i })),
            )

            expect(mockBackToCategories).toHaveBeenCalledTimes(1)
        })

        it('should pass selected metafields to MetafieldsImportList', async () => {
            const selectedFields = mockImportableFields.filter(
                (field) => field.category === 'Customer',
            )
            mockGetSelectionForCategory.mockReturnValue(selectedFields)

            useImportWizard.mockReturnValue({
                ...defaultWizardState,
                step: 'list',
                selectedCategory: 'Customer',
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            await waitFor(() => {
                expect(mockGetSelectionForCategory).toHaveBeenCalledWith(
                    'Customer',
                )
            })

            await waitFor(() => {
                const checkboxes = screen.getAllByRole('checkbox')
                const dataCheckboxes = checkboxes.filter(
                    (cb) => cb.id !== 'checkbox-0',
                )
                dataCheckboxes.forEach((checkbox) => {
                    expect(checkbox).toBeChecked()
                })
            })
        })

        it('should call updateSelection when selection changes in MetafieldsImportList', async () => {
            const user = userEvent.setup()
            useImportWizard.mockReturnValue({
                ...defaultWizardState,
                step: 'list',
                selectedCategory: 'DraftOrder',
            })

            const draftOrderFields = mockImportableFields.filter(
                (f) => f.category === 'DraftOrder',
            )
            const mockListHandler = mockListMetafieldDefinitionsHandler(
                async () =>
                    HttpResponse.json({
                        data: draftOrderFields.map((field) =>
                            mockMetafieldDefinition({
                                id: field.id,
                                name: field.name,
                                type: field.type,
                                ownerType: field.category as MetafieldOwnerType,
                                isVisible: field.isVisible,
                            }),
                        ),
                        meta: { next_cursor: null, prev_cursor: null },
                        object: 'list',
                        uri: `/api/integrations/${INTEGRATION_ID}/metafield-definitions`,
                    }),
            )
            server.use(mockListHandler.handler)

            renderComponent({ isOpen: true, onClose: mockOnClose })

            await waitFor(() => {
                expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(
                    1,
                )
            })

            const checkboxes = screen.getAllByRole('checkbox')
            const enabledCheckboxes = checkboxes.filter(
                (cb) => !cb.hasAttribute('disabled'),
            )

            if (enabledCheckboxes.length > 1) {
                const dataCheckbox = enabledCheckboxes[1]
                await act(() => user.click(dataCheckbox))

                await waitFor(() => {
                    expect(mockUpdateSelection).toHaveBeenCalled()
                })

                expect(mockUpdateSelection.mock.calls[0][0]).toBe('DraftOrder')
            }
        })
    })

    describe('Field selection & import', () => {
        it('should trigger import mutation with selected fields when import button is clicked', async () => {
            const user = userEvent.setup()
            const selectedFields = [
                mockImportableFields[0],
                mockImportableFields[1],
            ]

            mockImportMetafields.mockResolvedValue({
                successful: selectedFields,
                failed: [],
            })

            mockGetSelectionCount.mockImplementation((category) => {
                if (category === 'Order') return 1
                if (category === 'Customer') return 1
                return 0
            })

            useFieldSelection.mockReturnValue({
                ...defaultFieldSelectionState,
                allSelectedFields: selectedFields,
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            await user.click(screen.getByRole('button', { name: /^import$/i }))

            expect(mockImportMetafields).toHaveBeenCalledWith({
                fields: selectedFields,
            })

            await waitFor(() => {
                expect(mockOnClose).toHaveBeenCalledTimes(1)
            })
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

        it.each([
            { value: [], label: 'empty array' },
            { value: null as any, label: 'null' },
            { value: undefined as any, label: 'undefined' },
        ])(
            'should not call import when allSelectedFields is $label',
            async ({ value }) => {
                const user = userEvent.setup()
                mockGetSelectionCount.mockReturnValue(1)

                useFieldSelection.mockReturnValue({
                    ...defaultFieldSelectionState,
                    allSelectedFields: value,
                })

                renderComponent({ isOpen: true, onClose: mockOnClose })

                const importButton = screen.getByRole('button', {
                    name: /^import$/i,
                })

                await user.click(importButton)

                expect(mockImportMetafields).not.toHaveBeenCalled()
            },
        )

        it('should dispatch success notification with count when import succeeds', async () => {
            const user = userEvent.setup()
            const selectedFields = [
                mockImportableFields[0],
                mockImportableFields[1],
                mockImportableFields[2],
            ]

            mockImportMetafields.mockResolvedValue({
                successful: selectedFields,
                failed: [],
            })

            mockGetSelectionCount.mockImplementation((category) => {
                if (category === 'Order') return 2
                if (category === 'Customer') return 1
                return 0
            })

            useFieldSelection.mockReturnValue({
                ...defaultFieldSelectionState,
                allSelectedFields: selectedFields,
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            await user.click(screen.getByRole('button', { name: /^import$/i }))

            await waitFor(() => {
                expect(mockSuccess).toHaveBeenCalledWith(
                    'Success! 3 metafields added',
                )
            })
            expect(mockError).not.toHaveBeenCalled()
        })

        it('should dispatch error notification when import fails', async () => {
            const user = userEvent.setup()
            const selectedFields = [mockImportableFields[0]]

            mockImportMetafields.mockResolvedValue({
                successful: [],
                failed: selectedFields,
            })

            mockGetSelectionCount.mockImplementation((category) => {
                if (category === 'Customer') return 1
                return 0
            })

            useFieldSelection.mockReturnValue({
                ...defaultFieldSelectionState,
                allSelectedFields: selectedFields,
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            await user.click(screen.getByRole('button', { name: /^import$/i }))

            await waitFor(() => {
                expect(mockError).toHaveBeenCalledWith(
                    'Failed to import metafields. Please try again.',
                )
            })
            expect(mockSuccess).not.toHaveBeenCalled()
        })

        it('should dispatch error notification when import mutation throws', async () => {
            const user = userEvent.setup()
            const selectedFields = [mockImportableFields[0]]

            mockImportMetafields.mockRejectedValue(new Error('Network error'))

            mockGetSelectionCount.mockImplementation((category) => {
                if (category === 'Customer') return 1
                return 0
            })

            useFieldSelection.mockReturnValue({
                ...defaultFieldSelectionState,
                allSelectedFields: selectedFields,
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            await user.click(screen.getByRole('button', { name: /^import$/i }))

            await waitFor(() => {
                expect(mockError).toHaveBeenCalledWith(
                    'There was an issue adding your Shopify metafields to Gorgias. Please try again.',
                )
            })
            expect(mockSuccess).not.toHaveBeenCalled()
            expect(mockOnClose).not.toHaveBeenCalled()
        })
    })

    describe('State integration', () => {
        it('should pass categoriesWithCount with correct selection counts', () => {
            mockGetSelectionCount.mockImplementation((category) => {
                const counts = {
                    Customer: 2,
                    Order: 5,
                    DraftOrder: 0,
                } as Record<string, number>
                return counts[category] || 0
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            expect(mockGetSelectionCount).toHaveBeenCalledWith('Customer')
            expect(mockGetSelectionCount).toHaveBeenCalledWith('Order')
            expect(mockGetSelectionCount).toHaveBeenCalledWith('DraftOrder')

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

        it('should render MetafieldsImportList when step is list and selectedCategory exists', async () => {
            useImportWizard.mockReturnValue({
                ...defaultWizardState,
                step: 'list',
                selectedCategory: 'Order',
            })

            renderComponent({ isOpen: true, onClose: mockOnClose })

            await waitFor(() => {
                expect(screen.getByText('Order')).toBeInTheDocument()
            })

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
