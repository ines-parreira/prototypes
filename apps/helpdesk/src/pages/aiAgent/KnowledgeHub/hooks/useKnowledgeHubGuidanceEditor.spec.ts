import { act, renderHook } from '@testing-library/react'
import type { History, Location } from 'history'

import type {
    FilteredKnowledgeHubArticle,
    GuidanceEditorConfig,
} from '../types'
import type { KnowledgeEditorReturn } from './useKnowledgeHubEditor'
import { useKnowledgeHubGuidanceEditor } from './useKnowledgeHubGuidanceEditor'

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

const { useHistory, useLocation } = jest.requireMock('react-router-dom')
const { useKnowledgeHubEditor } = jest.requireMock('./useKnowledgeHubEditor')

describe('useKnowledgeHubGuidanceEditor', () => {
    const mockEditor: KnowledgeEditorReturn<GuidanceEditorConfig> = {
        editorType: 'guidance',
        isEditorOpen: false,
        currentArticleId: undefined,
        editorMode: 'create',
        guidanceMode: 'create',
        guidanceTemplate: undefined,
        shopName: 'test-shop',
        shopType: 'shopify',
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

    const filteredGuidanceArticles = [
        { id: 1, title: 'First Guidance Article', visibility: 'PUBLIC' },
        { id: 2, title: 'Second Guidance Article', visibility: 'PUBLIC' },
        { id: 3, title: 'Third Guidance Article', visibility: 'PUBLIC' },
    ] as unknown as FilteredKnowledgeHubArticle[]

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
    })

    it('initializes with correct parameters', () => {
        renderHook(() =>
            useKnowledgeHubGuidanceEditor({
                shopName: 'test-shop',
                shopType: 'shopify',
                filteredGuidanceArticles,
            }),
        )

        expect(useKnowledgeHubEditor).toHaveBeenCalledWith({
            type: 'guidance',
            shopName: 'test-shop',
            shopType: 'shopify',
            filteredArticles: filteredGuidanceArticles,
        })
    })

    describe('knowledgeEditorProps', () => {
        it('includes all required properties', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubGuidanceEditor({
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    filteredGuidanceArticles,
                }),
            )

            expect(result.current.knowledgeEditorProps).toHaveProperty(
                'shopName',
            )
            expect(result.current.knowledgeEditorProps).toHaveProperty(
                'shopType',
            )
            expect(result.current.knowledgeEditorProps).toHaveProperty(
                'guidanceArticleId',
            )
            expect(result.current.knowledgeEditorProps).toHaveProperty(
                'guidanceTemplate',
            )
            expect(result.current.knowledgeEditorProps).toHaveProperty(
                'guidanceMode',
            )
            expect(result.current.knowledgeEditorProps).toHaveProperty('isOpen')
            expect(result.current.knowledgeEditorProps).toHaveProperty(
                'onClose',
            )
            expect(result.current.knowledgeEditorProps).toHaveProperty(
                'onCreate',
            )
            expect(result.current.knowledgeEditorProps).toHaveProperty(
                'onUpdate',
            )
            expect(result.current.knowledgeEditorProps).toHaveProperty(
                'onDelete',
            )
        })

        it('forwards editor properties correctly', () => {
            mockEditor.shopName = 'my-shop'
            mockEditor.shopType = 'bigcommerce'
            mockEditor.currentArticleId = 123
            mockEditor.guidanceTemplate = {
                id: 'template-1',
                name: 'Test Template',
                content: 'Test Content',
                tag: 'test',
                style: { color: '#000', background: '#fff' },
            }
            mockEditor.guidanceMode = 'edit'
            mockEditor.isEditorOpen = true

            const { result } = renderHook(() =>
                useKnowledgeHubGuidanceEditor({
                    shopName: 'my-shop',
                    shopType: 'bigcommerce',
                    filteredGuidanceArticles,
                }),
            )

            expect(result.current.knowledgeEditorProps.shopName).toBe('my-shop')
            expect(result.current.knowledgeEditorProps.shopType).toBe(
                'bigcommerce',
            )
            expect(result.current.knowledgeEditorProps.guidanceArticleId).toBe(
                123,
            )
            expect(result.current.knowledgeEditorProps.guidanceTemplate).toBe(
                mockEditor.guidanceTemplate,
            )
            expect(result.current.knowledgeEditorProps.guidanceMode).toBe(
                'edit',
            )
            expect(result.current.knowledgeEditorProps.isOpen).toBe(true)
        })

        it('forwards editor callbacks correctly', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubGuidanceEditor({
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    filteredGuidanceArticles,
                }),
            )

            act(() => {
                result.current.knowledgeEditorProps.onClose()
            })
            expect(mockEditor.closeEditor).toHaveBeenCalledTimes(1)

            act(() => {
                result.current.knowledgeEditorProps.onCreate()
            })
            expect(mockEditor.handleCreate).toHaveBeenCalledTimes(1)

            act(() => {
                result.current.knowledgeEditorProps.onUpdate()
            })
            expect(mockEditor.handleUpdate).toHaveBeenCalledTimes(1)

            act(() => {
                result.current.knowledgeEditorProps.onDelete()
            })
            expect(mockEditor.handleDelete).toHaveBeenCalledTimes(1)
        })
    })

    describe('return values', () => {
        it('exposes all required properties', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubGuidanceEditor({
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    filteredGuidanceArticles,
                }),
            )

            expect(result.current).toHaveProperty('isEditorOpen')
            expect(result.current).toHaveProperty('currentGuidanceArticleId')
            expect(result.current).toHaveProperty('guidanceMode')
            expect(result.current).toHaveProperty('openEditorForCreate')
            expect(result.current).toHaveProperty('openEditorForEdit')
            expect(result.current).toHaveProperty('closeEditor')
            expect(result.current).toHaveProperty('knowledgeEditorProps')
        })

        it('forwards editor state correctly', () => {
            mockEditor.isEditorOpen = true
            mockEditor.currentArticleId = 456
            mockEditor.guidanceMode = 'read'

            const { result } = renderHook(() =>
                useKnowledgeHubGuidanceEditor({
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    filteredGuidanceArticles,
                }),
            )

            expect(result.current.isEditorOpen).toBe(true)
            expect(result.current.currentGuidanceArticleId).toBe(456)
            expect(result.current.guidanceMode).toBe('read')
        })

        it('forwards editor actions correctly', () => {
            const { result } = renderHook(() =>
                useKnowledgeHubGuidanceEditor({
                    shopName: 'test-shop',
                    shopType: 'shopify',
                    filteredGuidanceArticles,
                }),
            )

            const testTemplate = {
                id: 'template-1',
                name: 'Test Template',
                content: 'Test Content',
                tag: 'test',
                style: { color: '#000', background: '#fff' },
            }

            act(() => {
                result.current.openEditorForCreate(testTemplate)
            })
            expect(mockEditor.openEditorForCreate).toHaveBeenCalledWith(
                testTemplate,
            )

            act(() => {
                result.current.openEditorForEdit(789)
            })
            expect(mockEditor.openEditorForEdit).toHaveBeenCalledWith(789)

            act(() => {
                result.current.closeEditor()
            })
            expect(mockEditor.closeEditor).toHaveBeenCalledTimes(1)
        })
    })
})
