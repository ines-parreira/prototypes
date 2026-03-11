import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { TableV1Instance } from '@gorgias/axiom'

import { useGuidanceArticleMutation } from '../../../hooks/useGuidanceArticleMutation'
import * as useBulkKnowledgeActionsModule from '../../hooks/useBulkKnowledgeActions'
import type { GroupedKnowledgeItem } from '../../types'
import { KnowledgeType, KnowledgeVisibility } from '../../types'
import { BulkActions } from './BulkActions'

jest.mock('../../hooks/useBulkKnowledgeActions')
jest.mock('../../../hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(),
}))
jest.mock(
    '../../../components/KnowledgeEditor/shared/DuplicateGuidance/DuplicateGuidance',
    () => {
        const { ButtonRenderMode } = jest.requireActual('./types')
        return {
            DuplicateGuidance: ({
                shopName,
                articleIds,
                renderMode,
                onDuplicate,
                isDisabled,
            }: {
                shopName?: string
                articleIds?: number[]
                renderMode?: any
                onDuplicate?: (
                    articleIds: number[],
                    shopNames: string[],
                ) => Promise<{ success: boolean; shopNames?: string[] }>
                isDisabled?: boolean
            }) => {
                if (renderMode === ButtonRenderMode.Hidden) {
                    return null
                }
                return (
                    <div data-testid="duplicate-select">
                        <span data-testid="shop-name">
                            {shopName || 'no-shop'}
                        </span>
                        <span data-testid="selected-count">
                            {articleIds?.length || 0}
                        </span>
                        <button
                            data-testid="trigger-duplicate"
                            disabled={isDisabled}
                            onClick={() =>
                                onDuplicate?.(articleIds || [], ['test-shop'])
                            }
                        >
                            Duplicate
                        </button>
                    </div>
                )
            },
        }
    },
)

const mockUseBulkKnowledgeActions =
    useBulkKnowledgeActionsModule.useBulkKnowledgeActions as jest.MockedFunction<
        typeof useBulkKnowledgeActionsModule.useBulkKnowledgeActions
    >

