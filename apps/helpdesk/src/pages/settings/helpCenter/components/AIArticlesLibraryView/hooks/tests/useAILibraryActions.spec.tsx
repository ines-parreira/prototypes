import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'

import { toast } from '@gorgias/axiom'

import { DefaultExportCurrentHelpCenterContext as CurrentHelpCenterContext } from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import { AILibraryArticleItemsFixture } from 'pages/settings/helpCenter/fixtures/aiArticles.fixture'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { EditionManagerContextProvider } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import { useUpsertArticleTemplateReview } from 'pages/settings/helpCenter/queries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useAILibraryActions } from '../useAILibraryActions'

jest.mock('hooks/useAppSelector', () => ({ useAppSelector: jest.fn() }))
jest.mock('pages/settings/helpCenter/queries')

const queryClient = mockQueryClient()
const useUpsertArticleTemplateReviewMock = assumeMock(
    useUpsertArticleTemplateReview,
)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => ({
    useAppDispatch: () => mockedDispatch,
}))

const mockedUpsertArticleTemplateReview = jest.fn()

type UpsertReviewOptions = Parameters<typeof useUpsertArticleTemplateReview>[0]
let capturedReviewOptions: UpsertReviewOptions | undefined

const wrapper = ({ children }: any) => (
    <CurrentHelpCenterContext.Provider
        value={getSingleHelpCenterResponseFixture}
    >
        <EditionManagerContextProvider>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </EditionManagerContextProvider>
    </CurrentHelpCenterContext.Provider>
)

const setEditModalMock = jest.fn()
const mockedUseEditionManager = {
    setEditModal: setEditModalMock,
    editModal: {
        isOpened: true,
    },
}

jest.mock('../../../../providers/EditionManagerContext', () => {
    const module: Record<string, unknown> = jest.requireActual(
        '../../../../providers/EditionManagerContext',
    )

    return {
        ...module,
        useEditionManager: () => mockedUseEditionManager,
    }
})

