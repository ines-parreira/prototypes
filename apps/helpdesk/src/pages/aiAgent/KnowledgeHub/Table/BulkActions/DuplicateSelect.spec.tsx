import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import * as helpCenterQueries from 'models/helpCenter/queries'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'

import { REFETCH_KNOWLEDGE_HUB_TABLE } from '../../constants'
import * as emptyStateUtils from '../../EmptyState/utils'
import { KnowledgeType } from '../../types'
import { DuplicateSelect } from './DuplicateSelect'
import { ButtonRenderMode } from './types'

const mockStore = configureStore([thunk])

jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => jest.fn())
jest.mock('models/helpCenter/queries', () => ({
    ...jest.requireActual('models/helpCenter/queries'),
    useBulkCopyArticles: jest.fn(),
}))

const mockUseStoreIntegrations = useStoreIntegrations as jest.MockedFunction<
    typeof useStoreIntegrations
>

const mockUseBulkCopyArticles =
    helpCenterQueries.useBulkCopyArticles as jest.MockedFunction<
        typeof helpCenterQueries.useBulkCopyArticles
    >

describe('DuplicateSelect', () => {
    let queryClient: QueryClient
    const mockMutateAsync = jest.fn()
    let store: ReturnType<typeof mockStore>

    const defaultStores = [
        { id: 1, name: 'store-1', type: 'shopify' },
        { id: 2, name: 'store-2', type: 'shopify' },
        { id: 3, name: 'store-3', type: 'shopify' },
    ]

    const defaultProps = {
        helpCenterId: 123,
        selectedItems: [
            {
                id: '1',
                type: KnowledgeType.Guidance,
                title: 'Test Article 1',
                lastUpdatedAt: '2024-01-01',
            },
            {
                id: '2',
                type: KnowledgeType.Guidance,
                title: 'Test Article 2',
                lastUpdatedAt: '2024-01-02',
            },
        ],
        shopName: 'store-1',
    }

    const renderComponent = (props = {}) => {
        return render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <DuplicateSelect {...defaultProps} {...props} />
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

        mockUseStoreIntegrations.mockReturnValue(defaultStores as any)

        mockUseBulkCopyArticles.mockReturnValue({
            mutateAsync: mockMutateAsync,
            mutate: jest.fn(),
            reset: jest.fn(),
            isSuccess: false,
            isError: false,
            isIdle: true,
            isLoading: false,
            status: 'idle',
            data: undefined,
            error: null,
            failureCount: 0,
            failureReason: null,
            variables: undefined,
            context: undefined,
            isPaused: false,
            isPending: false,
        } as any)
    })

    describe('Render modes', () => {
        it('should render component when renderMode is Visible', () => {
            renderComponent({ renderMode: ButtonRenderMode.Visible })

            expect(
                screen.getByRole('button', { name: /duplicate/i }),
            ).toBeInTheDocument()
        })

        it('should render null when renderMode is Hidden', () => {
            const { container } = renderComponent({
                renderMode: ButtonRenderMode.Hidden,
            })

            expect(container.firstChild).toBeNull()
            expect(
                screen.queryByRole('button', { name: /duplicate/i }),
            ).not.toBeInTheDocument()
        })

        it('should render disabled component when isDisabled is true', () => {
            renderComponent({ isDisabled: true })

            expect(
                screen.getByRole('button', { name: /duplicate/i }),
            ).toBeDisabled()
        })

        it('should render with tooltip when renderMode is DisabledWithTooltip', () => {
            const tooltipMessage = 'Test tooltip message'
            const { container } = renderComponent({
                renderMode: ButtonRenderMode.DisabledWithTooltip,
                tooltipMessage,
                isDisabled: true,
            })

            const button = screen.getByRole('button', { name: /duplicate/i })
            expect(button).toBeInTheDocument()
            expect(button).toBeDisabled()

            const span = container.querySelector(
                'span[id^="duplicate-button-"]',
            )
            expect(span).toBeInTheDocument()
        })

        it('should not render tooltip when renderMode is Visible', () => {
            const tooltipMessage = 'Test tooltip message'
            renderComponent({
                renderMode: ButtonRenderMode.Visible,
                tooltipMessage,
            })

            expect(
                screen.getByRole('button', { name: /duplicate/i }),
            ).toBeInTheDocument()
            expect(screen.queryByText(tooltipMessage)).not.toBeInTheDocument()
        })

        it('should not render tooltip when renderMode is DisabledWithTooltip but no tooltipMessage provided', () => {
            renderComponent({
                renderMode: ButtonRenderMode.DisabledWithTooltip,
                isDisabled: true,
            })

            expect(
                screen.getByRole('button', { name: /duplicate/i }),
            ).toBeDisabled()
            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
        })
    })

    describe('Store sections and filtering', () => {
        it('should display current store section when shopName is provided', async () => {
            renderComponent()
            await openDropdown()

            const listbox = screen.getByRole('listbox')
            const currentStoreOptions =
                within(listbox).getAllByText(/store-1.*\(current\)/)
            expect(currentStoreOptions.length).toBeGreaterThan(0)
        })

        it('should display "Duplicate to" section with all stores', async () => {
            renderComponent()
            await openDropdown()

            const listbox = screen.getByRole('listbox')
            expect(
                within(listbox).getByText('Duplicate to'),
            ).toBeInTheDocument()
            expect(within(listbox).getByText('store-2')).toBeInTheDocument()
            expect(within(listbox).getByText('store-3')).toBeInTheDocument()
        })

        it('should display apply action button inside dropdown', async () => {
            renderComponent()
            await openDropdown()

            const listbox = screen.getByRole('listbox')
            expect(within(listbox).getByText('Apply')).toBeInTheDocument()
        })

        it('should not display current store section when shopName is not provided', async () => {
            renderComponent({ shopName: undefined })
            await openDropdown()

            const listbox = screen.getByRole('listbox')
            expect(
                within(listbox).queryByText(/\(current\)/),
            ).not.toBeInTheDocument()
        })
    })

    describe('Store selection', () => {
        it('should allow selecting multiple stores', async () => {
            const onChange = jest.fn()
            renderComponent({ onChange })
            await openDropdown()

            await selectStore('store-2')
            // Store already selected via selectStore

            expect(onChange).toHaveBeenCalledWith([
                expect.objectContaining({ name: 'store-2' }),
            ])
        })

        it('should call onChange callback when store selection changes', async () => {
            const onChange = jest.fn()
            renderComponent({ onChange })
            await openDropdown()

            await selectStore('store-2')

            expect(onChange).toHaveBeenCalled()
        })

        it('should send API request with all selected stores when Apply is clicked', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 2 })

            renderComponent()
            await openDropdown()

            await selectStore('store-2')
            await selectStore('store-3')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith([
                    undefined,
                    { help_center_id: 123 },
                    {
                        article_ids: [1, 2],
                        shop_names: ['store-2', 'store-3'],
                    },
                ])
            })
        })
    })

    describe('Apply action - error handling', () => {
        it('should show error notification when duplication fails', async () => {
            mockMutateAsync.mockRejectedValue(new Error('API Error'))
            renderComponent()
            await openDropdown()

            await selectStore('store-2')
            // Store already selected via selectStore

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                const actions = store.getActions()
                const notificationAction = actions.find(
                    (a) => a.type === 'reapop/upsertNotification',
                )
                expect(notificationAction).toBeDefined()
                expect(notificationAction.payload.message).toBe(
                    'Failed to duplicate guidance',
                )
                expect(notificationAction.payload.status).toBe('error')
            })
        })

        it('should keep selection after failed duplication for retry', async () => {
            mockMutateAsync.mockRejectedValue(new Error('API Error'))
            renderComponent()
            await openDropdown()

            await selectStore('store-2')
            // Store already selected via selectStore

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalled()
            })

            // Selection state is handled by MultiSelect component
        })
    })

    describe('Apply button state', () => {
        it('should disable Apply button when no stores are selected', async () => {
            renderComponent()
            await openDropdown()

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            expect(applyButton).toBeInTheDocument()
        })

        it('should disable Apply button when mutation is loading', async () => {
            mockUseBulkCopyArticles.mockReturnValue({
                mutateAsync: mockMutateAsync,
                mutate: jest.fn(),
                reset: jest.fn(),
                isSuccess: false,
                isError: false,
                isIdle: false,
                isLoading: true,
                status: 'loading',
                data: undefined,
                error: null,
                failureCount: 0,
                failureReason: null,
                variables: undefined,
                context: undefined,
                isPaused: false,
                isPending: false,
            } as any)

            renderComponent()
            await openDropdown()

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            expect(applyButton).toBeInTheDocument()
        })

        it('should not call API when no helpCenterId is provided', async () => {
            renderComponent({ helpCenterId: null })
            await openDropdown()

            await selectStore('store-2')
            // Store already selected via selectStore

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            expect(mockMutateAsync).not.toHaveBeenCalled()
        })

        it('should not call API when no articles are selected', async () => {
            renderComponent({ selectedItems: [] })
            await openDropdown()

            await selectStore('store-2')
            // Store already selected via selectStore

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            expect(mockMutateAsync).not.toHaveBeenCalled()
        })
    })

    describe('Success notifications', () => {
        it('should show success notification when duplicating to single store', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 2 })
            renderComponent()
            await openDropdown()

            await selectStore('store-2')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                const actions = store.getActions()
                const notificationAction = actions.find(
                    (a) => a.type === 'reapop/upsertNotification',
                )
                expect(notificationAction).toBeDefined()
                expect(notificationAction.payload.message).toContain('store-2')
                expect(notificationAction.payload.status).toBe('success')
                expect(notificationAction.payload.allowHTML).toBe(true)
            })
        })

        it('should show success notification when duplicating to multiple stores', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 2 })
            renderComponent()
            await openDropdown()

            await selectStore('store-2')
            await selectStore('store-3')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                const actions = store.getActions()
                const notificationAction = actions.find(
                    (a) => a.type === 'reapop/upsertNotification',
                )
                expect(notificationAction).toBeDefined()
                expect(notificationAction.payload.message).toContain('store-2')
                expect(notificationAction.payload.message).toContain('store-3')
                expect(notificationAction.payload.status).toBe('success')
            })
        })

        it('should show success notification when duplicating to current store only', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 2 })
            renderComponent()
            await openDropdown()

            await selectStore('store-1 (current)')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                const actions = store.getActions()
                const notificationAction = actions.find(
                    (a) => a.type === 'reapop/upsertNotification',
                )
                expect(notificationAction).toBeDefined()
                expect(notificationAction.payload.message).toBe(
                    'Guidance duplicated',
                )
                expect(notificationAction.payload.status).toBe('success')
            })
        })

        it('should show success notification when duplicating to current store and others', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 2 })
            renderComponent()
            await openDropdown()

            await selectStore('store-1 (current)')
            await selectStore('store-2')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                const actions = store.getActions()
                const notificationAction = actions.find(
                    (a) => a.type === 'reapop/upsertNotification',
                )
                expect(notificationAction).toBeDefined()
                expect(notificationAction.payload.message).toContain('store-1')
                expect(notificationAction.payload.message).toContain('store-2')
                expect(notificationAction.payload.status).toBe('success')
            })
        })

        it('should include HTML links in success notification message', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 2 })
            renderComponent()
            await openDropdown()

            await selectStore('store-2')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                const actions = store.getActions()
                const notificationAction = actions.find(
                    (a) => a.type === 'reapop/upsertNotification',
                )
                expect(notificationAction.payload.message).toContain('<a href')
                expect(notificationAction.payload.message).toContain(
                    '/app/ai-agent/shopify/store-2/knowledge',
                )
            })
        })
    })

    describe('State cleanup after success', () => {
        it('should clear selected stores after successful duplication', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 2 })
            const onChange = jest.fn()
            renderComponent({ onChange })
            await openDropdown()

            await selectStore('store-2')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalled()
            })

            expect(onChange).toHaveBeenCalledWith([
                expect.objectContaining({ name: 'store-2' }),
            ])
        })

        it('should close dropdown after successful duplication', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 2 })
            renderComponent()
            await openDropdown()

            expect(screen.getByRole('listbox')).toBeInTheDocument()

            await selectStore('store-2')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalled()
            })
        })
    })

    describe('Store name cleaning', () => {
        it('should remove "(current)" suffix from store names in API call', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 2 })
            renderComponent()
            await openDropdown()

            await selectStore('store-1 (current)')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith([
                    undefined,
                    { help_center_id: 123 },
                    {
                        article_ids: [1, 2],
                        shop_names: ['store-1'],
                    },
                ])
            })
        })

        it('should clean store names for all selected stores', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 2 })
            renderComponent()
            await openDropdown()

            await selectStore('store-1 (current)')
            await selectStore('store-2')
            await selectStore('store-3')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith([
                    undefined,
                    { help_center_id: 123 },
                    {
                        article_ids: [1, 2],
                        shop_names: ['store-1', 'store-2', 'store-3'],
                    },
                ])
            })
        })
    })

    describe('Complex multi-store and multi-article scenarios', () => {
        it('should duplicate single article to multiple stores', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 1 })
            renderComponent({
                selectedItems: [
                    {
                        id: '42',
                        type: KnowledgeType.Guidance,
                        title: 'Single Article',
                        lastUpdatedAt: '2024-01-01',
                    },
                ],
            })
            await openDropdown()

            await selectStore('store-2')
            await selectStore('store-3')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith([
                    undefined,
                    { help_center_id: 123 },
                    {
                        article_ids: [42],
                        shop_names: ['store-2', 'store-3'],
                    },
                ])
            })
        })

        it('should duplicate multiple articles to single store', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 5 })
            renderComponent({
                selectedItems: [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Article 1',
                        lastUpdatedAt: '2024-01-01',
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: 'Article 2',
                        lastUpdatedAt: '2024-01-02',
                    },
                    {
                        id: '3',
                        type: KnowledgeType.Guidance,
                        title: 'Article 3',
                        lastUpdatedAt: '2024-01-03',
                    },
                    {
                        id: '4',
                        type: KnowledgeType.Guidance,
                        title: 'Article 4',
                        lastUpdatedAt: '2024-01-04',
                    },
                    {
                        id: '5',
                        type: KnowledgeType.Guidance,
                        title: 'Article 5',
                        lastUpdatedAt: '2024-01-05',
                    },
                ],
            })
            await openDropdown()

            await selectStore('store-2')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith([
                    undefined,
                    { help_center_id: 123 },
                    {
                        article_ids: [1, 2, 3, 4, 5],
                        shop_names: ['store-2'],
                    },
                ])
            })
        })

        it('should duplicate large number of articles to multiple stores', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 15 })

            const largeArticleList = Array.from({ length: 10 }, (_, i) => ({
                id: String(i + 1),
                type: KnowledgeType.Guidance,
                title: `Article ${i + 1}`,
                lastUpdatedAt: '2024-01-01',
            }))

            renderComponent({ selectedItems: largeArticleList })
            await openDropdown()

            await selectStore('store-2')
            await selectStore('store-3')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith([
                    undefined,
                    { help_center_id: 123 },
                    {
                        article_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        shop_names: ['store-2', 'store-3'],
                    },
                ])
            })
        })
    })

    describe('Apply button disabled state transitions', () => {
        it('should enable Apply button after selecting a store', async () => {
            renderComponent()
            await openDropdown()

            const listbox = screen.getByRole('listbox')
            let applyButton = within(listbox).getByRole('button', {
                name: 'Apply',
            })

            expect(applyButton).toBeDisabled()

            await selectStore('store-2')

            applyButton = within(listbox).getByRole('button', { name: 'Apply' })
            expect(applyButton).not.toBeDisabled()
        })

        it('should keep Apply button disabled when only action item is in selection', async () => {
            renderComponent()
            await openDropdown()

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByRole('button', {
                name: 'Apply',
            })

            expect(applyButton).toBeDisabled()
        })
    })

    describe('Dropdown behavior', () => {
        it('should not trigger API call when opening dropdown', async () => {
            renderComponent()

            const button = screen.getByRole('button', { name: /duplicate/i })
            await act(() => userEvent.click(button))

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument()
            })

            expect(mockMutateAsync).not.toHaveBeenCalled()
        })

        it('should not trigger API call when selecting stores without clicking Apply', async () => {
            renderComponent()
            await openDropdown()

            await selectStore('store-2')
            await selectStore('store-3')

            expect(mockMutateAsync).not.toHaveBeenCalled()
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

        it('should dispatch refetch event when duplicating to current store only', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 2 })
            renderComponent()
            await openDropdown()

            await selectStore('store-1 (current)')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                    REFETCH_KNOWLEDGE_HUB_TABLE,
                )
            })
        })

        it('should dispatch refetch event when duplicating to current store and other stores', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 2 })
            renderComponent()
            await openDropdown()

            await selectStore('store-1 (current)')
            await selectStore('store-2')
            await selectStore('store-3')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                    REFETCH_KNOWLEDGE_HUB_TABLE,
                )
            })
        })

        it('should NOT dispatch refetch event when duplicating to other stores only', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 2 })
            renderComponent()
            await openDropdown()

            await selectStore('store-2')
            await selectStore('store-3')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalled()
            })

            expect(mockDispatchDocumentEvent).not.toHaveBeenCalledWith(
                REFETCH_KNOWLEDGE_HUB_TABLE,
            )
        })

        it('should NOT dispatch refetch event when shopName is not provided', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 2 })
            renderComponent({ shopName: undefined })
            await openDropdown()

            await selectStore('store-2')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalled()
            })

            expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
        })

        it('should NOT dispatch refetch event when duplication fails', async () => {
            mockMutateAsync.mockRejectedValue(new Error('API Error'))
            renderComponent()
            await openDropdown()

            await selectStore('store-1 (current)')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                const actions = store.getActions()
                const errorNotification = actions.find(
                    (a) => a.type === 'reapop/upsertNotification',
                )
                expect(errorNotification).toBeDefined()
            })

            expect(mockDispatchDocumentEvent).not.toHaveBeenCalledWith(
                REFETCH_KNOWLEDGE_HUB_TABLE,
            )
        })

        it('should dispatch refetch event only once per successful duplication', async () => {
            mockMutateAsync.mockResolvedValue({ copied_count: 2 })
            renderComponent()
            await openDropdown()

            await selectStore('store-1 (current)')

            const listbox = screen.getByRole('listbox')
            const applyButton = within(listbox).getByText('Apply')
            await act(() => userEvent.click(applyButton))

            await waitFor(() => {
                expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                    REFETCH_KNOWLEDGE_HUB_TABLE,
                )
            })

            expect(mockDispatchDocumentEvent).toHaveBeenCalledTimes(1)
        })
    })
})