const mockUseGuidanceArticleMutation = jest.mocked(useGuidanceArticleMutation)

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
        mockUseGuidanceArticleMutation.mockReturnValue({
            duplicate: jest.fn(),
            isGuidanceArticleUpdating: false,
            deleteGuidanceArticle: jest.fn(),
            isGuidanceArticleDeleting: false,
            createGuidanceArticle: jest.fn(),
            updateGuidanceArticle: jest.fn(),
            duplicateGuidanceArticle: jest.fn(),
            discardGuidanceDraft: jest.fn(),
            isDiscardingDraft: false,
        } as any)
    })

    const createMockTable = (
        selectedItems: GroupedKnowledgeItem[],
        totalRows: GroupedKnowledgeItem[] = selectedItems,
    ): TableV1Instance<GroupedKnowledgeItem> => {
        return {
            getFilteredSelectedRowModel: () => ({
                rows: selectedItems.map((original) => ({ original })),
            }),
            getRowModel: () => ({
                rows: totalRows.map((original) => ({ original })),
            }),
            getCoreRowModel: () => ({
                rows: totalRows.map((original) => ({ original })),
            }),
        } as TableV1Instance<GroupedKnowledgeItem>
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

        expect(screen.getByTestId('duplicate-select')).toBeInTheDocument()
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

        expect(screen.queryByTestId('duplicate-select')).not.toBeInTheDocument()
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
                draftVersionId: 1,
                publishedVersionId: 1,
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
                draftVersionId: 1,
                publishedVersionId: 1,
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
        it('should enable AI agent buttons when only published FAQ items are selected', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: 1,
                },
                {
                    id: '2',
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 2',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: 1,
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

        it('should enable AI agent buttons when published FAQ and published Guidance items are selected', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: 1,
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Guidance 1',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: 1,
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

        it('should enable AI agent buttons when published FAQ and Document items are selected', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: 1,
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

        it('should disable AI agent buttons when draft FAQ items are selected', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.FAQ,
                    title: 'Draft FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: null,
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

            expect(enableButton).toBeDisabled()
            expect(disableButton).toBeDisabled()
        })

        it('should enable AI agent buttons when only Guidance items are selected', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Guidance 1',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: 1,
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
                    draftVersionId: 1,
                    publishedVersionId: 1,
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

        describe('Draft guidance validation', () => {
            it('should disable Enable button when only draft guidance is selected', () => {
                const selectedItems: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Draft Guidance 1',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 2,
                        publishedVersionId: 1,
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

                expect(enableButton).toBeDisabled()
            })

            it('should disable Disable button when only draft guidance is selected', () => {
                const selectedItems: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Draft Guidance 1',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 2,
                        publishedVersionId: 1,
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

                const disableButton = screen.getByRole('button', {
                    name: /disable for ai agent/i,
                })

                expect(disableButton).toBeDisabled()
            })

            it('should disable Enable button with tooltip when draft guidance is selected', () => {
                const selectedItems: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Draft Guidance 1',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 2,
                        publishedVersionId: 1,
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

                expect(enableButton).toBeDisabled()
            })

            it('should disable buttons when guidance has never been published', () => {
                const selectedItems: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'New Draft Guidance',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 1,
                        publishedVersionId: null,
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

                expect(enableButton).toBeDisabled()
                expect(disableButton).toBeDisabled()
            })

            it('should enable buttons when guidance is fully published with no draft changes', () => {
                const selectedItems: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Published Guidance',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 1,
                        publishedVersionId: 1,
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

            it('should disable buttons when mix of draft and published guidance is selected', () => {
                const selectedItems: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Draft Guidance',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 2,
                        publishedVersionId: 1,
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: 'Published Guidance',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 1,
                        publishedVersionId: 1,
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

                expect(enableButton).toBeDisabled()
                expect(disableButton).toBeDisabled()
            })

            it('should disable buttons with tooltip when draft guidance and draft FAQ are selected', () => {
                const selectedItems: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Draft Guidance',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 2,
                        publishedVersionId: 1,
                    },
                    {
                        id: '2',
                        type: KnowledgeType.FAQ,
                        title: 'Draft FAQ Article',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 1,
                        publishedVersionId: null,
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

                expect(enableButton).toBeDisabled()
                expect(disableButton).toBeDisabled()
            })

            it('should prioritize draft validation over limit validation', () => {
                const existingGuidanceArticles: GroupedKnowledgeItem[] =
                    Array.from({ length: 100 }, (_, i) => ({
                        id: `existing-${i}`,
                        type: KnowledgeType.Guidance,
                        title: `Existing Guidance ${i}`,
                        lastUpdatedAt: '2024-01-01',
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                        draftVersionId: 1,
                        publishedVersionId: 1,
                    }))

                const selectedItems: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Draft Guidance',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 2,
                        publishedVersionId: 1,
                    },
                    {
                        id: '2',
                        type: KnowledgeType.FAQ,
                        title: 'Draft FAQ Item',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 1,
                        publishedVersionId: null,
                    },
                ]

                const table = createMockTable(selectedItems, [
                    ...existingGuidanceArticles,
                    ...selectedItems,
                ])

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

                expect(enableButton).toBeDisabled()
            })
        })

        describe('Guidance limit validation', () => {
            it('should disable enable button when bulk enable would exceed limit of 100', () => {
                // 100 active guidance articles already in the system
                const existingGuidanceArticles: GroupedKnowledgeItem[] =
                    Array.from({ length: 100 }, (_, i) => ({
                        id: `existing-${i}`,
                        type: KnowledgeType.Guidance,
                        title: `Existing Guidance ${i}`,
                        lastUpdatedAt: '2024-01-01',
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                        draftVersionId: 1,
                        publishedVersionId: 1,
                    }))

                // User selects 1 UNLISTED guidance to enable
                const selectedItems: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'New Guidance',
                        lastUpdatedAt: '2024-01-01',
                        inUseByAI: KnowledgeVisibility.UNLISTED,
                        draftVersionId: 1,
                        publishedVersionId: 1,
                    },
                ]

                const table = createMockTable(selectedItems, [
                    ...existingGuidanceArticles,
                    ...selectedItems,
                ])

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

                // Enable button should be disabled due to limit
                expect(enableButton).toBeDisabled()
                // Disable button should still be enabled
                expect(disableButton).not.toBeDisabled()
            })

            it('should allow enable when under limit', () => {
                // 95 active guidance articles
                const existingGuidanceArticles: GroupedKnowledgeItem[] =
                    Array.from({ length: 95 }, (_, i) => ({
                        id: `existing-${i}`,
                        type: KnowledgeType.Guidance,
                        title: `Existing Guidance ${i}`,
                        lastUpdatedAt: '2024-01-01',
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                        draftVersionId: 1,
                        publishedVersionId: 1,
                    }))

                // Selecting 2 UNLISTED guidances (95 + 2 = 97, under limit)
                const selectedItems: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'New Guidance 1',
                        lastUpdatedAt: '2024-01-01',
                        inUseByAI: KnowledgeVisibility.UNLISTED,
                        draftVersionId: 1,
                        publishedVersionId: 1,
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: 'New Guidance 2',
                        lastUpdatedAt: '2024-01-01',
                        inUseByAI: KnowledgeVisibility.UNLISTED,
                        draftVersionId: 1,
                        publishedVersionId: 1,
                    },
                ]

                const table = createMockTable(selectedItems, [
                    ...existingGuidanceArticles,
                    ...selectedItems,
                ])

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

                expect(enableButton).not.toBeDisabled()
            })

            it('should allow enable when exactly at limit after enabling', () => {
                // 99 active guidance articles
                const existingGuidanceArticles: GroupedKnowledgeItem[] =
                    Array.from({ length: 99 }, (_, i) => ({
                        id: `existing-${i}`,
                        type: KnowledgeType.Guidance,
                        title: `Existing Guidance ${i}`,
                        lastUpdatedAt: '2024-01-01',
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                        draftVersionId: 1,
                        publishedVersionId: 1,
                    }))

                // Selecting 1 UNLISTED guidance (99 + 1 = 100, at limit)
                const selectedItems: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'New Guidance',
                        lastUpdatedAt: '2024-01-01',
                        inUseByAI: KnowledgeVisibility.UNLISTED,
                        draftVersionId: 1,
                        publishedVersionId: 1,
                    },
                ]

                const table = createMockTable(selectedItems, [
                    ...existingGuidanceArticles,
                    ...selectedItems,
                ])

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

                expect(enableButton).not.toBeDisabled()
            })

            it('should only count UNLISTED guidance items for limit check', () => {
                // 98 active guidance articles + 1 UNLISTED + 1 PUBLIC = 99 total, 98 active
                const existingPublicGuidance: GroupedKnowledgeItem[] =
                    Array.from({ length: 98 }, (_, i) => ({
                        id: `existing-${i}`,
                        type: KnowledgeType.Guidance,
                        title: `Existing Guidance ${i}`,
                        lastUpdatedAt: '2024-01-01',
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                        draftVersionId: 1,
                        publishedVersionId: 1,
                    }))

                const unlistedGuidance: GroupedKnowledgeItem = {
                    id: 'unlisted-1',
                    type: KnowledgeType.Guidance,
                    title: 'Unlisted Guidance',
                    lastUpdatedAt: '2024-01-01',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    draftVersionId: 1,
                    publishedVersionId: 1,
                }

                const alreadyPublicGuidance: GroupedKnowledgeItem = {
                    id: 'public-1',
                    type: KnowledgeType.Guidance,
                    title: 'Already Public Guidance',
                    lastUpdatedAt: '2024-01-01',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    draftVersionId: 1,
                    publishedVersionId: 1,
                }

                // Selecting 1 UNLISTED and 1 already PUBLIC guidance
                const selectedItems: GroupedKnowledgeItem[] = [
                    unlistedGuidance,
                    alreadyPublicGuidance,
                ]

                // Total items in table: 98 existing PUBLIC + 1 UNLISTED + 1 PUBLIC = 100 items, 99 PUBLIC
                const table = createMockTable(selectedItems, [
                    ...existingPublicGuidance,
                    unlistedGuidance,
                    alreadyPublicGuidance,
                ])

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

                // Only 1 UNLISTED item to enable (99 currently PUBLIC + 1 = 100, should be allowed)
                expect(enableButton).not.toBeDisabled()
            })

            it('should prioritize FAQ validation over guidance limit validation', () => {
                // 100 active guidance articles
                const existingGuidanceArticles: GroupedKnowledgeItem[] =
                    Array.from({ length: 100 }, (_, i) => ({
                        id: `existing-${i}`,
                        type: KnowledgeType.Guidance,
                        title: `Existing Guidance ${i}`,
                        lastUpdatedAt: '2024-01-01',
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                        draftVersionId: 1,
                        publishedVersionId: 1,
                    }))

                // Selecting FAQ and UNLISTED guidance
                const selectedItems: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.FAQ,
                        title: 'FAQ Item',
                        lastUpdatedAt: '2024-01-01',
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: 'New Guidance',
                        lastUpdatedAt: '2024-01-01',
                        inUseByAI: KnowledgeVisibility.UNLISTED,
                        draftVersionId: 1,
                        publishedVersionId: 1,
                    },
                ]

                const table = createMockTable(selectedItems, [
                    ...existingGuidanceArticles,
                    ...selectedItems,
                ])

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

                expect(enableButton).toBeDisabled()
            })
        })
    })

    describe('DuplicateGuidance integration', () => {
        it('should pass shopName to DuplicateGuidance when provided', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Test Guidance',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            const table = createMockTable(selectedItems)

            render(
                <BulkActions
                    table={table}
                    helpCenterIds={helpCenterIds}
                    isSearchActive={false}
                    shopName="test-shop"
                />,
            )

            expect(screen.getByTestId('shop-name')).toHaveTextContent(
                'test-shop',
            )
        })

        it('should pass article IDs to DuplicateGuidance', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Test Guidance 1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Test Guidance 2',
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

            expect(screen.getByTestId('selected-count')).toHaveTextContent('2')
        })

        it('should render default values when shopName is not provided', () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Test Guidance',
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

            expect(screen.getByTestId('shop-name')).toHaveTextContent('no-shop')
        })
    })

    describe('handleBulkDuplicate', () => {
        it('should return success: false when guidanceHelpCenterId is null', async () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Test Guidance',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            const table = createMockTable(selectedItems)
            const mockDuplicate = jest.fn()

            mockUseGuidanceArticleMutation.mockReturnValue({
                duplicate: mockDuplicate,
                isGuidanceArticleUpdating: false,
                deleteGuidanceArticle: jest.fn(),
                isGuidanceArticleDeleting: false,
                createGuidanceArticle: jest.fn(),
                updateGuidanceArticle: jest.fn(),
                duplicateGuidanceArticle: jest.fn(),
                discardGuidanceDraft: jest.fn(),
                isDiscardingDraft: false,
            } as any)

            const { container } = render(
                <BulkActions
                    table={table}
                    helpCenterIds={{
                        guidanceHelpCenterId: null,
                        faqHelpCenterId: 2,
                        snippetHelpCenterId: 3,
                    }}
                    isSearchActive={false}
                />,
            )

            const duplicateComponent = container.querySelector(
                '[data-testid="duplicate-select"]',
            )
            expect(duplicateComponent).toBeInTheDocument()

            expect(mockDuplicate).not.toHaveBeenCalled()
        })

        it('should return success: false when guidanceHelpCenterId is undefined', async () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Test Guidance',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            const table = createMockTable(selectedItems)
            const mockDuplicate = jest.fn()

            mockUseGuidanceArticleMutation.mockReturnValue({
                duplicate: mockDuplicate,
                isGuidanceArticleUpdating: false,
                deleteGuidanceArticle: jest.fn(),
                isGuidanceArticleDeleting: false,
                createGuidanceArticle: jest.fn(),
                updateGuidanceArticle: jest.fn(),
                duplicateGuidanceArticle: jest.fn(),
                discardGuidanceDraft: jest.fn(),
                isDiscardingDraft: false,
            } as any)

            const { container } = render(
                <BulkActions
                    table={table}
                    helpCenterIds={{
                        guidanceHelpCenterId: undefined,
                        faqHelpCenterId: 2,
                        snippetHelpCenterId: 3,
                    }}
                    isSearchActive={false}
                />,
            )

            const duplicateComponent = container.querySelector(
                '[data-testid="duplicate-select"]',
            )
            expect(duplicateComponent).toBeInTheDocument()

            expect(mockDuplicate).not.toHaveBeenCalled()
        })

        it('should successfully duplicate articles with correct parameters', async () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Test Guidance 1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    id: '2',
                    type: KnowledgeType.Guidance,
                    title: 'Test Guidance 2',
                    lastUpdatedAt: '2024-01-02',
                },
            ]
            const table = createMockTable(selectedItems)
            const mockDuplicate = jest.fn().mockResolvedValue(undefined)

            mockUseGuidanceArticleMutation.mockReturnValue({
                duplicate: mockDuplicate,
                isGuidanceArticleUpdating: false,
                deleteGuidanceArticle: jest.fn(),
                isGuidanceArticleDeleting: false,
                createGuidanceArticle: jest.fn(),
                updateGuidanceArticle: jest.fn(),
                duplicateGuidanceArticle: jest.fn(),
                discardGuidanceDraft: jest.fn(),
                isDiscardingDraft: false,
            } as any)

            render(
                <BulkActions
                    table={table}
                    helpCenterIds={helpCenterIds}
                    isSearchActive={false}
                />,
            )

            const duplicateButton = screen.getByTestId('trigger-duplicate')

            await act(() => userEvent.click(duplicateButton))

            expect(mockDuplicate).toHaveBeenCalledWith([1, 2], ['test-shop'])
        })

        it('should handle errors during duplication and return success: false', async () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Test Guidance',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            const table = createMockTable(selectedItems)
            const mockDuplicate = jest
                .fn()
                .mockRejectedValue(new Error('API Error'))

            mockUseGuidanceArticleMutation.mockReturnValue({
                duplicate: mockDuplicate,
                isGuidanceArticleUpdating: false,
                deleteGuidanceArticle: jest.fn(),
                isGuidanceArticleDeleting: false,
                createGuidanceArticle: jest.fn(),
                updateGuidanceArticle: jest.fn(),
                duplicateGuidanceArticle: jest.fn(),
                discardGuidanceDraft: jest.fn(),
                isDiscardingDraft: false,
            } as any)

            render(
                <BulkActions
                    table={table}
                    helpCenterIds={helpCenterIds}
                    isSearchActive={false}
                />,
            )

            const duplicateButton = screen.getByTestId('trigger-duplicate')

            await act(() => userEvent.click(duplicateButton))

            expect(mockDuplicate).toHaveBeenCalled()
        })

        it('should pass correct article IDs and shop names to duplicate function', async () => {
            const selectedItems: GroupedKnowledgeItem[] = [
                {
                    id: '10',
                    type: KnowledgeType.Guidance,
                    title: 'Test Guidance 1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    id: '20',
                    type: KnowledgeType.Guidance,
                    title: 'Test Guidance 2',
                    lastUpdatedAt: '2024-01-02',
                },
                {
                    id: '30',
                    type: KnowledgeType.Guidance,
                    title: 'Test Guidance 3',
                    lastUpdatedAt: '2024-01-03',
                },
            ]
            const table = createMockTable(selectedItems)
            const mockDuplicate = jest.fn().mockResolvedValue(undefined)

            mockUseGuidanceArticleMutation.mockReturnValue({
                duplicate: mockDuplicate,
                isGuidanceArticleUpdating: false,
                deleteGuidanceArticle: jest.fn(),
                isGuidanceArticleDeleting: false,
                createGuidanceArticle: jest.fn(),
                updateGuidanceArticle: jest.fn(),
                duplicateGuidanceArticle: jest.fn(),
                discardGuidanceDraft: jest.fn(),
                isDiscardingDraft: false,
            } as any)

            render(
                <BulkActions
                    table={table}
                    helpCenterIds={helpCenterIds}
                    isSearchActive={false}
                />,
            )

            const duplicateButton = screen.getByTestId('trigger-duplicate')

            await act(() => userEvent.click(duplicateButton))

            expect(mockDuplicate).toHaveBeenCalledWith(
                [10, 20, 30],
                ['test-shop'],
            )
        })
    })
})
