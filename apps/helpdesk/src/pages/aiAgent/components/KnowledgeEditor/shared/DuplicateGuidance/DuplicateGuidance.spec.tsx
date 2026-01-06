import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'

import { REFETCH_KNOWLEDGE_HUB_TABLE } from '../../../../KnowledgeHub/constants'
import * as emptyStateUtils from '../../../../KnowledgeHub/EmptyState/utils'
import { DuplicateGuidance } from './DuplicateGuidance'
import { ButtonRenderMode } from './types'

const mockStore = configureStore([thunk])

jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => jest.fn())

const mockUseStoreIntegrations = useStoreIntegrations as jest.MockedFunction<
    typeof useStoreIntegrations
>

describe('DuplicateGuidance', () => {
    let queryClient: QueryClient
    const mockOnDuplicate = jest.fn()
    let store: ReturnType<typeof mockStore>

    const defaultStores = [
        { id: 1, name: 'store-1', type: 'shopify' },
        { id: 2, name: 'store-2', type: 'shopify' },
        { id: 3, name: 'store-3', type: 'shopify' },
    ]

    const defaultProps = {
        articleIds: [1, 2],
        shopName: 'store-1',
        onDuplicate: mockOnDuplicate,
    }

    const renderComponent = (props = {}) => {
        return render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DuplicateGuidance {...defaultProps} {...props} />
                </QueryClientProvider>
            </Provider>,
        )
    }

    const openDropdown = async () => {
        const button = screen.getByRole('button', { name: /duplicate/i })
        await act(() => userEvent.click(button))
        await waitFor(
            () => {
                expect(screen.getByRole('listbox')).toBeInTheDocument()
            },
            { timeout: 2000 },
        )
    }

    const selectStore = async (storeName: string) => {
        const listbox = screen.getByRole('listbox')
        const options = within(listbox).getAllByRole('option')
        const storeOption = options.find((option) =>
            option.textContent?.includes(storeName),
        )
        if (!storeOption) {
            throw new Error(`Store ${storeName} not found`)
        }
        await act(() => userEvent.click(storeOption))
    }

    const clickApply = async () => {
        const applyButton = screen.getByRole('button', { name: /apply/i })
        if (!applyButton) {
            throw new Error('Apply button not found')
        }
        await act(() => userEvent.click(applyButton))
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })

        store = mockStore({
            currentAccount: fromJS({
                id: 1,
            }),
        })

        store.clearActions()
        jest.clearAllMocks()

        mockOnDuplicate.mockResolvedValue({ success: true })
        mockUseStoreIntegrations.mockReturnValue(defaultStores as any)
    })

    describe('Render modes', () => {
        it('should render component when renderMode is Visible', () => {
            renderComponent({ renderMode: ButtonRenderMode.Visible })

            expect(
                screen.getByRole('button', { name: /duplicate/i }),
            ).toBeInTheDocument()
        })

        it('should not render when renderMode is Hidden', () => {
            renderComponent({ renderMode: ButtonRenderMode.Hidden })

            expect(
                screen.queryByRole('button', { name: /duplicate/i }),
            ).not.toBeInTheDocument()
        })

        it('should render with tooltip when renderMode is DisabledWithTooltip', () => {
            renderComponent({
                renderMode: ButtonRenderMode.DisabledWithTooltip,
                tooltipMessage: 'Test tooltip',
            })

            expect(
                screen.getByRole('button', { name: /duplicate/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Store list', () => {
        it('should show all stores in dropdown', async () => {
            renderComponent()
            await openDropdown()

            const listbox = screen.getByRole('listbox')
            const options = within(listbox).getAllByRole('option')

            expect(options).toHaveLength(3) // 3 stores
            expect(options[0].textContent).toContain('store-1 (current)')
            expect(options[1].textContent).toContain('store-2')
            expect(options[2].textContent).toContain('store-3')

            // Apply button should be in footer, not in options
            expect(
                screen.getByRole('button', { name: /apply/i }),
            ).toBeInTheDocument()
        })

        it('should mark current store with (current) label', async () => {
            renderComponent({ shopName: 'store-2' })
            await openDropdown()

            const listbox = screen.getByRole('listbox')
            const options = within(listbox).getAllByRole('option')

            const store2Option = options.find((opt) =>
                opt.textContent?.includes('store-2'),
            )
            expect(store2Option?.textContent).toContain('(current)')
        })

        it('should put current store first in list', async () => {
            renderComponent({ shopName: 'store-3' })
            await openDropdown()

            const listbox = screen.getByRole('listbox')
            const options = within(listbox).getAllByRole('option')

            expect(options[0].textContent).toContain('store-3 (current)')
        })
    })

    describe('Store selection', () => {
        it('should allow selecting multiple stores', async () => {
            renderComponent()
            await openDropdown()

            await selectStore('store-2')
            await selectStore('store-3')

            const listbox = screen.getByRole('listbox')
            expect(listbox).toBeInTheDocument()
        })

        it('should disable Apply button when no stores selected', async () => {
            renderComponent()
            await openDropdown()

            const applyButton = screen.getByRole('button', { name: /apply/i })
            expect(applyButton).toBeDisabled()
        })

        it('should enable Apply button when stores are selected', async () => {
            renderComponent()
            await openDropdown()

            await selectStore('store-2')

            const applyButton = screen.getByRole('button', { name: /apply/i })
            expect(applyButton).not.toBeDisabled()
        })
    })

    describe('Apply action', () => {
        it('should call onDuplicate with selected stores', async () => {
            renderComponent()
            await openDropdown()

            await selectStore('store-2')
            await selectStore('store-3')
            await clickApply()

            await waitFor(() => {
                expect(mockOnDuplicate).toHaveBeenCalledWith(
                    [1, 2],
                    ['store-2', 'store-3'],
                )
            })
        })

        it('should clean store names by removing (current) suffix', async () => {
            renderComponent()
            await openDropdown()

            await selectStore('store-1 (current)')
            await clickApply()

            await waitFor(() => {
                expect(mockOnDuplicate).toHaveBeenCalledWith(
                    [1, 2],
                    ['store-1'],
                )
            })
        })

        it('should show success notification on successful duplication', async () => {
            renderComponent()
            await openDropdown()

            await selectStore('store-2')
            await clickApply()

            await waitFor(() => {
                const actions = store.getActions()
                expect(actions).toContainEqual(
                    expect.objectContaining({
                        type: 'reapop/upsertNotification',
                        payload: expect.objectContaining({
                            status: 'success',
                        }),
                    }),
                )
            })
        })

        it('should show error notification on failed duplication', async () => {
            mockOnDuplicate.mockRejectedValue(new Error('API Error'))
            renderComponent()
            await openDropdown()

            await selectStore('store-2')
            await clickApply()

            await waitFor(() => {
                const actions = store.getActions()
                expect(actions).toContainEqual(
                    expect.objectContaining({
                        type: 'reapop/upsertNotification',
                        payload: expect.objectContaining({
                            status: 'error',
                            message: 'Failed to duplicate guidance',
                        }),
                    }),
                )
            })
        })

        it('should clear selection after successful duplication', async () => {
            renderComponent()
            await openDropdown()

            await selectStore('store-2')
            await clickApply()

            await waitFor(() => {
                expect(mockOnDuplicate).toHaveBeenCalled()
            })

            // Reopen dropdown
            await openDropdown()

            // Apply button should be disabled again
            const applyButton = screen.getByRole('button', { name: /apply/i })
            expect(applyButton).toBeDisabled()
        })

        it('should fully reset MultiSelect state and enable Apply when selecting new stores after successful duplication', async () => {
            renderComponent()

            // First duplication - select store-2 and apply
            await openDropdown()
            await selectStore('store-2')
            await clickApply()

            await waitFor(() => {
                expect(mockOnDuplicate).toHaveBeenCalledWith(
                    [1, 2],
                    ['store-2'],
                )
            })

            // Clear the mock to track the next call
            mockOnDuplicate.mockClear()

            // Reopen dropdown after successful duplication
            await openDropdown()

            // Verify Apply button is disabled (no selection carried over)
            let applyButton = screen.getByRole('button', { name: /apply/i })
            expect(applyButton).toBeDisabled()

            // Select a different store (store-3)
            await selectStore('store-3')

            // Verify Apply button is now enabled
            applyButton = screen.getByRole('button', { name: /apply/i })
            expect(applyButton).not.toBeDisabled()

            // Apply the new selection
            await clickApply()

            // Verify only store-3 was sent (not store-2 from previous selection)
            await waitFor(() => {
                expect(mockOnDuplicate).toHaveBeenCalledWith(
                    [1, 2],
                    ['store-3'],
                )
            })
        })

        it('should reset MultiSelect state even when mutation fails (success: false)', async () => {
            mockOnDuplicate.mockResolvedValue({ success: false })
            renderComponent()

            // Select stores and apply
            await openDropdown()
            await selectStore('store-2')
            await clickApply()

            await waitFor(() => {
                expect(mockOnDuplicate).toHaveBeenCalled()
            })

            // Reopen dropdown - selection should be cleared even though mutation failed
            await openDropdown()

            // Apply button should be disabled (no stores selected)
            let applyButton = screen.getByRole('button', { name: /apply/i })
            expect(applyButton).toBeDisabled()

            // Select new stores
            await selectStore('store-3')

            // Apply button should now be enabled
            applyButton = screen.getByRole('button', { name: /apply/i })
            expect(applyButton).not.toBeDisabled()
        })

        it('should reset MultiSelect state even when exception is thrown', async () => {
            mockOnDuplicate.mockRejectedValue(new Error('Network error'))
            renderComponent()

            // Select stores and apply
            await openDropdown()
            await selectStore('store-2')
            await clickApply()

            // Wait for error notification
            await waitFor(() => {
                const actions = store.getActions()
                const errorNotifications = actions.filter(
                    (action: any) =>
                        action.type === 'reapop/upsertNotification' &&
                        action.payload?.status === 'error',
                )
                expect(errorNotifications.length).toBeGreaterThan(0)
            })

            // Reopen dropdown - selection should be cleared even though exception was thrown
            await openDropdown()

            // Apply button should be disabled (no stores selected)
            let applyButton = screen.getByRole('button', { name: /apply/i })
            expect(applyButton).toBeDisabled()

            // Select new stores
            await selectStore('store-3')

            // Apply button should now be enabled
            applyButton = screen.getByRole('button', { name: /apply/i })
            expect(applyButton).not.toBeDisabled()
        })

        it('should show error notification when success is false', async () => {
            mockOnDuplicate.mockResolvedValue({ success: false })
            renderComponent()
            await openDropdown()

            await selectStore('store-2')
            await clickApply()

            await waitFor(() => {
                expect(mockOnDuplicate).toHaveBeenCalled()
            })

            // Should show error notification but not success notification
            const actions = store.getActions()
            const errorNotifications = actions.filter(
                (action: any) =>
                    action.type === 'reapop/upsertNotification' &&
                    action.payload?.status === 'error',
            )
            const successNotifications = actions.filter(
                (action: any) =>
                    action.type === 'reapop/upsertNotification' &&
                    action.payload?.status === 'success',
            )

            expect(errorNotifications.length).toBeGreaterThan(0)
            expect(errorNotifications[0].payload?.message).toBe(
                'An error occurred while duplicating guidance',
            )
            expect(successNotifications).toHaveLength(0)
        })
    })

    describe('Table refetch event dispatching', () => {
        let mockDispatchDocumentEvent: jest.SpyInstance

        beforeEach(() => {
            mockDispatchDocumentEvent = jest.spyOn(
                emptyStateUtils,
                'dispatchDocumentEvent',
            )
        })

        afterEach(() => {
            mockDispatchDocumentEvent.mockRestore()
        })

        it('should dispatch refetch event when duplicating to current store', async () => {
            renderComponent({ shopName: 'store-1' })
            await openDropdown()

            await selectStore('store-1 (current)')
            await clickApply()

            await waitFor(() => {
                expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                    REFETCH_KNOWLEDGE_HUB_TABLE,
                )
            })
        })

        it('should not dispatch refetch event when duplicating to different store', async () => {
            renderComponent({ shopName: 'store-1' })
            await openDropdown()

            await selectStore('store-2')
            await clickApply()

            await waitFor(() => {
                expect(mockOnDuplicate).toHaveBeenCalled()
            })

            expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
        })

        it('should dispatch refetch event when duplicating to multiple stores including current', async () => {
            renderComponent({ shopName: 'store-1' })
            await openDropdown()

            await selectStore('store-1 (current)')
            await selectStore('store-2')
            await clickApply()

            await waitFor(() => {
                expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                    REFETCH_KNOWLEDGE_HUB_TABLE,
                )
            })
        })
    })

    describe('Disabled state', () => {
        it('should disable dropdown when isDisabled is true', () => {
            renderComponent({ isDisabled: true })

            const button = screen.getByRole('button', { name: /duplicate/i })
            expect(button).toBeDisabled()
        })
    })

    describe('Custom trigger', () => {
        it('should render custom trigger when provided', () => {
            const customTrigger = ({ ref }: any) => (
                <button ref={ref} data-testid="custom-trigger">
                    Custom Button
                </button>
            )

            renderComponent({ trigger: customTrigger })

            expect(screen.getByTestId('custom-trigger')).toBeInTheDocument()
            expect(screen.getByText('Custom Button')).toBeInTheDocument()
        })
    })
})
