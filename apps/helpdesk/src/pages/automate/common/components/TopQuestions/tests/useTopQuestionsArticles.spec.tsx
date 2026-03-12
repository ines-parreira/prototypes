import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import type {
    AIArticle,
    LocalArticleTranslation,
} from 'models/helpCenter/types'
import { useCreateAIArticle } from 'pages/settings/helpCenter/hooks/useCreateAIArticle'
import { useGetAIArticles } from 'pages/settings/helpCenter/hooks/useGetAIArticles'
import {
    aiArticleKeys,
    useUpsertArticleTemplateReview,
} from 'pages/settings/helpCenter/queries'
import { ArticleOrigin } from 'pages/settings/helpCenter/types/articleOrigin.enum'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useTopQuestionsArticles } from '../useTopQuestionsArticles'

jest.mock('@repo/logging')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])()

const mockArticles: AIArticle[] = [
    {
        key: 'ai_article_1',
        title: 'AI Article 1',
        html_content: '<p>AI Article 1 content</p>',
        excerpt: 'AI Article 1 excerpt',
        category: 'AI',
        score: 0.5,
        related_tickets_count: 150,
        batch_datetime: '2024-02-06T13:30:00Z',
        review_action: undefined,
        reviews: [],
    },
    {
        key: 'ai_article_2',
        title: 'AI Article 2',
        html_content: '<p>AI Article 2 content</p>',
        excerpt: 'AI Article 2 excerpt',
        category: 'AI',
        score: 0.5,
        related_tickets_count: 140,
        batch_datetime: '2024-02-06T13:30:00Z',
        review_action: undefined,
        reviews: [],
    },
    {
        key: 'ai_article_3',
        title: 'AI Article 3',
        html_content: '<p>AI Article 3 content</p>',
        excerpt: 'AI Article 3 excerpt',
        category: 'AI',
        score: 0.5,
        related_tickets_count: 130,
        batch_datetime: '2024-02-06T13:30:00Z',
        review_action: undefined,
        reviews: [],
    },
]

jest.mock('pages/settings/helpCenter/hooks/useGetAIArticles')
const mockUseConditionalGetAIArticles = assumeMock(useGetAIArticles)

jest.mock('pages/settings/helpCenter/hooks/useCreateAIArticle')
const mockUseCreateAIArticle = assumeMock(useCreateAIArticle)

jest.mock('pages/settings/helpCenter/queries')
const mockUseUpsertArticleTemplateReview = assumeMock(
    useUpsertArticleTemplateReview,
)
const mockUpsertArticleTemplateReviewMutateAsync = jest.fn()

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

const invalidateQueryMock = jest.spyOn(queryClient, 'invalidateQueries')

const storeIntegrationId = 1
const helpCenterId = 2
const locale = 'en-US'

