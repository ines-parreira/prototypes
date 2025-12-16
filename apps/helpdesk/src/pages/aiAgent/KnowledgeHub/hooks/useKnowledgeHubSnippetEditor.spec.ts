import { act, renderHook } from '@testing-library/react'

import { KnowledgeType } from '../types'
import type {
    SnippetEditorConfig,
    UseKnowledgeHubSnippetEditorParams,
} from '../types'
import type { KnowledgeEditorReturn } from './useKnowledgeHubEditor'
import { useKnowledgeHubSnippetEditor } from './useKnowledgeHubSnippetEditor'

jest.mock('./useKnowledgeHubEditor', () => ({
    useKnowledgeHubEditor: jest.fn(),
}))

const { useKnowledgeHubEditor } = jest.requireMock('./useKnowledgeHubEditor')

describe('useKnowledgeHubSnippetEditor', () => {
    const mockEditor: KnowledgeEditorReturn<SnippetEditorConfig> = {
        editorType: 'snippet',
        isEditorOpen: false,
        currentArticleId: undefined,
        editorMode: 'create',
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
    }

    const filteredSnippetArticles = [
        { id: 1, title: 'URL Article', type: KnowledgeType.URL },
        { id: 2, title: 'Document Article', type: KnowledgeType.Document },
        { id: 3, title: 'Domain Article', type: KnowledgeType.Domain },
    ]

    const mockHistory = {
        replace: jest.fn(),
        push: jest.fn(),
        location: { pathname: '/knowledge', search: '' },
    } as any

    const mockRoutes = {
        knowledgeArticle: jest.fn(
            (type: string, id: number) => `/knowledge/${type}/${id}`,
        ),
    } as any

    const mockBuildUrlWithParams = jest.fn((basePath: string) => basePath)

    beforeEach(() => {
        jest.clearAllMocks()
        useKnowledgeHubEditor.mockReturnValue(mockEditor)
    })

    it('initializes with undefined snippet type', () => {
        const { result } = renderHook(() =>
            useKnowledgeHubSnippetEditor({
                shopName: 'test-shop',
                filteredSnippetArticles,
                history: mockHistory,
                routes: mockRoutes,
                buildUrlWithParams: mockBuildUrlWithParams,
            } as unknown as UseKnowledgeHubSnippetEditorParams),
        )

        expect(result.current.currentSnippetType).toBeUndefined()
    })

    it('calls useKnowledgeHubEditor with correct parameters', () => {
        renderHook(() =>
            useKnowledgeHubSnippetEditor({
                shopName: 'test-shop',
                filteredSnippetArticles,
                history: mockHistory,
                routes: mockRoutes,
                buildUrlWithParams: mockBuildUrlWithParams,
            } as unknown as UseKnowledgeHubSnippetEditorParams),
        )

        expect(useKnowledgeHubEditor).toHaveBeenCalledWith({
            type: 'snippet',
            shopName: 'test-shop',
            filteredArticles: filteredSnippetArticles,
        })
    })

    describe('openEditorForEdit', () => {
        it('maps URL KnowledgeType to url SnippetType', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubSnippetEditor({
                    shopName: 'test-shop',
                    filteredSnippetArticles,
                    history: mockHistory,
                    routes: mockRoutes,
                    buildUrlWithParams: mockBuildUrlWithParams,
                } as unknown as UseKnowledgeHubSnippetEditorParams),
            )

            act(() => {
                result.current.openEditorForEdit(1, KnowledgeType.URL)
            })

            expect(result.current.currentSnippetType).toBe('url')
            expect(mockEditor.openEditorForEdit).toHaveBeenCalledWith(1)
        })

        it('maps Document KnowledgeType to document SnippetType', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubSnippetEditor({
                    shopName: 'test-shop',
                    filteredSnippetArticles,
                    history: mockHistory,
                    routes: mockRoutes,
                    buildUrlWithParams: mockBuildUrlWithParams,
                } as unknown as UseKnowledgeHubSnippetEditorParams),
            )

            act(() => {
                result.current.openEditorForEdit(2, KnowledgeType.Document)
            })

            expect(result.current.currentSnippetType).toBe('document')
            expect(mockEditor.openEditorForEdit).toHaveBeenCalledWith(2)
        })

        it('maps Domain KnowledgeType to store SnippetType', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubSnippetEditor({
                    shopName: 'test-shop',
                    filteredSnippetArticles,
                    history: mockHistory,
                    routes: mockRoutes,
                    buildUrlWithParams: mockBuildUrlWithParams,
                } as unknown as UseKnowledgeHubSnippetEditorParams),
            )

            act(() => {
                result.current.openEditorForEdit(3, KnowledgeType.Domain)
            })

            expect(result.current.currentSnippetType).toBe('store')
            expect(mockEditor.openEditorForEdit).toHaveBeenCalledWith(3)
        })

        it('throws error for invalid KnowledgeType', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubSnippetEditor({
                    shopName: 'test-shop',
                    filteredSnippetArticles,
                    history: mockHistory,
                    routes: mockRoutes,
                    buildUrlWithParams: mockBuildUrlWithParams,
                } as unknown as UseKnowledgeHubSnippetEditorParams),
            )

            expect(() => {
                act(() => {
                    result.current.openEditorForEdit(4, KnowledgeType.FAQ)
                })
            }).toThrow('Invalid KnowledgeType for snippet: faq')
        })
    })

    describe('closeEditor', () => {
        it('resets snippet type to undefined', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubSnippetEditor({
                    shopName: 'test-shop',
                    filteredSnippetArticles,
                    history: mockHistory,
                    routes: mockRoutes,
                    buildUrlWithParams: mockBuildUrlWithParams,
                } as unknown as UseKnowledgeHubSnippetEditorParams),
            )

            act(() => {
                result.current.openEditorForEdit(1, KnowledgeType.URL)
            })

            expect(result.current.currentSnippetType).toBe('url')

            act(() => {
                result.current.closeEditor()
            })

            expect(result.current.currentSnippetType).toBeUndefined()
            expect(mockEditor.closeEditor).toHaveBeenCalledTimes(1)
        })
    })

    describe('handleClickPrevious', () => {
        it('updates snippet type when navigating to previous article', () => {
            mockEditor.hasPrevious = true
            mockEditor.currentArticleId = 2

            const { result } = renderHook(() =>
                useKnowledgeHubSnippetEditor({
                    shopName: 'test-shop',
                    filteredSnippetArticles,
                    history: mockHistory,
                    routes: mockRoutes,
                    buildUrlWithParams: mockBuildUrlWithParams,
                } as unknown as UseKnowledgeHubSnippetEditorParams),
            )

            act(() => {
                result.current.handleClickPrevious()
            })

            expect(result.current.currentSnippetType).toBe('url')
            expect(mockEditor.handleClickPrevious).toHaveBeenCalledTimes(1)
        })

        it('does not update snippet type when at first article', () => {
            mockEditor.hasPrevious = true
            mockEditor.currentArticleId = 1

            const { result } = renderHook(() =>
                useKnowledgeHubSnippetEditor({
                    shopName: 'test-shop',
                    filteredSnippetArticles,
                    history: mockHistory,
                    routes: mockRoutes,
                    buildUrlWithParams: mockBuildUrlWithParams,
                } as unknown as UseKnowledgeHubSnippetEditorParams),
            )

            act(() => {
                result.current.openEditorForEdit(1, KnowledgeType.URL)
            })

            const initialType = result.current.currentSnippetType

            act(() => {
                result.current.handleClickPrevious()
            })

            expect(result.current.currentSnippetType).toBe(initialType)
        })

        it('calls editor handleClickPrevious', () => {
            mockEditor.hasPrevious = false

            const { result } = renderHook(() =>
                useKnowledgeHubSnippetEditor({
                    shopName: 'test-shop',
                    filteredSnippetArticles,
                    history: mockHistory,
                    routes: mockRoutes,
                    buildUrlWithParams: mockBuildUrlWithParams,
                } as unknown as UseKnowledgeHubSnippetEditorParams),
            )

            act(() => {
                result.current.handleClickPrevious()
            })

            expect(mockEditor.handleClickPrevious).toHaveBeenCalledTimes(1)
        })
    })

    describe('handleClickNext', () => {
        it('updates snippet type when navigating to next article', () => {
            mockEditor.hasNext = true
            mockEditor.currentArticleId = 1

            const { result } = renderHook(() =>
                useKnowledgeHubSnippetEditor({
                    shopName: 'test-shop',
                    filteredSnippetArticles,
                    history: mockHistory,
                    routes: mockRoutes,
                    buildUrlWithParams: mockBuildUrlWithParams,
                } as unknown as UseKnowledgeHubSnippetEditorParams),
            )

            act(() => {
                result.current.handleClickNext()
            })

            expect(result.current.currentSnippetType).toBe('document')
            expect(mockEditor.handleClickNext).toHaveBeenCalledTimes(1)
        })

        it('does not update snippet type when at last article', () => {
            mockEditor.hasNext = true
            mockEditor.currentArticleId = 3

            const { result } = renderHook(() =>
                useKnowledgeHubSnippetEditor({
                    shopName: 'test-shop',
                    filteredSnippetArticles,
                    history: mockHistory,
                    routes: mockRoutes,
                    buildUrlWithParams: mockBuildUrlWithParams,
                } as unknown as UseKnowledgeHubSnippetEditorParams),
            )

            act(() => {
                result.current.openEditorForEdit(3, KnowledgeType.Domain)
            })

            const initialType = result.current.currentSnippetType

            act(() => {
                result.current.handleClickNext()
            })

            expect(result.current.currentSnippetType).toBe(initialType)
        })

        it('calls editor handleClickNext', () => {
            mockEditor.hasNext = false

            const { result } = renderHook(() =>
                useKnowledgeHubSnippetEditor({
                    shopName: 'test-shop',
                    filteredSnippetArticles,
                    history: mockHistory,
                    routes: mockRoutes,
                    buildUrlWithParams: mockBuildUrlWithParams,
                } as unknown as UseKnowledgeHubSnippetEditorParams),
            )

            act(() => {
                result.current.handleClickNext()
            })

            expect(mockEditor.handleClickNext).toHaveBeenCalledTimes(1)
        })
    })

    describe('return values', () => {
        it('exposes all required properties', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubSnippetEditor({
                    shopName: 'test-shop',
                    filteredSnippetArticles,
                    history: mockHistory,
                    routes: mockRoutes,
                    buildUrlWithParams: mockBuildUrlWithParams,
                } as unknown as UseKnowledgeHubSnippetEditorParams),
            )

            expect(result.current).toHaveProperty('isEditorOpen')
            expect(result.current).toHaveProperty('currentArticleId')
            expect(result.current).toHaveProperty('currentSnippetType')
            expect(result.current).toHaveProperty('openEditorForEdit')
            expect(result.current).toHaveProperty('closeEditor')
            expect(result.current).toHaveProperty('handleUpdate')
            expect(result.current).toHaveProperty('hasPrevious')
            expect(result.current).toHaveProperty('hasNext')
            expect(result.current).toHaveProperty('handleClickPrevious')
            expect(result.current).toHaveProperty('handleClickNext')
        })

        it('forwards editor properties correctly', () => {
            mockEditor.isEditorOpen = true
            mockEditor.currentArticleId = 123
            mockEditor.hasPrevious = true
            mockEditor.hasNext = true

            const { result } = renderHook(() =>
                useKnowledgeHubSnippetEditor({
                    shopName: 'test-shop',
                    filteredSnippetArticles,
                    history: mockHistory,
                    routes: mockRoutes,
                    buildUrlWithParams: mockBuildUrlWithParams,
                } as unknown as UseKnowledgeHubSnippetEditorParams),
            )

            expect(result.current.isEditorOpen).toBe(true)
            expect(result.current.currentArticleId).toBe(123)
            expect(result.current.hasPrevious).toBe(true)
            expect(result.current.hasNext).toBe(true)
        })
    })
})
