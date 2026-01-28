import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import * as helpCenterQueries from 'models/helpCenter/queries'

import { KnowledgeType } from '../types'
import { useBulkKnowledgeActions } from './useBulkKnowledgeActions'

const mockStore = configureStore([thunk])

jest.mock('models/helpCenter/queries', () => ({
    ...jest.requireActual('models/helpCenter/queries'),
    useBulkDeleteArticles: jest.fn(),
    useBulkUpdateArticleTranslationVisibility: jest.fn(),
    helpCenterKeys: {
        knowledgeHubArticles: jest.fn(() => ['knowledge-hub-articles']),
    },
}))

const mockUseBulkDeleteArticles =
    helpCenterQueries.useBulkDeleteArticles as jest.MockedFunction<
        typeof helpCenterQueries.useBulkDeleteArticles
    >

const mockUseBulkUpdateArticleTranslationVisibility =
    helpCenterQueries.useBulkUpdateArticleTranslationVisibility as jest.MockedFunction<
        typeof helpCenterQueries.useBulkUpdateArticleTranslationVisibility
    >

describe('useBulkKnowledgeActions', () => {
    let queryClient: QueryClient
    const mockDeleteMutateAsync = jest.fn()
    const mockVisibilityMutateAsync = jest.fn()

    const helpCenterIds = {
        guidanceHelpCenterId: 1,
        faqHelpCenterId: 2,
        snippetHelpCenterId: 3,
    }

    const store = mockStore({
        currentAccount: fromJS({
            id: 1,
        }),
    })

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        store.clearActions()
        jest.clearAllMocks()

        mockUseBulkDeleteArticles.mockReturnValue({
            mutateAsync: mockDeleteMutateAsync,
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

        mockUseBulkUpdateArticleTranslationVisibility.mockReturnValue({
            mutateAsync: mockVisibilityMutateAsync,
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

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    )

    describe('handleBulkDelete', () => {
        it('should successfully delete guidance articles', async () => {
            mockDeleteMutateAsync.mockResolvedValue({ deleted_count: 2 })

            const { result } = renderHook(
                () => useBulkKnowledgeActions({ helpCenterIds }),
                { wrapper },
            )

            const items = [
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

            await act(async () => {
                await result.current.handleBulkDelete(items)
            })

            expect(mockDeleteMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 1 },
                { article_ids: [1, 2] },
            ])
        })

        it('should successfully delete FAQ articles', async () => {
            mockDeleteMutateAsync.mockResolvedValue({ deleted_count: 1 })

            const { result } = renderHook(
                () => useBulkKnowledgeActions({ helpCenterIds }),
                { wrapper },
            )

            const items = [
                {
                    id: '10',
                    type: KnowledgeType.FAQ,
                    title: 'Test FAQ',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            await act(async () => {
                await result.current.handleBulkDelete(items)
            })

            expect(mockDeleteMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 2 },
                { article_ids: [10] },
            ])
        })

        it('should group and delete articles from multiple help centers', async () => {
            mockDeleteMutateAsync.mockResolvedValue({ deleted_count: 1 })

            const { result } = renderHook(
                () => useBulkKnowledgeActions({ helpCenterIds }),
                { wrapper },
            )

            const items = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Guidance Article',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    id: '10',
                    type: KnowledgeType.FAQ,
                    title: 'FAQ Article',
                    lastUpdatedAt: '2024-01-02',
                },
                {
                    id: '20',
                    type: KnowledgeType.Document,
                    title: 'Document',
                    lastUpdatedAt: '2024-01-03',
                },
            ]

            await act(async () => {
                await result.current.handleBulkDelete(items)
            })

            expect(mockDeleteMutateAsync).toHaveBeenCalledTimes(3)
            expect(mockDeleteMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 1 },
                { article_ids: [1] },
            ])
            expect(mockDeleteMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 2 },
                { article_ids: [10] },
            ])
            expect(mockDeleteMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 3 },
                { article_ids: [20] },
            ])
        })

        it('should handle deletion errors', async () => {
            const mockError = new Error('Deletion failed')
            mockDeleteMutateAsync.mockRejectedValue(mockError)

            const { result } = renderHook(
                () => useBulkKnowledgeActions({ helpCenterIds }),
                { wrapper },
            )

            const items = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Test',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            await act(async () => {
                await result.current.handleBulkDelete(items)
            })

            expect(mockDeleteMutateAsync).toHaveBeenCalled()
        })

        it('should skip articles with null help center ids', async () => {
            const { result } = renderHook(
                () =>
                    useBulkKnowledgeActions({
                        helpCenterIds: {
                            guidanceHelpCenterId: null,
                            faqHelpCenterId: 2,
                            snippetHelpCenterId: null,
                        },
                    }),
                { wrapper },
            )

            const items = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Test Guidance',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    id: '10',
                    type: KnowledgeType.FAQ,
                    title: 'Test FAQ',
                    lastUpdatedAt: '2024-01-02',
                },
            ]

            await act(async () => {
                await result.current.handleBulkDelete(items)
            })

            expect(mockDeleteMutateAsync).toHaveBeenCalledTimes(1)
            expect(mockDeleteMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 2 },
                { article_ids: [10] },
            ])
        })

        it('should invalidate queries after successful deletion', async () => {
            mockDeleteMutateAsync.mockResolvedValue({ deleted_count: 1 })
            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            let onSettledCallback: (() => void) | undefined

            mockUseBulkDeleteArticles.mockImplementation(
                ({ onSettled }: any) => {
                    onSettledCallback = onSettled
                    return {
                        mutateAsync: mockDeleteMutateAsync,
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
                    } as any
                },
            )

            const { result } = renderHook(
                () => useBulkKnowledgeActions({ helpCenterIds }),
                { wrapper },
            )

            const items = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Test',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            await act(async () => {
                await result.current.handleBulkDelete(items)
                onSettledCallback?.()
            })

            await waitFor(() => {
                expect(invalidateQueriesSpy).toHaveBeenCalled()
            })
        })
    })

    describe('handleBulkEnable', () => {
        it('should successfully enable articles (set visibility to PUBLIC)', async () => {
            mockVisibilityMutateAsync.mockResolvedValue({
                articles: [{ id: 1 }],
            })

            const { result } = renderHook(
                () => useBulkKnowledgeActions({ helpCenterIds }),
                { wrapper },
            )

            const items = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Test',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            await act(async () => {
                await result.current.handleBulkEnable(items)
            })

            expect(mockVisibilityMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 1 },
                {
                    article_ids: [1],
                    locale_code: 'en-US',
                    visibility_status: 'PUBLIC',
                },
            ])
        })

        it('should handle multiple help centers when enabling', async () => {
            mockVisibilityMutateAsync.mockResolvedValue({
                articles: [{ id: 1 }],
            })

            const { result } = renderHook(
                () => useBulkKnowledgeActions({ helpCenterIds }),
                { wrapper },
            )

            const items = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Guidance',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    id: '10',
                    type: KnowledgeType.FAQ,
                    title: 'FAQ',
                    lastUpdatedAt: '2024-01-02',
                },
            ]

            await act(async () => {
                await result.current.handleBulkEnable(items)
            })

            expect(mockVisibilityMutateAsync).toHaveBeenCalledTimes(2)
        })
    })

    describe('handleBulkDisable', () => {
        it('should successfully disable articles (set visibility to UNLISTED)', async () => {
            mockVisibilityMutateAsync.mockResolvedValue({
                articles: [{ id: 1 }],
            })

            const { result } = renderHook(
                () => useBulkKnowledgeActions({ helpCenterIds }),
                { wrapper },
            )

            const items = [
                {
                    id: '1',
                    type: KnowledgeType.FAQ,
                    title: 'Test',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            await act(async () => {
                await result.current.handleBulkDisable(items)
            })

            expect(mockVisibilityMutateAsync).toHaveBeenCalledWith([
                undefined,
                { help_center_id: 2 },
                {
                    article_ids: [1],
                    locale_code: 'en-US',
                    visibility_status: 'UNLISTED',
                },
            ])
        })

        it('should handle visibility update errors', async () => {
            const mockError = new Error('Update failed')
            mockVisibilityMutateAsync.mockRejectedValue(mockError)

            const { result } = renderHook(
                () => useBulkKnowledgeActions({ helpCenterIds }),
                { wrapper },
            )

            const items = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Test',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            await act(async () => {
                await result.current.handleBulkDisable(items)
            })

            expect(mockVisibilityMutateAsync).toHaveBeenCalled()
        })

        it('should invalidate queries after successful visibility update', async () => {
            mockVisibilityMutateAsync.mockResolvedValue({
                articles: [{ id: 1 }],
            })
            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            let onSettledCallback: (() => void) | undefined

            mockUseBulkUpdateArticleTranslationVisibility.mockImplementation(
                ({ onSettled }: any) => {
                    onSettledCallback = onSettled
                    return {
                        mutateAsync: mockVisibilityMutateAsync,
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
                    } as any
                },
            )

            const { result } = renderHook(
                () => useBulkKnowledgeActions({ helpCenterIds }),
                { wrapper },
            )

            const items = [
                {
                    id: '1',
                    type: KnowledgeType.Guidance,
                    title: 'Test',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            await act(async () => {
                await result.current.handleBulkDisable(items)
                onSettledCallback?.()
            })

            await waitFor(() => {
                expect(invalidateQueriesSpy).toHaveBeenCalled()
            })
        })
    })

    describe('isLoading', () => {
        it('should return true when delete mutation is loading', () => {
            mockUseBulkDeleteArticles.mockReturnValue({
                mutateAsync: mockDeleteMutateAsync,
                mutate: jest.fn(),
                reset: jest.fn(),
                isSuccess: false,
                isError: false,
                isIdle: false,
                isLoading: true,
                status: 'pending',
                data: undefined,
                error: null,
                failureCount: 0,
                failureReason: null,
                variables: undefined,
                context: undefined,
                isPaused: false,
                isPending: true,
            } as any)

            const { result } = renderHook(
                () => useBulkKnowledgeActions({ helpCenterIds }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('should return true when visibility mutation is loading', () => {
            mockUseBulkUpdateArticleTranslationVisibility.mockReturnValue({
                mutateAsync: mockVisibilityMutateAsync,
                mutate: jest.fn(),
                reset: jest.fn(),
                isSuccess: false,
                isError: false,
                isIdle: false,
                isLoading: true,
                status: 'pending',
                data: undefined,
                error: null,
                failureCount: 0,
                failureReason: null,
                variables: undefined,
                context: undefined,
                isPaused: false,
                isPending: true,
            } as any)

            const { result } = renderHook(
                () => useBulkKnowledgeActions({ helpCenterIds }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('should return false when no mutations are loading', () => {
            const { result } = renderHook(
                () => useBulkKnowledgeActions({ helpCenterIds }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(false)
        })
    })
})
