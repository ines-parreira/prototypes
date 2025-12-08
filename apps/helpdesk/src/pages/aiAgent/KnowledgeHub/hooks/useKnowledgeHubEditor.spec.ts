import { logEvent, SegmentEvent } from '@repo/logging'
import { act, renderHook } from '@testing-library/react'

import { useNotify } from 'hooks/useNotify'
import { InitialArticleMode } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/KnowledgeEditorHelpCenterExistingArticle'
import type { GuidanceTemplate } from 'pages/aiAgent/types'

import { REFETCH_KNOWLEDGE_HUB_TABLE } from '../constants'
import { dispatchDocumentEvent } from '../EmptyState/utils'
import type { KnowledgeEditorConfig } from './useKnowledgeHubEditor'
import { useKnowledgeHubEditor } from './useKnowledgeHubEditor'

jest.mock('@repo/logging')
jest.mock('hooks/useNotify')
jest.mock('../EmptyState/utils')

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>
const mockUseNotify = useNotify as jest.MockedFunction<typeof useNotify>
const mockDispatchDocumentEvent = dispatchDocumentEvent as jest.MockedFunction<
    typeof dispatchDocumentEvent
>

describe('useKnowledgeHubEditor', () => {
    let mockNotifySuccess: jest.Mock

    const mockFilteredArticles = [
        { id: 1, title: 'Article 1' },
        { id: 2, title: 'Article 2' },
        { id: 3, title: 'Article 3' },
    ]

    beforeEach(() => {
        mockNotifySuccess = jest.fn()
        mockUseNotify.mockReturnValue({
            success: mockNotifySuccess,
            error: jest.fn(),
            info: jest.fn(),
            warning: jest.fn(),
            notify: jest.fn(),
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Guidance editor', () => {
        const guidanceConfig: KnowledgeEditorConfig = {
            type: 'guidance',
            shopName: 'Test Shop',
            shopType: 'ecommerce',
            filteredArticles: mockFilteredArticles,
        }

        describe('When editor is initialized', () => {
            it('should be closed with no article selected', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(guidanceConfig),
                )

                expect(result.current.isEditorOpen).toBe(false)
                expect(result.current.currentArticleId).toBeUndefined()
                expect(result.current.editorMode).toBe('create')
            })

            it('should provide guidance-specific state', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(guidanceConfig),
                )

                expect(result.current.editorType).toBe('guidance')
                expect(result.current.guidanceMode).toBe('create')
                expect(result.current.guidanceTemplate).toBeUndefined()
                expect(result.current.shopType).toBe('ecommerce')
            })

            it('should have no navigation available', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(guidanceConfig),
                )

                expect(result.current.hasPrevious).toBe(false)
                expect(result.current.hasNext).toBe(false)
            })
        })

        describe('When creating new guidance', () => {
            it('should open editor in create mode', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(guidanceConfig),
                )

                act(() => {
                    result.current.openEditorForCreate()
                })

                expect(result.current.isEditorOpen).toBe(true)
                expect(result.current.editorMode).toBe('create')
                expect(result.current.currentArticleId).toBeUndefined()
            })

            it('should allow creating from a template', () => {
                const mockTemplate: GuidanceTemplate = {
                    id: 'refund-policy',
                    name: 'Refund Policy',
                    content: 'Process refunds within 30 days',
                    tag: 'refunds',
                    style: { color: '#000000', background: '#ffffff' },
                }

                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(guidanceConfig),
                )

                act(() => {
                    result.current.openEditorForCreate(mockTemplate)
                })

                expect(result.current.isEditorOpen).toBe(true)
                expect(result.current.guidanceTemplate).toEqual(mockTemplate)
            })
        })

        describe('When editing existing guidance', () => {
            it('should open editor in read mode with selected article', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(guidanceConfig),
                )

                act(() => {
                    result.current.openEditorForEdit(2)
                })

                expect(result.current.isEditorOpen).toBe(true)
                expect(result.current.editorMode).toBe('read')
                expect(result.current.currentArticleId).toBe(2)
                expect(result.current.guidanceTemplate).toBeUndefined()
            })

            it('should enable navigation to adjacent articles', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(guidanceConfig),
                )

                act(() => {
                    result.current.openEditorForEdit(2)
                })

                expect(result.current.hasPrevious).toBe(true)
                expect(result.current.hasNext).toBe(true)
            })
        })

        describe('When guidance is created', () => {
            it('should track analytics event with correct metadata', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(guidanceConfig),
                )

                act(() => {
                    result.current.handleCreate()
                })

                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentGuidanceCreated,
                    {
                        source: 'knowledge_hub',
                        shop_name: 'Test Shop',
                        type: 'guidance',
                    },
                )
            })

            it('should show success notification', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(guidanceConfig),
                )

                act(() => {
                    result.current.handleCreate()
                })

                expect(mockNotifySuccess).toHaveBeenCalledWith(
                    'Guidance created successfully',
                )
            })

            it('should trigger table refresh', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(guidanceConfig),
                )

                act(() => {
                    result.current.handleCreate()
                })

                expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                    REFETCH_KNOWLEDGE_HUB_TABLE,
                )
            })
        })

        describe('When guidance is updated', () => {
            it('should track analytics event and show success notification', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(guidanceConfig),
                )

                act(() => {
                    result.current.handleUpdate()
                })

                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentGuidanceEdited,
                    {
                        source: 'knowledge_hub',
                        shop_name: 'Test Shop',
                        type: 'guidance',
                    },
                )
                expect(mockNotifySuccess).toHaveBeenCalledWith(
                    'Guidance updated successfully',
                )
                expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                    REFETCH_KNOWLEDGE_HUB_TABLE,
                )
            })
        })

        describe('When guidance is deleted', () => {
            it('should close editor after deletion', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(guidanceConfig),
                )

                act(() => {
                    result.current.openEditorForEdit(2)
                })

                expect(result.current.isEditorOpen).toBe(true)

                act(() => {
                    result.current.handleDelete()
                })

                expect(result.current.isEditorOpen).toBe(false)
            })

            it('should track analytics event and show success notification', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(guidanceConfig),
                )

                act(() => {
                    result.current.handleDelete()
                })

                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentKnowledgeContentEdited,
                    {
                        source: 'knowledge_hub',
                        shop_name: 'Test Shop',
                        type: 'guidance',
                    },
                )
                expect(mockNotifySuccess).toHaveBeenCalledWith(
                    'Guidance deleted successfully',
                )
            })
        })

        describe('When closing editor', () => {
            it('should reset all state to initial values', () => {
                const mockTemplate: GuidanceTemplate = {
                    id: 'test-template',
                    name: 'Test Template',
                    content: 'Test content',
                    tag: 'test',
                    style: { color: '#000000', background: '#ffffff' },
                }

                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(guidanceConfig),
                )

                act(() => {
                    result.current.openEditorForCreate(mockTemplate)
                })

                expect(result.current.isEditorOpen).toBe(true)
                expect(result.current.guidanceTemplate).toBeDefined()

                act(() => {
                    result.current.closeEditor()
                })

                expect(result.current.isEditorOpen).toBe(false)
                expect(result.current.currentArticleId).toBeUndefined()
                expect(result.current.editorMode).toBe('create')
                expect(result.current.guidanceTemplate).toBeUndefined()
            })
        })
    })

    describe('FAQ editor', () => {
        const faqConfig: KnowledgeEditorConfig = {
            type: 'faq',
            shopName: 'FAQ Shop',
            filteredArticles: mockFilteredArticles,
        }

        describe('When editor is initialized', () => {
            it('should provide FAQ-specific state', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(faqConfig),
                )

                expect(result.current.editorType).toBe('faq')
                expect(result.current.faqArticleMode).toBe('new')
                expect(result.current.initialArticleMode).toBe(
                    InitialArticleMode.READ,
                )
            })
        })

        describe('When creating new FAQ article', () => {
            it('should set article mode to new', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(faqConfig),
                )

                act(() => {
                    result.current.openEditorForCreate()
                })

                expect(result.current.faqArticleMode).toBe('new')
                expect(result.current.isEditorOpen).toBe(true)
            })
        })

        describe('When editing existing FAQ article', () => {
            it('should set article mode to existing in read mode', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(faqConfig),
                )

                act(() => {
                    result.current.openEditorForEdit(1)
                })

                expect(result.current.faqArticleMode).toBe('existing')
                expect(result.current.initialArticleMode).toBe(
                    InitialArticleMode.READ,
                )
            })
        })

        describe('When FAQ article is created', () => {
            it('should track correct analytics event and show success notification', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(faqConfig),
                )

                act(() => {
                    result.current.handleCreate()
                })

                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentKnowledgeContentCreated,
                    {
                        source: 'knowledge_hub',
                        shop_name: 'FAQ Shop',
                        type: 'faq',
                    },
                )
                expect(mockNotifySuccess).toHaveBeenCalledWith(
                    'Help Center article created successfully',
                )
            })
        })

        describe('When FAQ article is updated', () => {
            it('should show appropriate success notification', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(faqConfig),
                )

                act(() => {
                    result.current.handleUpdate()
                })

                expect(mockNotifySuccess).toHaveBeenCalledWith(
                    'Help Center article updated successfully',
                )
            })
        })

        describe('When FAQ article is deleted', () => {
            it('should show appropriate success notification', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(faqConfig),
                )

                act(() => {
                    result.current.handleDelete()
                })

                expect(mockNotifySuccess).toHaveBeenCalledWith(
                    'Help Center article deleted successfully',
                )
            })
        })

        describe('When navigating between FAQ articles', () => {
            it('should maintain existing article mode', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(faqConfig),
                )

                act(() => {
                    result.current.openEditorForEdit(1)
                })

                act(() => {
                    result.current.handleClickNext()
                })

                expect(result.current.faqArticleMode).toBe('existing')
                expect(result.current.initialArticleMode).toBe(
                    InitialArticleMode.READ,
                )
                expect(result.current.currentArticleId).toBe(2)
            })
        })

        describe('When closing FAQ editor', () => {
            it('should reset FAQ-specific state', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(faqConfig),
                )

                act(() => {
                    result.current.openEditorForEdit(1)
                })

                expect(result.current.faqArticleMode).toBe('existing')

                act(() => {
                    result.current.closeEditor()
                })

                expect(result.current.faqArticleMode).toBe('new')
                expect(result.current.initialArticleMode).toBe(
                    InitialArticleMode.READ,
                )
            })
        })
    })

    describe('Snippet editor', () => {
        const snippetConfig: KnowledgeEditorConfig = {
            type: 'snippet',
            shopName: 'Snippet Shop',
            filteredArticles: mockFilteredArticles,
        }

        describe('When editor is initialized', () => {
            it('should provide snippet-specific state', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(snippetConfig),
                )

                expect(result.current.editorType).toBe('snippet')
                expect(result.current.isEditorOpen).toBe(false)
            })
        })

        describe('When snippet is created', () => {
            it('should show snippet-specific success notification', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(snippetConfig),
                )

                act(() => {
                    result.current.handleCreate()
                })

                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentKnowledgeContentCreated,
                    {
                        source: 'knowledge_hub',
                        shop_name: 'Snippet Shop',
                        type: 'snippet',
                    },
                )
                expect(mockNotifySuccess).toHaveBeenCalledWith(
                    'Snippet created successfully',
                )
            })
        })

        describe('When snippet is updated', () => {
            it('should show snippet-specific success notification', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(snippetConfig),
                )

                act(() => {
                    result.current.handleUpdate()
                })

                expect(mockNotifySuccess).toHaveBeenCalledWith(
                    'Snippet updated successfully',
                )
            })
        })

        describe('When snippet is deleted', () => {
            it('should show snippet-specific success notification', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(snippetConfig),
                )

                act(() => {
                    result.current.handleDelete()
                })

                expect(mockNotifySuccess).toHaveBeenCalledWith(
                    'Snippet deleted successfully',
                )
            })
        })
    })

    describe('Article navigation', () => {
        const navigationConfig: KnowledgeEditorConfig = {
            type: 'snippet',
            shopName: 'Test Shop',
            filteredArticles: mockFilteredArticles,
        }

        describe('When viewing first article', () => {
            it('should only allow navigation forward', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(navigationConfig),
                )

                act(() => {
                    result.current.openEditorForEdit(1)
                })

                expect(result.current.hasPrevious).toBe(false)
                expect(result.current.hasNext).toBe(true)
            })

            it('should stay on first article when clicking previous', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(navigationConfig),
                )

                act(() => {
                    result.current.openEditorForEdit(1)
                })

                const currentId = result.current.currentArticleId

                act(() => {
                    result.current.handleClickPrevious()
                })

                expect(result.current.currentArticleId).toBe(currentId)
            })
        })

        describe('When viewing middle article', () => {
            it('should allow navigation in both directions', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(navigationConfig),
                )

                act(() => {
                    result.current.openEditorForEdit(2)
                })

                expect(result.current.hasPrevious).toBe(true)
                expect(result.current.hasNext).toBe(true)
            })

            it('should navigate to previous article', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(navigationConfig),
                )

                act(() => {
                    result.current.openEditorForEdit(2)
                })

                act(() => {
                    result.current.handleClickPrevious()
                })

                expect(result.current.currentArticleId).toBe(1)
                expect(result.current.editorMode).toBe('read')
            })

            it('should navigate to next article', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(navigationConfig),
                )

                act(() => {
                    result.current.openEditorForEdit(2)
                })

                act(() => {
                    result.current.handleClickNext()
                })

                expect(result.current.currentArticleId).toBe(3)
                expect(result.current.editorMode).toBe('read')
            })
        })

        describe('When viewing last article', () => {
            it('should only allow navigation backward', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(navigationConfig),
                )

                act(() => {
                    result.current.openEditorForEdit(3)
                })

                expect(result.current.hasPrevious).toBe(true)
                expect(result.current.hasNext).toBe(false)
            })

            it('should stay on last article when clicking next', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(navigationConfig),
                )

                act(() => {
                    result.current.openEditorForEdit(3)
                })

                const currentId = result.current.currentArticleId

                act(() => {
                    result.current.handleClickNext()
                })

                expect(result.current.currentArticleId).toBe(currentId)
            })
        })

        describe('When article list is empty', () => {
            it('should disable all navigation', () => {
                const emptyConfig: KnowledgeEditorConfig = {
                    type: 'snippet',
                    shopName: 'Test Shop',
                    filteredArticles: [],
                }

                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(emptyConfig),
                )

                expect(result.current.hasPrevious).toBe(false)
                expect(result.current.hasNext).toBe(false)
            })
        })

        describe('When article list has single item', () => {
            it('should disable all navigation', () => {
                const singleConfig: KnowledgeEditorConfig = {
                    type: 'snippet',
                    shopName: 'Test Shop',
                    filteredArticles: [{ id: 1, title: 'Single Article' }],
                }

                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(singleConfig),
                )

                act(() => {
                    result.current.openEditorForEdit(1)
                })

                expect(result.current.hasPrevious).toBe(false)
                expect(result.current.hasNext).toBe(false)
            })
        })

        describe('When viewing article not in filtered list', () => {
            it('should disable all navigation', () => {
                const { result } = renderHook(() =>
                    useKnowledgeHubEditor(navigationConfig),
                )

                act(() => {
                    result.current.openEditorForEdit(999)
                })

                expect(result.current.hasPrevious).toBe(false)
                expect(result.current.hasNext).toBe(false)
            })
        })

        describe('When filtered article list changes', () => {
            it('should recalculate navigation availability', () => {
                const initialArticles = [
                    { id: 1, title: 'Article 1' },
                    { id: 2, title: 'Article 2' },
                ]

                const { result, rerender } = renderHook(
                    ({ articles }) =>
                        useKnowledgeHubEditor({
                            type: 'snippet',
                            shopName: 'Test Shop',
                            filteredArticles: articles,
                        }),
                    { initialProps: { articles: initialArticles } },
                )

                act(() => {
                    result.current.openEditorForEdit(1)
                })

                expect(result.current.hasNext).toBe(true)

                const updatedArticles = [{ id: 1, title: 'Article 1' }]

                rerender({ articles: updatedArticles })

                expect(result.current.hasNext).toBe(false)
            })
        })
    })
})
