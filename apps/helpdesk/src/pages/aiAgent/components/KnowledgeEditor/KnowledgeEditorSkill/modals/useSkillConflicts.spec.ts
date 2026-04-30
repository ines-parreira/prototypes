import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import type { ConflictingSkill } from '../hooks/useSkillIntentConflicts'
import { useSkillConflicts } from './useSkillConflicts'

const mockUpdateGuidanceArticle = jest.fn()
const mockRebasePublishGuidanceArticle = jest.fn()
const mockGetGuidanceArticleTranslation = jest.fn()
const mockRemoveQueries = jest.fn()
const mockInvalidateQueries = jest.fn()

const mockConflictsBySkill: ConflictingSkill[] = []
const mockAffectedArticleIds: number[] = []
let mockHasConflicts = false
const mockPublishedIntentIds = new Set<string>()

jest.mock('../context', () => ({
    useSkillEditorStore: jest.fn((selector: Function) =>
        selector(mockStoreState),
    ),
}))

jest.mock('../hooks/useSkillIntentConflicts', () => ({
    useSkillIntentConflicts: () => ({
        conflictsBySkill: mockConflictsBySkill,
        affectedArticleIds: mockAffectedArticleIds,
        hasConflicts: mockHasConflicts,
        publishedIntentIds: mockPublishedIntentIds,
    }),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: () => ({
        updateGuidanceArticle: mockUpdateGuidanceArticle,
        rebasePublishGuidanceArticle: mockRebasePublishGuidanceArticle,
        getGuidanceArticleTranslation: mockGetGuidanceArticleTranslation,
    }),
}))

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: () => ({
        removeQueries: mockRemoveQueries,
        invalidateQueries: mockInvalidateQueries,
    }),
}))

jest.mock('models/helpCenter/queries', () => ({
    helpCenterKeys: {
        article: (helpCenterId: number, articleId: number) => [
            'help-center',
            helpCenterId,
            articleId,
        ],
        detail: (helpCenterId: number) => ['help-center', helpCenterId],
    },
}))

jest.mock('models/api/types', () => ({
    isGorgiasApiError: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    getAiAgentNavigationRoutes: (shopName: string) => ({
        skillDetail: (id: number) => `/app/${shopName}/ai-agent/skills/${id}`,
    }),
}))

let mockStoreState: Record<string, unknown>

const createStoreState = (overrides: Record<string, unknown> = {}) => ({
    state: {
        intents: ['order::status', 'order::cancel'],
        ...overrides,
    },
    config: {
        shopName: 'test-shop',
        helpCenter: { id: 1, default_locale: 'en-US' },
    },
})

