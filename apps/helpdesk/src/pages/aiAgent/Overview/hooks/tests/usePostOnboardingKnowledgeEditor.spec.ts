import { renderHook } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'

import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'
import type { GuidanceTemplate } from 'pages/aiAgent/types'

import { usePostOnboardingKnowledgeEditor } from '../usePostOnboardingKnowledgeEditor'

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        PostOnboardingTaskActionDone: 'PostOnboardingTaskActionDone',
    },
}))

const mockUseAiAgentStoreConfigurationContext = jest.fn()

jest.requireMock(
    'pages/aiAgent/providers/AiAgentStoreConfigurationContext',
).useAiAgentStoreConfigurationContext = mockUseAiAgentStoreConfigurationContext

const mockShopName = 'test-shop'
const mockShopType = 'shopify'

describe('usePostOnboardingKnowledgeEditor', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                guidanceHelpCenterId: 42,
            },
            isLoading: false,
        })
    })

    it('should initialize with default state', () => {
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
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

    it('should dispatch notification when guidance is created', async () => {
        const { logEvent } = require('@repo/logging')
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
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

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Guidance saved! You can update or edit it anytime in Knowledge.',
                    hidden: true,
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should dispatch notification when guidance is updated', async () => {
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
                shopName: mockShopName,
                shopType: mockShopType,
            }),
        )

        act(() => {
            result.current.knowledgeEditorProps.onUpdate()
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Guidance saved! You can update or edit it anytime in Knowledge.',
                    hidden: true,
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should close editor and dispatch notification when guidance is deleted', async () => {
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
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

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Guidance successfully deleted.',
                    hidden: true,
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should dispatch notification when guidance is duplicated', async () => {
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
                shopName: mockShopName,
                shopType: mockShopType,
            }),
        )

        act(() => {
            result.current.knowledgeEditorProps.onCopy()
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Guidance successfully duplicated.',
                    hidden: true,
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should include guidanceHelpCenterId from store configuration', () => {
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
                shopName: mockShopName,
                shopType: mockShopType,
            }),
        )

        expect(result.current.knowledgeEditorProps.guidanceHelpCenterId).toBe(
            42,
        )
    })

    it('should default guidanceHelpCenterId to 0 when store configuration is not available', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: null,
            isLoading: true,
        })

        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
                shopName: mockShopName,
                shopType: mockShopType,
            }),
        )

        expect(result.current.knowledgeEditorProps.guidanceHelpCenterId).toBe(0)
    })

    it('should return knowledgeEditorProps with correct values', () => {
        const { result } = renderHook(() =>
            usePostOnboardingKnowledgeEditor({
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
