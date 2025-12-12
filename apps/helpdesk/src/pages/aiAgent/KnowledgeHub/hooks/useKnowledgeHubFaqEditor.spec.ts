import { act, renderHook } from '@testing-library/react'
import type { History, Location } from 'history'

import { GetArticleVersionStatus } from '@gorgias/help-center-types'

import { InitialArticleMode } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/KnowledgeEditorHelpCenterExistingArticle'

import type { FaqEditorConfig } from '../types'
import type { KnowledgeEditorReturn } from './useKnowledgeHubEditor'
import { useKnowledgeHubFaqEditor } from './useKnowledgeHubFaqEditor'

jest.mock('react-router-dom', () => ({
    useHistory: jest.fn(),
    useLocation: jest.fn(),
}))

jest.mock('./useKnowledgeHubEditor', () => ({
    useKnowledgeHubEditor: jest.fn(),
}))

jest.mock('./navigationUtils', () => ({
    updateArticleIdInUrl: jest.fn(),
}))

jest.mock('../utils/articleUtils', () => ({
    getVersionStatus: jest.fn(),
}))

const { useHistory, useLocation } = jest.requireMock('react-router-dom')
const { useKnowledgeHubEditor } = jest.requireMock('./useKnowledgeHubEditor')
const { getVersionStatus } = jest.requireMock('../utils/articleUtils')

