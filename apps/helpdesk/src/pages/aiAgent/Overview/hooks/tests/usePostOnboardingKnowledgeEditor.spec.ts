import { act, renderHook } from '@repo/testing'

import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'
import type { GuidanceTemplate } from 'pages/aiAgent/types'

import { usePostOnboardingKnowledgeEditor } from '../usePostOnboardingKnowledgeEditor'

jest.mock('hooks/useAppDispatch')
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        PostOnboardingTaskActionDone: 'PostOnboardingTaskActionDone',
    },
}))

const mockDispatch = jest.fn()
const mockUseAppDispatch = jest.fn()
const mockUseAiAgentNavigation = jest.fn()

jest.requireMock('hooks/useAppDispatch').default = mockUseAppDispatch
jest.requireMock(
    'pages/aiAgent/hooks/useAiAgentNavigation',
).useAiAgentNavigation = mockUseAiAgentNavigation

const mockShopName = 'test-shop'
const mockShopType = 'shopify'
const mockRoutes = {
    knowledge: '/test-shop/knowledge',
}

describe('usePostOnboardingKnowledgeEditor', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockUseAiAgentNavigation.mockReturnValue({ routes: mockRoutes })
    })

    it('should initialize with default state', () => {
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
                guidanceArticles: [],
                shopName: mockShopName,
                shopType: mockShopType,
            }),
        )

        expect(result.current.isEditorOpen).toBe(false)
        expect(result.current.currentGuidanceArticleId).toBeUndefined()
        expect(result.current.guidanceMode).toBe('create')
    })

    it('should open editor in create mode', () => {
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
                guidanceArticles: [],
                shopName: mockShopName,
                shopType: mockShopType,
            }),
        )

        act(() => {
            result.current.openEditorForCreate()
        })

        expect(result.current.isEditorOpen).toBe(true)
        expect(result.current.guidanceMode).toBe('create')
        expect(result.current.currentGuidanceArticleId).toBeUndefined()
    })

    it('should open editor in create mode with template', () => {
        const mockTemplate = {
            id: 'test-template',
            name: 'Test Template',
        } as GuidanceTemplate
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
                guidanceArticles: [],
                shopName: mockShopName,
                shopType: mockShopType,
            }),
        )

        act(() => {
            result.current.openEditorForCreate(mockTemplate)
        })

        expect(result.current.isEditorOpen).toBe(true)
        expect(result.current.guidanceMode).toBe('create')
        expect(result.current.knowledgeEditorProps.guidanceTemplate).toEqual(
            mockTemplate,
        )
    })

    it('should open editor in edit mode', () => {
        const mockArticleId = 123
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
                guidanceArticles: [],
                shopName: mockShopName,
                shopType: mockShopType,
            }),
        )

        act(() => {
            result.current.openEditorForEdit(mockArticleId)
        })

        expect(result.current.isEditorOpen).toBe(true)
        expect(result.current.guidanceMode).toBe('edit')
        expect(result.current.currentGuidanceArticleId).toBe(mockArticleId)
    })

    it('should close editor and reset state', () => {
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
                guidanceArticles: [],
                shopName: mockShopName,
                shopType: mockShopType,
            }),
        )

        act(() => {
            result.current.openEditorForCreate()
        })

        expect(result.current.isEditorOpen).toBe(true)

        act(() => {
            result.current.closeEditor()
        })

        expect(result.current.isEditorOpen).toBe(false)
        expect(result.current.currentGuidanceArticleId).toBeUndefined()
    })

    it('should dispatch notification when guidance is created', () => {
        const { logEvent } = require('@repo/logging')
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
                guidanceArticles: [],
                shopName: mockShopName,
                shopType: mockShopType,
            }),
        )

        act(() => {
            result.current.knowledgeEditorProps.onCreate()
        })

        expect(logEvent).toHaveBeenCalledWith('PostOnboardingTaskActionDone', {
            step: StepName.TRAIN,
            action: 'created_guidance',
            shop_name: mockShopName,
            shop_type: mockShopType,
        })

        expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should dispatch notification when guidance is updated', () => {
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
                guidanceArticles: [],
                shopName: mockShopName,
                shopType: mockShopType,
            }),
        )

        act(() => {
            result.current.knowledgeEditorProps.onUpdate()
        })

        expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should close editor and dispatch notification when guidance is deleted', () => {
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
                guidanceArticles: [],
                shopName: mockShopName,
                shopType: mockShopType,
            }),
        )

        act(() => {
            result.current.openEditorForEdit(123)
        })

        expect(result.current.isEditorOpen).toBe(true)

        act(() => {
            result.current.knowledgeEditorProps.onDelete()
        })

        expect(result.current.isEditorOpen).toBe(false)
        expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should dispatch notification when guidance is duplicated', () => {
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
                guidanceArticles: [],
                shopName: mockShopName,
                shopType: mockShopType,
            }),
        )

        act(() => {
            result.current.knowledgeEditorProps.onCopy()
        })

        expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should return knowledgeEditorProps with correct values', () => {
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
                guidanceArticles: [],
                shopName: mockShopName,
                shopType: mockShopType,
            }),
        )

        const { knowledgeEditorProps } = result.current

        expect(knowledgeEditorProps.shopName).toBe(mockShopName)
        expect(knowledgeEditorProps.shopType).toBe(mockShopType)
        expect(knowledgeEditorProps.variant).toBe('guidance')
        expect(knowledgeEditorProps.isOpen).toBe(false)
        expect(knowledgeEditorProps.guidanceMode).toBe('create')
        expect(typeof knowledgeEditorProps.onClose).toBe('function')
        expect(typeof knowledgeEditorProps.onCreate).toBe('function')
        expect(typeof knowledgeEditorProps.onUpdate).toBe('function')
        expect(typeof knowledgeEditorProps.onDelete).toBe('function')
        expect(typeof knowledgeEditorProps.onCopy).toBe('function')
    })
})