describe('useTopQuestionsArticles', () => {
    beforeEach(() => {
        mockStore.clearActions()
        jest.resetAllMocks()

        mockUseUpsertArticleTemplateReview.mockImplementation(() => {
            return {
                mutateAsync: mockUpsertArticleTemplateReviewMutateAsync,
            } as unknown as ReturnType<typeof useUpsertArticleTemplateReview>
        })

        aiArticleKeys.list = jest.fn().mockReturnValue(['list'])
        aiArticleKeys.listWithStore = jest
            .fn()
            .mockReturnValue(['listwithstore'])

        mockUseCreateAIArticle.mockReturnValue({
            createArticle: jest.fn(),
            isCreateArticleLoading: false,
        })
    })

    it('fetches AI articles and returns the data', () => {
        mockUseConditionalGetAIArticles.mockReturnValue({
            fetchedArticles: mockArticles,
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useTopQuestionsArticles(
                    storeIntegrationId,
                    helpCenterId,
                    locale,
                ),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        expect(result.current.articles).toEqual(mockArticles)
        expect(result.current.isLoading).toBe(false)
    })

    it('returns empty array and isLoading when loading', () => {
        mockUseConditionalGetAIArticles.mockReturnValue({
            fetchedArticles: null,
            isLoading: true,
        })

        const { result } = renderHook(
            () =>
                useTopQuestionsArticles(
                    storeIntegrationId,
                    helpCenterId,
                    locale,
                ),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        expect(result.current.articles).toEqual([])
        expect(result.current.isLoading).toEqual(true)
    })

    it('dismisses article and updates its review', async () => {
        mockUseConditionalGetAIArticles.mockReturnValue({
            fetchedArticles: mockArticles,
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useTopQuestionsArticles(
                    storeIntegrationId,
                    helpCenterId,
                    locale,
                ),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        await act(() => result.current.dismissArticle('ai_article_1'))

        expect(mockUpsertArticleTemplateReviewMutateAsync).toHaveBeenCalledWith(
            [
                undefined,
                { help_center_id: helpCenterId },
                {
                    action: 'dismissFromTopQuestions',
                    template_key: 'ai_article_1',
                },
            ],
        )

        expect(result.current.articles[0].review_action).toEqual(
            'dismissFromTopQuestions',
        )

        await mockUseUpsertArticleTemplateReview.mock.calls[0][0]?.onSuccess!(
            null,
            [
                undefined,
                { help_center_id: helpCenterId },
                {
                    action: 'dismissFromTopQuestions',
                    template_key: 'ai_article_1',
                },
            ],
            undefined,
        )

        await waitFor(() => {
            expect(invalidateQueryMock).toHaveBeenCalledWith(
                aiArticleKeys.list(helpCenterId),
            )
            expect(invalidateQueryMock).toHaveBeenCalledWith(
                aiArticleKeys.listWithStore(helpCenterId, storeIntegrationId),
            )
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomateTopQuestionsSectionDismissArticle,
        )
    })

    it('creates article, updates its review and opens new tab to editor', async () => {
        mockUseConditionalGetAIArticles.mockReturnValue({
            fetchedArticles: mockArticles,
            isLoading: false,
        })

        const mockCreateArticle = jest.fn().mockReturnValue(
            Promise.resolve({
                ...axiosSuccessResponse({
                    id: 10,
                    created_datetime: '2024-02-06T13:30:00Z',
                    updated_datetime: '2024-02-06T13:30:00Z',
                    unlisted_id: 'id',
                    available_locales: ['en-US'],
                    category_id: null,
                    help_center_id: helpCenterId,
                    translation: {} as unknown as LocalArticleTranslation,
                }),
                status: 204,
            }),
        )

        mockUseCreateAIArticle.mockReturnValue({
            createArticle: mockCreateArticle,
            isCreateArticleLoading: false,
        })

        const { result } = renderHook(
            () =>
                useTopQuestionsArticles(
                    storeIntegrationId,
                    helpCenterId,
                    locale,
                ),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        await act(() =>
            result.current.createArticle(
                'ai_article_1',
                ArticleOrigin.TOP_QUESTIONS_SECTION,
            ),
        )

        expect(mockCreateArticle).toHaveBeenCalledWith({
            articleTemplate: {
                batch_datetime: '2024-02-06T13:30:00Z',
                category: 'AI',
                excerpt: 'AI Article 1 excerpt',
                html_content: '<p>AI Article 1 content</p>',
                key: 'ai_article_1',
                related_tickets_count: 150,
                review_action: undefined,
                reviews: [],
                score: 0.5,
                title: 'AI Article 1',
            },
            categoryId: null,
            origin: ArticleOrigin.TOP_QUESTIONS_SECTION,
            publish: false,
            customerVisibility: 'PUBLIC',
        })

        expect(mockUpsertArticleTemplateReviewMutateAsync).toHaveBeenCalledWith(
            [
                undefined,
                { help_center_id: helpCenterId },
                {
                    action: 'saveAsDraft',
                    template_key: 'ai_article_1',
                },
            ],
        )

        expect(result.current.articles[0].review_action).toEqual('saveAsDraft')

        await mockUseUpsertArticleTemplateReview.mock.calls[0][0]?.onSuccess!(
            null,
            [
                undefined,
                { help_center_id: helpCenterId },
                {
                    action: 'saveAsDraft',
                    template_key: 'ai_article_1',
                },
            ],
            undefined,
        )

        await waitFor(() => {
            expect(invalidateQueryMock).toHaveBeenCalledWith(
                aiArticleKeys.list(helpCenterId),
            )
            expect(invalidateQueryMock).toHaveBeenCalledWith(
                aiArticleKeys.listWithStore(helpCenterId, storeIntegrationId),
            )
        })

        expect(window.open).toHaveBeenCalledWith(
            `/app/settings/help-center/${helpCenterId}/articles?article_id=10`,
            '_blank',
            'noopener',
        )
    })

    it('does not create article when article template is not found', async () => {
        mockUseConditionalGetAIArticles.mockReturnValue({
            fetchedArticles: mockArticles,
            isLoading: false,
        })

        mockUseCreateAIArticle.mockReturnValue({
            createArticle: jest.fn(),
            isCreateArticleLoading: false,
        })

        const { result } = renderHook(
            () =>
                useTopQuestionsArticles(
                    storeIntegrationId,
                    helpCenterId,
                    locale,
                ),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        await act(() =>
            result.current.createArticle(
                'i_do_not_exist',
                ArticleOrigin.TOP_QUESTIONS_SECTION,
            ),
        )

        expect(
            mockUpsertArticleTemplateReviewMutateAsync,
        ).toHaveBeenCalledTimes(0)
    })

    it('displays error notification when article creation fails', async () => {
        mockUseConditionalGetAIArticles.mockReturnValue({
            fetchedArticles: mockArticles,
            isLoading: false,
        })

        const mockCreateArticle = jest
            .fn()
            .mockReturnValue(
                Promise.reject(new AxiosError('some error message')),
            )

        mockUseCreateAIArticle.mockReturnValue({
            createArticle: mockCreateArticle,
            isCreateArticleLoading: false,
        })

        const { result } = renderHook(
            () =>
                useTopQuestionsArticles(
                    storeIntegrationId,
                    helpCenterId,
                    locale,
                ),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        await act(() =>
            result.current.createArticle(
                'ai_article_1',
                ArticleOrigin.TOP_QUESTIONS_SECTION,
            ),
        )

        expect(mockCreateArticle).toHaveBeenCalledTimes(1)

        expect(result.current.articles[0].review_action).toBeUndefined()

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: `Article could not be created. Please try again later`,
            status: NotificationStatus.Error,
        })

        expect(mockedDispatch).toHaveBeenCalledTimes(1)
    })
})
