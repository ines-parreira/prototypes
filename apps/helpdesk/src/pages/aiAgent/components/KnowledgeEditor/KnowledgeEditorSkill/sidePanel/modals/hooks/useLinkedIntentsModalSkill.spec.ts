import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import type { SkillIntentItem } from './useLinkedIntentsModalSkill'
import { useLinkedIntentsModalSkill } from './useLinkedIntentsModalSkill'

const mockPersistLinkedIntents = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ shopName: 'test-shop' }),
}))

jest.mock('../../hooks/usePersistLinkedIntentsSkill', () => ({
    usePersistLinkedIntentsSkill: () => ({
        persistLinkedIntents: mockPersistLinkedIntents,
        isUpdating: false,
    }),
}))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/context/KnowledgeEditorSkillContext',
    () => ({
        useSkillEditorStore: (selector: Function) =>
            selector({
                state: {
                    intents: ['order::status'],
                    skill: {
                        id: 100,
                        locale: 'en',
                        intents: ['order::status'],
                    },
                },
                skill: { id: 100, locale: 'en' },
                config: {
                    helpCenter: { id: 456, shop_integration_id: 789 },
                },
            }),
    }),
)

jest.mock('models/helpCenter/queries', () => ({
    useListIntents: () => ({
        data: {
            intents: [
                {
                    name: 'order::status',
                    status: 'linked',
                    help_center_id: 456,
                    articles: [],
                },
                {
                    name: 'order::cancel',
                    status: 'linked',
                    help_center_id: 456,
                    articles: [
                        {
                            id: 200,
                            locale: 'en',
                            article_translation_version_id: 1,
                            title: 'Other Skill',
                            status: 'published',
                            template_key: null,
                            visibility_status: 'PUBLIC',
                        },
                    ],
                },
                {
                    name: 'other::spam',
                    status: 'handover',
                    help_center_id: 456,
                    articles: [],
                },
            ],
        },
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
    }),
}))

jest.mock('pages/aiAgent/skills/hooks/useIntentsMetrics', () => ({
    useIntentsMetrics: () => ({
        data: new Map([
            [
                'order::status',
                {
                    ticketVolume: 100,
                    ticketVolumePercent: 50,
                    handoverCount: 0,
                    handoverPercent: 0,
                },
            ],
        ]),
        isLoading: false,
    }),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    getAiAgentNavigationRoutes: () => ({
        skillDetail: (id: number) => `/skills/${id}`,
    }),
}))

describe('useLinkedIntentsModalSkill', () => {
    afterEach(() => jest.clearAllMocks())

    it('initializes with current skill intents selected', () => {
        const { result } = renderHook(() =>
            useLinkedIntentsModalSkill(true, jest.fn()),
        )

        expect(result.current.draftIntentIds).toEqual(['order::status'])
    })

    it('toggles an intent', () => {
        const { result } = renderHook(() =>
            useLinkedIntentsModalSkill(true, jest.fn()),
        )

        act(() => {
            result.current.toggleIntent({
                intent: 'order::cancel',
                name: 'Order Cancel',
                is_available: true,
            } as SkillIntentItem)
        })

        expect(result.current.draftIntentIds).toContain('order::cancel')
    })

    it('does not toggle handover-only intents', () => {
        const { result } = renderHook(() =>
            useLinkedIntentsModalSkill(true, jest.fn()),
        )

        act(() => {
            result.current.toggleIntent({
                intent: 'other::spam',
                name: 'Spam',
                is_available: true,
            } as SkillIntentItem)
        })

        expect(result.current.draftIntentIds).not.toContain('other::spam')
    })

    it('detects conflicts when selecting intents linked to other skills', () => {
        const { result } = renderHook(() =>
            useLinkedIntentsModalSkill(true, jest.fn()),
        )

        act(() => {
            result.current.toggleIntent({
                intent: 'order::cancel',
                name: 'Order Cancel',
                is_available: true,
                used_by_article: {
                    id: 200,
                    version: 1,
                    title: 'Other Skill',
                    locale: 'en',
                },
            } as SkillIntentItem)
        })

        expect(result.current.hasConflicts).toBe(true)
    })

    it('reports hasChanges when selection differs from initial', () => {
        const { result } = renderHook(() =>
            useLinkedIntentsModalSkill(true, jest.fn()),
        )

        expect(result.current.hasChanges).toBe(false)

        act(() => {
            result.current.toggleIntent({
                intent: 'order::cancel',
                name: 'Order Cancel',
                is_available: true,
            } as SkillIntentItem)
        })

        expect(result.current.hasChanges).toBe(true)
    })

    it('returns per-intent ticket volume', () => {
        const { result } = renderHook(() =>
            useLinkedIntentsModalSkill(true, jest.fn()),
        )

        expect(result.current.intentTicketVolumeById['order::status']).toBe(100)
    })

    it('filters groups by search value', () => {
        const { result } = renderHook(() =>
            useLinkedIntentsModalSkill(true, jest.fn()),
        )

        act(() => {
            result.current.setSearchValue('cancel')
        })

        expect(result.current.filteredGroups).toHaveLength(1)
        expect(result.current.filteredGroups[0].children).toHaveLength(1)
        expect(result.current.filteredGroups[0].children[0].intent).toBe(
            'order::cancel',
        )
    })
})