describe('useKnowledgeHubFaqEditor', () => {
    const mockEditor: KnowledgeEditorReturn<FaqEditorConfig> = {
        editorType: 'faq',
        isEditorOpen: false,
        currentArticleId: undefined,
        editorMode: 'create',
        faqArticleMode: 'new',
        initialArticleMode: InitialArticleMode.EDIT,
        shopName: 'test-shop',
        openEditorForCreate: jest.fn(),
        openEditorForEdit: jest.fn(),
        closeEditor: jest.fn(),
        handleCreate: jest.fn(),
        handleUpdate: jest.fn(),
        handleDelete: jest.fn(),
        hasPrevious: false,
        hasNext: false,
        handleClickPrevious: jest.fn(),
        handleClickNext: jest.fn(),
        versionStatus: undefined,
    }

    const filteredFaqArticles = [
        {
            id: 1,
            title: 'First FAQ Article',
            draftVersionId: 1,
            publishedVersionId: 1,
        },
        {
            id: 2,
            title: 'Second FAQ Article',
            draftVersionId: 2,
            publishedVersionId: 1,
        },
        {
            id: 3,
            title: 'Third FAQ Article',
            draftVersionId: 1,
            publishedVersionId: 1,
        },
    ]

    const mockHistory = {
        replace: jest.fn(),
        push: jest.fn(),
        location: {
            pathname: '/app/ai-agent/shopify/test-shop/knowledge',
            search: '',
        },
    } as unknown as History

    const mockLocation = {
        pathname: '/app/ai-agent/shopify/test-shop/knowledge',
        search: '',
        hash: '',
        state: undefined,
    } as Location

    beforeEach(() => {
        jest.clearAllMocks()
        useKnowledgeHubEditor.mockReturnValue(mockEditor)
        useHistory.mockReturnValue(mockHistory)
        useLocation.mockReturnValue(mockLocation)
        getVersionStatus.mockReturnValue(GetArticleVersionStatus.Current)
    })

    it('initializes with correct parameters', () => {
        renderHook(() =>
            useKnowledgeHubFaqEditor({
                shopName: 'test-shop',
                filteredFaqArticles,
            }),
        )

        expect(useKnowledgeHubEditor).toHaveBeenCalledWith({
            type: 'faq',
            shopName: 'test-shop',
            filteredArticles: filteredFaqArticles,
        })
    })

    describe('return values', () => {
        it('exposes all required properties', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubFaqEditor({
                    shopName: 'test-shop',
                    filteredFaqArticles,
                }),
            )

            expect(result.current).toHaveProperty('isEditorOpen')
            expect(result.current).toHaveProperty('currentArticleId')
            expect(result.current).toHaveProperty('faqArticleMode')
            expect(result.current).toHaveProperty('initialArticleMode')
            expect(result.current).toHaveProperty('openEditorForCreate')
            expect(result.current).toHaveProperty('openEditorForEdit')
            expect(result.current).toHaveProperty('closeEditor')
            expect(result.current).toHaveProperty('handleCreate')
            expect(result.current).toHaveProperty('handleUpdate')
            expect(result.current).toHaveProperty('handleDelete')
            expect(result.current).toHaveProperty('hasPrevious')
            expect(result.current).toHaveProperty('hasNext')
            expect(result.current).toHaveProperty('versionStatus')
        })

        it('forwards editor state correctly', () => {
            mockEditor.isEditorOpen = true
            mockEditor.currentArticleId = 456
            mockEditor.faqArticleMode = 'existing'
            mockEditor.initialArticleMode = InitialArticleMode.READ
            mockEditor.hasPrevious = true
            mockEditor.hasNext = true
            mockEditor.versionStatus = GetArticleVersionStatus.LatestDraft

            const { result } = renderHook(() =>
                useKnowledgeHubFaqEditor({
                    shopName: 'test-shop',
                    filteredFaqArticles,
                }),
            )

            expect(result.current.isEditorOpen).toBe(true)
            expect(result.current.currentArticleId).toBe(456)
            expect(result.current.faqArticleMode).toBe('existing')
            expect(result.current.initialArticleMode).toBe(
                InitialArticleMode.READ,
            )
            expect(result.current.hasPrevious).toBe(true)
            expect(result.current.hasNext).toBe(true)
            expect(result.current.versionStatus).toBe(
                GetArticleVersionStatus.LatestDraft,
            )
        })

        it('forwards editor actions correctly', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubFaqEditor({
                    shopName: 'test-shop',
                    filteredFaqArticles,
                }),
            )

            act(() => {
                result.current.openEditorForCreate()
            })
            expect(mockEditor.openEditorForCreate).toHaveBeenCalledTimes(1)

            act(() => {
                result.current.closeEditor()
            })
            expect(mockEditor.closeEditor).toHaveBeenCalledTimes(1)

            act(() => {
                result.current.handleCreate()
            })
            expect(mockEditor.handleCreate).toHaveBeenCalledTimes(1)

            act(() => {
                result.current.handleUpdate()
            })
            expect(mockEditor.handleUpdate).toHaveBeenCalledTimes(1)

            act(() => {
                result.current.handleDelete()
            })
            expect(mockEditor.handleDelete).toHaveBeenCalledTimes(1)
        })
    })

    describe('openEditorForEdit with version status', () => {
        it('calls getVersionStatus with the article and passes version status to editor', () => {
            getVersionStatus.mockReturnValue(
                GetArticleVersionStatus.LatestDraft,
            )

            const { result } = renderHook(() =>
                useKnowledgeHubFaqEditor({
                    shopName: 'test-shop',
                    filteredFaqArticles,
                }),
            )

            act(() => {
                result.current.openEditorForEdit(2)
            })

            expect(getVersionStatus).toHaveBeenCalledWith(
                filteredFaqArticles[1],
            )
            expect(mockEditor.openEditorForEdit).toHaveBeenCalledWith(
                2,
                GetArticleVersionStatus.LatestDraft,
            )
        })

        it('passes Current version status when article has no draft changes', () => {
            getVersionStatus.mockReturnValue(GetArticleVersionStatus.Current)

            const { result } = renderHook(() =>
                useKnowledgeHubFaqEditor({
                    shopName: 'test-shop',
                    filteredFaqArticles,
                }),
            )

            act(() => {
                result.current.openEditorForEdit(1)
            })

            expect(getVersionStatus).toHaveBeenCalledWith(
                filteredFaqArticles[0],
            )
            expect(mockEditor.openEditorForEdit).toHaveBeenCalledWith(
                1,
                GetArticleVersionStatus.Current,
            )
        })

        it('calls getVersionStatus with undefined when article is not found', () => {
            getVersionStatus.mockReturnValue(GetArticleVersionStatus.Current)

            const { result } = renderHook(() =>
                useKnowledgeHubFaqEditor({
                    shopName: 'test-shop',
                    filteredFaqArticles,
                }),
            )

            act(() => {
                result.current.openEditorForEdit(999)
            })

            expect(getVersionStatus).toHaveBeenCalledWith(undefined)
            expect(mockEditor.openEditorForEdit).toHaveBeenCalledWith(
                999,
                GetArticleVersionStatus.Current,
            )
        })
    })
})