describe('useSkillConflicts', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockStoreState = createStoreState()
        mockConflictsBySkill.length = 0
        mockAffectedArticleIds.length = 0
        mockHasConflicts = false
        mockPublishedIntentIds.clear()
    })

    describe('bannerType', () => {
        it('returns none when no conflicts and no removed intents', () => {
            const { result } = renderHook(() => useSkillConflicts())

            expect(result.current.bannerType).toBe('none')
        })

        it('returns skills-disabled when a conflicting skill loses all intents', () => {
            mockConflictsBySkill.push({
                articleId: 10,
                title: 'Other Skill',
                conflictingIntents: ['order::status', 'order::cancel'],
                totalIntents: 2,
            })
            mockHasConflicts = true

            const { result } = renderHook(() => useSkillConflicts())

            expect(result.current.bannerType).toBe('skills-disabled')
        })

        it('returns intents-affected when conflicts exist but no skills fully disabled', () => {
            mockConflictsBySkill.push({
                articleId: 10,
                title: 'Other Skill',
                conflictingIntents: ['order::status'],
                totalIntents: 3,
            })
            mockHasConflicts = true

            const { result } = renderHook(() => useSkillConflicts())

            expect(result.current.bannerType).toBe('intents-affected')
        })

        it('returns intents-affected when published intents are removed from draft', () => {
            mockPublishedIntentIds.add('order::refund')
            mockStoreState = createStoreState({
                intents: ['order::status'],
            })

            const { result } = renderHook(() => useSkillConflicts())

            expect(result.current.bannerType).toBe('intents-affected')
        })
    })

    describe('skillsToDisableInfo', () => {
        it('returns empty array when no skills to disable', () => {
            const { result } = renderHook(() => useSkillConflicts())

            expect(result.current.skillsToDisableInfo).toEqual([])
        })

        it('includes id, title, and url for skills to disable', () => {
            mockConflictsBySkill.push({
                articleId: 10,
                title: 'Disabled Skill',
                conflictingIntents: ['order::status'],
                totalIntents: 1,
            })
            mockHasConflicts = true

            const { result } = renderHook(() => useSkillConflicts())

            expect(result.current.skillsToDisableInfo).toEqual([
                {
                    id: 10,
                    title: 'Disabled Skill',
                    url: '/app/test-shop/ai-agent/skills/10',
                },
            ])
        })
    })

    describe('resolveAllConflicts', () => {
        it('calls resolveConflictingSkill for each conflicting skill', async () => {
            const skillToDisable: ConflictingSkill = {
                articleId: 10,
                title: 'Skill A',
                conflictingIntents: ['order::status'],
                totalIntents: 1,
            }
            const skillToUpdate: ConflictingSkill = {
                articleId: 20,
                title: 'Skill B',
                conflictingIntents: ['order::cancel'],
                totalIntents: 3,
            }
            mockConflictsBySkill.push(skillToDisable, skillToUpdate)
            mockHasConflicts = true

            mockGetGuidanceArticleTranslation.mockResolvedValue({
                locale: 'en-US',
                intents: ['order::status', 'order::refund'],
            })
            mockRebasePublishGuidanceArticle.mockResolvedValue(undefined)
            mockUpdateGuidanceArticle.mockResolvedValue(undefined)

            const { result } = renderHook(() => useSkillConflicts())

            await act(async () => {
                await result.current.resolveAllConflicts()
            })

            expect(mockGetGuidanceArticleTranslation).toHaveBeenCalledTimes(2)
            expect(mockRebasePublishGuidanceArticle).toHaveBeenCalledTimes(2)
        })

        it('disables skills that lose all intents', async () => {
            mockConflictsBySkill.push({
                articleId: 10,
                title: 'Skill A',
                conflictingIntents: ['order::status'],
                totalIntents: 1,
            })
            mockHasConflicts = true

            mockGetGuidanceArticleTranslation.mockResolvedValue({
                locale: 'en-US',
                intents: ['order::status'],
            })
            mockRebasePublishGuidanceArticle.mockResolvedValue(undefined)
            mockUpdateGuidanceArticle.mockResolvedValue(undefined)

            const { result } = renderHook(() => useSkillConflicts())

            await act(async () => {
                await result.current.resolveAllConflicts()
            })

            expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                { visibility: 'UNLISTED', isCurrent: false },
                { articleId: 10, locale: 'en-US' },
            )
        })

        it('falls back to updateGuidanceArticle when rebase fails with cannot-rebase error', async () => {
            const { isGorgiasApiError } = jest.requireMock('models/api/types')
            isGorgiasApiError.mockReturnValue(true)

            mockConflictsBySkill.push({
                articleId: 10,
                title: 'Skill A',
                conflictingIntents: ['order::status'],
                totalIntents: 3,
            })
            mockHasConflicts = true

            mockGetGuidanceArticleTranslation.mockResolvedValue({
                locale: 'en-US',
                intents: ['order::status', 'order::cancel', 'order::refund'],
            })

            const rebaseError = {
                response: {
                    data: {
                        error: {
                            msg: 'Cannot rebase draft',
                        },
                    },
                },
            }
            mockRebasePublishGuidanceArticle.mockRejectedValue(rebaseError)
            mockUpdateGuidanceArticle.mockResolvedValue(undefined)

            const { result } = renderHook(() => useSkillConflicts())

            await act(async () => {
                await result.current.resolveAllConflicts()
            })

            expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                {
                    intents: ['order::cancel', 'order::refund'],
                    isCurrent: true,
                },
                { articleId: 10, locale: 'en-US' },
            )
        })
    })

    describe('invalidateAffectedCaches', () => {
        it('calls removeQueries and invalidateQueries for affected articles', () => {
            mockAffectedArticleIds.push(10, 20)

            const { result } = renderHook(() => useSkillConflicts())

            result.current.invalidateAffectedCaches()

            expect(mockRemoveQueries).toHaveBeenCalledTimes(2)
            expect(mockRemoveQueries).toHaveBeenCalledWith([
                'help-center',
                1,
                10,
            ])
            expect(mockRemoveQueries).toHaveBeenCalledWith([
                'help-center',
                1,
                20,
            ])
            expect(mockInvalidateQueries).toHaveBeenCalledWith([
                'help-center',
                1,
            ])
        })

        it('does not call removeQueries when no affected articles', () => {
            const { result } = renderHook(() => useSkillConflicts())

            result.current.invalidateAffectedCaches()

            expect(mockRemoveQueries).not.toHaveBeenCalled()
            expect(mockInvalidateQueries).toHaveBeenCalledWith([
                'help-center',
                1,
            ])
        })
    })
})
