import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Table } from '@gorgias/axiom'

import * as useBulkKnowledgeActionsModule from '../../hooks/useBulkKnowledgeActions'
import type { GroupedKnowledgeItem } from '../../types'
import { KnowledgeType } from '../../types'
import { BulkActions } from './BulkActions'

jest.mock('../../hooks/useBulkKnowledgeActions')

const mockUseBulkKnowledgeActions =
    useBulkKnowledgeActionsModule.useBulkKnowledgeActions as jest.MockedFunction<
        typeof useBulkKnowledgeActionsModule.useBulkKnowledgeActions
    >

describe('BulkActions', () => {
    const mockHandleBulkEnable = jest.fn()
    const mockHandleBulkDisable = jest.fn()
    const mockHandleBulkDelete = jest.fn()

    const helpCenterIds = {
        guidanceHelpCenterId: 1,
        faqHelpCenterId: 2,
        snippetHelpCenterId: 3,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseBulkKnowledgeActions.mockReturnValue({
            handleBulkEnable: mockHandleBulkEnable,
            handleBulkDisable: mockHandleBulkDisable,
            handleBulkDelete: mockHandleBulkDelete,
            isLoading: false,
        })
    })

    const createMockTable = (
        selectedItems: GroupedKnowledgeItem[],
        totalRows: GroupedKnowledgeItem[] = selectedItems,
    ): Table<GroupedKnowledgeItem> => {
        return {
            getFilteredSelectedRowModel: () => ({
                rows: selectedItems.map((original) => ({ original })),
            }),
            getRowModel: () => ({
                rows: totalRows.map((original) => ({ original })),
            }),
        } as Table<GroupedKnowledgeItem>
    }

    it('should render nothing when no items selected and search not active', () => {
        const table = createMockTable([])

        const { container } = render(
            <BulkActions
                table={table}
                helpCenterIds={helpCenterIds}
                isSearchActive={false}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render enable and disable buttons when items are selected', () => {
        const selectedItems: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.FAQ,
                title: 'Test',
                lastUpdatedAt: '2024-01-01',
            },
        ]
        const table = createMockTable(selectedItems)

        render(
            <BulkActions
                table={table}
                helpCenterIds={helpCenterIds}
                isSearchActive={false}
            />,
        )

        expect(
            screen.getByRole('button', { name: /enable for ai agent/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /disable for ai agent/i }),
        ).toBeInTheDocument()
    })

    it('should render delete button when non-domain items are selected', () => {
        const selectedItems: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.FAQ,
                title: 'Test',
                lastUpdatedAt: '2024-01-01',
            },
        ]
        const table = createMockTable(selectedItems)

        render(
            <BulkActions
                table={table}
                helpCenterIds={helpCenterIds}
                isSearchActive={false}
            />,
        )

        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(2)
        expect(buttons[2]).toBeInTheDocument()
    })

    it('should not render delete button when domain items are selected in individual view', () => {
        const selectedItems: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.Domain,
                title: 'Test Domain',
                lastUpdatedAt: '2024-01-01',
            },
        ]
        const table = createMockTable(selectedItems)

        render(
            <BulkActions
                table={table}
                helpCenterIds={helpCenterIds}
                isSearchActive={false}
                activeContentType={KnowledgeType.Domain}
            />,
        )

        const buttons = screen.queryAllByRole('button')
        expect(buttons.length).toBe(2)
    })

    it('should render duplicate button only when all items are guidance type', () => {
        const selectedItems: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.Guidance,
                title: 'Test',
                lastUpdatedAt: '2024-01-01',
            },
            {
                id: '2',
                type: KnowledgeType.Guidance,
                title: 'Test 2',
                lastUpdatedAt: '2024-01-02',
            },
        ]
        const table = createMockTable(selectedItems)

        render(
            <BulkActions
                table={table}
                helpCenterIds={helpCenterIds}
                isSearchActive={false}
            />,
        )

        expect(screen.getByText('Duplicate')).toBeInTheDocument()
    })

    it('should not render duplicate button when viewing individual FAQ type', () => {
        const selectedItems: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.FAQ,
                title: 'Test',
                lastUpdatedAt: '2024-01-01',
            },
            {
                id: '2',
                type: KnowledgeType.FAQ,
                title: 'Test 2',
                lastUpdatedAt: '2024-01-02',
            },
        ]
        const table = createMockTable(selectedItems)

        render(
            <BulkActions
                table={table}
                helpCenterIds={helpCenterIds}
                isSearchActive={false}
                activeContentType={KnowledgeType.FAQ}
            />,
        )

        expect(screen.queryByText('Duplicate')).not.toBeInTheDocument()
    })

    it('should render clear search button when search is active and there are rows', () => {
        const items: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.FAQ,
                title: 'Test',
                lastUpdatedAt: '2024-01-01',
            },
        ]
        const table = createMockTable([], items)
        const onClearSearch = jest.fn()

        render(
            <BulkActions
                table={table}
                helpCenterIds={helpCenterIds}
                isSearchActive={true}
                onClearSearch={onClearSearch}
            />,
        )

        expect(
            screen.getByRole('button', { name: /clear search/i }),
        ).toBeInTheDocument()
    })

    it('should call handleBulkEnable when enable button is clicked', async () => {
        const selectedItems: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.Guidance,
                title: 'Test',
                lastUpdatedAt: '2024-01-01',
            },
        ]
        const table = createMockTable(selectedItems)

        render(
            <BulkActions
                table={table}
                helpCenterIds={helpCenterIds}
                isSearchActive={false}
            />,
        )

        await act(async () => {
            await userEvent.click(
                screen.getByRole('button', { name: /enable for ai agent/i }),
            )
        })

        expect(mockHandleBulkEnable).toHaveBeenCalledWith(selectedItems)
    })

    it('should call handleBulkDisable when disable button is clicked', async () => {
        const selectedItems: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.Guidance,
                title: 'Test',
                lastUpdatedAt: '2024-01-01',
            },
        ]
        const table = createMockTable(selectedItems)

        render(
            <BulkActions
                table={table}
                helpCenterIds={helpCenterIds}
                isSearchActive={false}
            />,
        )

        await act(async () => {
            await userEvent.click(
                screen.getByRole('button', { name: /disable for ai agent/i }),
            )
        })

        expect(mockHandleBulkDisable).toHaveBeenCalledWith(selectedItems)
    })

    it('should open confirmation modal when delete button is clicked', async () => {
        const selectedItems: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.FAQ,
                title: 'Test',
                lastUpdatedAt: '2024-01-01',
            },
        ]
        const table = createMockTable(selectedItems)

        render(
            <BulkActions
                table={table}
                helpCenterIds={helpCenterIds}
                isSearchActive={false}
            />,
        )

        const deleteButton = screen.getByLabelText('trash-empty')

        await act(() => userEvent.click(deleteButton))

        expect(screen.getByText('Delete 1 item?')).toBeInTheDocument()
        expect(mockHandleBulkDelete).not.toHaveBeenCalled()
    })

    it('should call handleBulkDelete when modal is confirmed', async () => {
        const selectedItems: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.FAQ,
                title: 'Test',
                lastUpdatedAt: '2024-01-01',
            },
        ]
        const table = createMockTable(selectedItems)

        render(
            <BulkActions
                table={table}
                helpCenterIds={helpCenterIds}
                isSearchActive={false}
            />,
        )

        const deleteButton = screen.getByLabelText('trash-empty')

        await act(() => userEvent.click(deleteButton))

        const confirmButton = screen.getByRole('button', {
            name: /delete 1 item/i,
        })

        await act(() => userEvent.click(confirmButton))

        expect(mockHandleBulkDelete).toHaveBeenCalledWith(selectedItems)
    })

    it('should not call handleBulkDelete when modal is cancelled', async () => {
        const selectedItems: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.FAQ,
                title: 'Test',
                lastUpdatedAt: '2024-01-01',
            },
        ]
        const table = createMockTable(selectedItems)

        render(
            <BulkActions
                table={table}
                helpCenterIds={helpCenterIds}
                isSearchActive={false}
            />,
        )

        const deleteButton = screen.getByLabelText('trash-empty')

        await act(() => userEvent.click(deleteButton))

        const cancelButton = screen.getByRole('button', { name: /cancel/i })

        await act(() => userEvent.click(cancelButton))

        expect(mockHandleBulkDelete).not.toHaveBeenCalled()
    })

    it('should call onClearSearch when clear search button is clicked', async () => {
        const items: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.FAQ,
                title: 'Test',
                lastUpdatedAt: '2024-01-01',
            },
        ]
        const table = createMockTable([], items)
        const onClearSearch = jest.fn()

        render(
            <BulkActions
                table={table}
                helpCenterIds={helpCenterIds}
                isSearchActive={true}
                onClearSearch={onClearSearch}
            />,
        )

        await act(async () => {
            await userEvent.click(
                screen.getByRole('button', { name: /clear search/i }),
            )
        })

        expect(onClearSearch).toHaveBeenCalledTimes(1)
    })

    it('should disable buttons when isLoading is true', () => {
        mockUseBulkKnowledgeActions.mockReturnValue({
            handleBulkEnable: mockHandleBulkEnable,
            handleBulkDisable: mockHandleBulkDisable,
            handleBulkDelete: mockHandleBulkDelete,
            isLoading: true,
        })

        const selectedItems: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.FAQ,
                title: 'Test',
                lastUpdatedAt: '2024-01-01',
            },
        ]
        const table = createMockTable(selectedItems)

        render(
            <BulkActions
                table={table}
                helpCenterIds={helpCenterIds}
                isSearchActive={false}
            />,
        )

        const buttons = screen.getAllByRole('button')
        buttons.forEach((button) => {
            expect(button).toBeDisabled()
        })
    })

    describe('AI Agent button states', () => {
        it('should disable AI agent buttons with tooltip when only FAQ items are selected', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    id: '2',
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 2',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            const table = createMockTable(selectedItems)

            const { container } = render(
                <BulkActions
                    table={table}
                    helpCenterIds={helpCenterIds}
                    isSearchActive={false}
                />,
            )

            const enableButton = screen.getByRole('button', {
                name: /enable for ai agent/i,
            })
            const disableButton = screen.getByRole('button', {
                name: /disable for ai agent/i,
            })

            expect(enableButton).toBeDisabled()
            expect(disableButton).toBeDisabled()

            const enableTooltipSpan = container.querySelector(
                'span[id^="enable-ai-button-"]',
            )
            const disableTooltipSpan = container.querySelector(
                'span[id^="disable-ai-button-"]',
            )
            expect(enableTooltipSpan).toBeInTheDocument()
            expect(disableTooltipSpan).toBeInTheDocument()
        })

        it('should disable AI agent buttons with tooltip when FAQ and Guidance items are selected', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Guidance 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            const table = createMockTable(selectedItems)

            const { container } = render(
                <BulkActions
                    table={table}
                    helpCenterIds={helpCenterIds}
                    isSearchActive={false}
                />,
            )

            const enableButton = screen.getByRole('button', {
                name: /enable for ai agent/i,
            })
            const disableButton = screen.getByRole('button', {
                name: /disable for ai agent/i,
            })

            expect(enableButton).toBeDisabled()
            expect(disableButton).toBeDisabled()

            const enableTooltipSpan = container.querySelector(
                'span[id^="enable-ai-button-"]',
            )
            const disableTooltipSpan = container.querySelector(
                'span[id^="disable-ai-button-"]',
            )
            expect(enableTooltipSpan).toBeInTheDocument()
            expect(disableTooltipSpan).toBeInTheDocument()
        })

        it('should disable AI agent buttons with tooltip when FAQ and Document items are selected', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    id: '2',
                    type: KnowledgeType.Document,
                    title: 'Doc 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            const table = createMockTable(selectedItems)

            const { container } = render(
                <BulkActions
                    table={table}
                    helpCenterIds={helpCenterIds}
                    isSearchActive={false}
                />,
            )

            const enableButton = screen.getByRole('button', {
                name: /enable for ai agent/i,
            })
            const disableButton = screen.getByRole('button', {
                name: /disable for ai agent/i,
            })

            expect(enableButton).toBeDisabled()
            expect(disableButton).toBeDisabled()

            const enableTooltipSpan = container.querySelector(
                'span[id^="enable-ai-button-"]',
            )
            const disableTooltipSpan = container.querySelector(
                'span[id^="disable-ai-button-"]',
            )
            expect(enableTooltipSpan).toBeInTheDocument()
            expect(disableTooltipSpan).toBeInTheDocument()
        })

        it('should enable AI agent buttons when only Guidance items are selected', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Guidance 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            const table = createMockTable(selectedItems)

            render(
                <BulkActions
                    table={table}
                    helpCenterIds={helpCenterIds}
                    isSearchActive={false}
                />,
            )

            const enableButton = screen.getByRole('button', {
                name: /enable for ai agent/i,
            })
            const disableButton = screen.getByRole('button', {
                name: /disable for ai agent/i,
            })

            expect(enableButton).not.toBeDisabled()
            expect(disableButton).not.toBeDisabled()
            expect(
                screen.queryByText(
                    'This action is not supported at the moment',
                ),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(
                    'De-select Help Center articles to perform this action',
                ),
            ).not.toBeInTheDocument()
        })

        it('should enable AI agent buttons when only Document items are selected', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Document,
                    title: 'Doc 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            const table = createMockTable(selectedItems)

            render(
                <BulkActions
                    table={table}
                    helpCenterIds={helpCenterIds}
                    isSearchActive={false}
                />,
            )

            const enableButton = screen.getByRole('button', {
                name: /enable for ai agent/i,
            })
            const disableButton = screen.getByRole('button', {
                name: /disable for ai agent/i,
            })

            expect(enableButton).not.toBeDisabled()
            expect(disableButton).not.toBeDisabled()
        })

        it('should enable AI agent buttons when mixed Guidance and Document items are selected', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Guidance 1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    id: '2',
                    type: KnowledgeType.Document,
                    title: 'Doc 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            const table = createMockTable(selectedItems)

            render(
                <BulkActions
                    table={table}
                    helpCenterIds={helpCenterIds}
                    isSearchActive={false}
                />,
            )

            const enableButton = screen.getByRole('button', {
                name: /enable for ai agent/i,
            })
            const disableButton = screen.getByRole('button', {
                name: /disable for ai agent/i,
            })

            expect(enableButton).not.toBeDisabled()
            expect(disableButton).not.toBeDisabled()
        })

        it('should enable AI agent buttons when only Domain items are selected', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Domain,
                    title: 'Domain 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            const table = createMockTable(selectedItems)

            render(
                <BulkActions
                    table={table}
                    helpCenterIds={helpCenterIds}
                    isSearchActive={false}
                />,
            )

            const enableButton = screen.getByRole('button', {
                name: /enable for ai agent/i,
            })
            const disableButton = screen.getByRole('button', {
                name: /disable for ai agent/i,
            })

            expect(enableButton).not.toBeDisabled()
            expect(disableButton).not.toBeDisabled()
        })

        it('should enable AI agent buttons when only URL items are selected', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.URL,
                    title: 'URL 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            const table = createMockTable(selectedItems)

            render(
                <BulkActions
                    table={table}
                    helpCenterIds={helpCenterIds}
                    isSearchActive={false}
                />,
            )

            const enableButton = screen.getByRole('button', {
                name: /enable for ai agent/i,
            })
            const disableButton = screen.getByRole('button', {
                name: /disable for ai agent/i,
            })

            expect(enableButton).not.toBeDisabled()
            expect(disableButton).not.toBeDisabled()
        })
    })
})