describe('useAILibraryActions', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        capturedReviewOptions = undefined
        useUpsertArticleTemplateReviewMock.mockImplementation((options) => {
            capturedReviewOptions = options
            return {
                mutate: mockedUpsertArticleTemplateReview,
                mutateAsync: mockedUpsertArticleTemplateReview,
                isLoading: false,
            } as unknown as ReturnType<typeof useUpsertArticleTemplateReview>
        })
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('should review the article when calling onEditorSave', () => {
        const { result } = renderHook(
            () =>
                useAILibraryActions(
                    getSingleHelpCenterResponseFixture,
                    AILibraryArticleItemsFixture,
                    jest.fn(),
                ),
            {
                wrapper,
            },
        )

        act(() => {
            result.current.onEditorSave({
                article: AILibraryArticleItemsFixture[0],
                title: 'Title',
                content: 'Content',
                saveAsDraft: false,
                categoryId: 1,
                customerVisibility: 'PUBLIC',
            })
        })

        expect(mockedUpsertArticleTemplateReview).toHaveBeenCalledWith([
            undefined,
            { help_center_id: getSingleHelpCenterResponseFixture.id },
            {
                action: 'publish',
                template_key: AILibraryArticleItemsFixture[0].key,
            },
        ])
    })

    it('should use saveAsDraft action when saving as draft from editor', () => {
        const { result } = renderHook(
            () =>
                useAILibraryActions(
                    getSingleHelpCenterResponseFixture,
                    AILibraryArticleItemsFixture,
                    jest.fn(),
                ),
            {
                wrapper,
            },
        )

        act(() => {
            result.current.onEditorSave({
                article: AILibraryArticleItemsFixture[0],
                title: 'Draft Title',
                content: 'Draft Content',
                saveAsDraft: true,
                categoryId: 2,
                customerVisibility: 'UNLISTED',
            })
        })

        expect(mockedUpsertArticleTemplateReview).toHaveBeenCalledWith([
            undefined,
            { help_center_id: getSingleHelpCenterResponseFixture.id },
            {
                action: 'saveAsDraft',
                template_key: AILibraryArticleItemsFixture[0].key,
            },
        ])
    })

    it('should archive the article when calling onArchive', () => {
        const { result } = renderHook(
            () =>
                useAILibraryActions(
                    getSingleHelpCenterResponseFixture,
                    AILibraryArticleItemsFixture,
                    jest.fn(),
                ),
            {
                wrapper,
            },
        )

        act(() => {
            result.current.onArchive(AILibraryArticleItemsFixture[0], 'reason')
        })

        expect(mockedUpsertArticleTemplateReview).toHaveBeenCalledWith([
            undefined,
            { help_center_id: getSingleHelpCenterResponseFixture.id },
            {
                action: 'archive',
                template_key: AILibraryArticleItemsFixture[0].key,
                reason: 'reason',
            },
        ])
    })

    it('should publish the article when calling onPublish', () => {
        const { result } = renderHook(
            () =>
                useAILibraryActions(
                    getSingleHelpCenterResponseFixture,
                    AILibraryArticleItemsFixture,
                    jest.fn(),
                ),
            {
                wrapper,
            },
        )

        act(() => {
            result.current.onPublish(AILibraryArticleItemsFixture[0])
        })

        expect(mockedUpsertArticleTemplateReview).toHaveBeenCalledWith([
            undefined,
            { help_center_id: getSingleHelpCenterResponseFixture.id },
            {
                action: 'publish',
                template_key: AILibraryArticleItemsFixture[0].key,
            },
        ])
    })

    it('should open the editor when calling onEdit', () => {
        const { result } = renderHook(
            () =>
                useAILibraryActions(
                    getSingleHelpCenterResponseFixture,
                    AILibraryArticleItemsFixture,
                    jest.fn(),
                ),
            {
                wrapper,
            },
        )

        act(() => {
            result.current.onEdit()
        })

        expect(setEditModalMock).toHaveBeenCalledWith({
            isOpened: true,
            view: null,
        })
    })

    it('should close the editor when calling onEditorClose', () => {
        const { result } = renderHook(
            () =>
                useAILibraryActions(
                    getSingleHelpCenterResponseFixture,
                    AILibraryArticleItemsFixture,
                    jest.fn(),
                ),
            {
                wrapper,
            },
        )

        act(() => {
            result.current.onEditorClose()
        })

        expect(setEditModalMock).toHaveBeenCalledWith({
            view: null,
            isOpened: false,
        })
    })

    it('shows a success toast when the review mutation succeeds', async () => {
        const markArticleAsReviewed = jest.fn()
        renderHook(
            () =>
                useAILibraryActions(
                    getSingleHelpCenterResponseFixture,
                    AILibraryArticleItemsFixture,
                    markArticleAsReviewed,
                ),
            {
                wrapper,
            },
        )

        await act(async () => {
            await capturedReviewOptions?.onSuccess?.(
                null,
                [
                    undefined,
                    { help_center_id: getSingleHelpCenterResponseFixture.id },
                    {
                        action: 'archive',
                        template_key: AILibraryArticleItemsFixture[0].key,
                    },
                ],
                undefined,
            )
        })

        await waitFor(() => {
            const status = screen.getByRole('status', {
                name: /Article archived\./,
            })
            expect(status).toHaveAttribute('data-intent', 'success')
        })

        expect(markArticleAsReviewed).toHaveBeenCalledWith(
            AILibraryArticleItemsFixture[0].key,
            'archive',
        )
    })

    it('shows an error toast when the review mutation fails', async () => {
        renderHook(
            () =>
                useAILibraryActions(
                    getSingleHelpCenterResponseFixture,
                    AILibraryArticleItemsFixture,
                    jest.fn(),
                ),
            {
                wrapper,
            },
        )

        act(() => {
            capturedReviewOptions?.onError?.(
                {},
                [
                    undefined,
                    { help_center_id: getSingleHelpCenterResponseFixture.id },
                    {
                        action: 'publish',
                        template_key: AILibraryArticleItemsFixture[0].key,
                    },
                ],
                undefined,
            )
        })

        await waitFor(() => {
            const status = screen.getByRole('status', {
                name: /Article could not be published\./,
            })
            expect(status).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
