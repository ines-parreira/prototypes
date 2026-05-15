import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import { VisibilityStatusEnum } from 'models/helpCenter/types'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import type { EnrichedSkillWizard } from 'pages/aiAgent/skills/hooks/useEnrichedSkillWizard'
import {
    SkillWizardSkillStatus,
    SkillWizardStatus,
} from 'pages/aiAgent/skills/types'

import { useApplyWizardChanges } from './useApplyWizardChanges'
import { useEnableAction } from './useEnableAction'

jest.mock('./useEnableAction')
jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(),
}))

const mockUseEnableAction = useEnableAction as jest.MockedFunction<
    typeof useEnableAction
>
const mockUseGuidanceArticleMutation =
    useGuidanceArticleMutation as jest.MockedFunction<
        typeof useGuidanceArticleMutation
    >

const createDeferred = <T = unknown,>() => {
    let resolve!: (value: T) => void
    let reject!: (err: unknown) => void
    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })
    return { promise, resolve, reject }
}

const buildSkill = (
    id: number,
    title: string,
    guidance_ids: number[] = [],
    action_configuration_ids: string[] = [],
    content: string = '',
): EnrichedSkillWizard['reviewable_skills'][number] =>
    ({
        skill_id: id,
        article: {
            id,
            translation: { title, content, intents: [] },
        },
        guidance_ids,
        recommendation: '',
        estimated_automation_rate_impact: '+1%',
        action_configuration_ids,
    }) as unknown as EnrichedSkillWizard['reviewable_skills'][number]

const buildWizard = (
    reviewable_skills: EnrichedSkillWizard['reviewable_skills'],
    skillsConfiguration: Array<{
        id: number
        status: SkillWizardSkillStatus
    }>,
): EnrichedSkillWizard => ({
    id: 1,
    account_id: 1,
    shop_integration_id: 1,
    help_center_id: 21,
    gaia_payload: {
        analysis_period: {
            start: '2026-03-01T00:00:00.000Z',
            end: '2026-04-27T23:59:59.000Z',
            total_tickets: 0,
        },
        recommendations: [],
    },
    state: { skills_configuration: skillsConfiguration },
    status: SkillWizardStatus.InProgress,
    started_datetime: null,
    completed_datetime: null,
    last_nudge_sent_datetime: null,
    created_datetime: '',
    updated_datetime: '',
    all_skills: reviewable_skills,
    reviewable_skills,
    ui_wizard_state: { total_count: reviewable_skills.length, current_step: 1 },
})

const buildArgs = (
    overrides: Partial<Parameters<typeof useApplyWizardChanges>[0]> = {},
) => {
    const skills = [
        buildSkill(1, 'Returns', [101, 102]),
        buildSkill(2, 'Orders', [201]),
    ]
    return {
        wizard: buildWizard(skills, [
            { id: 1, status: SkillWizardSkillStatus.Approved },
            { id: 2, status: SkillWizardSkillStatus.Approved },
        ]),
        skillOverrides: new Map<number, boolean>(),
        guidanceOverrides: new Map<number, boolean>(),
        guidanceActions: [],
        rawActions: [],
        helpCenterId: 21,
        storeName: 'ekster',
        storeType: 'shopify' as const,
        localeCode: 'en-US' as const,
        ...overrides,
    }
}

describe('useApplyWizardChanges', () => {
    let enableAction: jest.Mock
    let updateGuidanceArticle: jest.Mock

    beforeEach(() => {
        enableAction = jest.fn().mockResolvedValue(undefined)
        updateGuidanceArticle = jest.fn().mockResolvedValue({})
        mockUseEnableAction.mockReturnValue(enableAction)
        mockUseGuidanceArticleMutation.mockReturnValue({
            updateGuidanceArticle,
        } as unknown as ReturnType<typeof useGuidanceArticleMutation>)
    })

    it('publishes enabled skills and disables marked guidances when no actions need enabling', async () => {
        const { result } = renderHook(() => useApplyWizardChanges(buildArgs()))

        expect(result.current.phase).toBe('idle')

        act(() => {
            result.current.apply()
        })

        await waitFor(() => {
            expect(result.current.phase).toBe('success')
        })

        expect(enableAction).not.toHaveBeenCalled()
        // 2 skills published + 3 guidances disabled = 5 calls total
        expect(updateGuidanceArticle).toHaveBeenCalledTimes(5)

        const publishCalls = updateGuidanceArticle.mock.calls.filter(
            ([payload]) => payload.visibility === VisibilityStatusEnum.PUBLIC,
        )
        const disableCalls = updateGuidanceArticle.mock.calls.filter(
            ([payload]) => payload.visibility === VisibilityStatusEnum.UNLISTED,
        )

        expect(publishCalls).toHaveLength(2)
        for (const [payload] of publishCalls) {
            expect(payload).toEqual({
                isCurrent: true,
                visibility: VisibilityStatusEnum.PUBLIC,
            })
        }
        expect(
            new Set(publishCalls.map(([, target]) => target.articleId)),
        ).toEqual(new Set([1, 2]))

        expect(disableCalls).toHaveLength(3)
        for (const [payload] of disableCalls) {
            expect(payload).toEqual({
                isCurrent: false,
                visibility: VisibilityStatusEnum.UNLISTED,
            })
        }
        expect(
            new Set(disableCalls.map(([, target]) => target.articleId)),
        ).toEqual(new Set([101, 102, 201]))

        for (const [, target] of updateGuidanceArticle.mock.calls) {
            expect(target.locale).toBe('en-US')
        }

        expect(result.current.liveSkillsCount).toBe(2)
    })

    it('enables each disabled action on a skill before publishing the skill', async () => {
        const skills = [
            buildSkill(1, 'Returns', [101], ['act-1', 'act-2']),
            buildSkill(2, 'Orders', [201]),
        ]
        const wizard = buildWizard(skills, [
            { id: 1, status: SkillWizardSkillStatus.Approved },
            { id: 2, status: SkillWizardSkillStatus.Approved },
        ])
        const rawActions = [
            { id: 'act-1', name: 'Refund', is_draft: true },
            { id: 'act-2', name: 'Cancel', is_draft: true },
        ] as unknown as Parameters<
            typeof useApplyWizardChanges
        >[0]['rawActions']

        const args = buildArgs({
            wizard,
            rawActions,
            guidanceActions: [
                {
                    name: 'Refund',
                    value: 'act-1',
                    enabled: false,
                    requiresAuth: false,
                    hasMissingValues: false,
                },
                {
                    name: 'Cancel',
                    value: 'act-2',
                    enabled: false,
                    requiresAuth: false,
                    hasMissingValues: false,
                },
            ] as unknown as Parameters<
                typeof useApplyWizardChanges
            >[0]['guidanceActions'],
        })
        // Skill 1 references both actions in its content
        ;(
            args.wizard.reviewable_skills[0] as {
                article: { translation: { content: string } }
            }
        ).article.translation.content = 'Use $$$act-1$$$ and $$$act-2$$$.'

        const { result } = renderHook(() => useApplyWizardChanges(args))

        act(() => {
            result.current.apply()
        })

        await waitFor(() => {
            expect(result.current.phase).toBe('success')
        })

        expect(enableAction).toHaveBeenCalledTimes(2)
        const enabledIds = enableAction.mock.calls.map(
            (call) => call[0].configuration.id,
        )
        expect(new Set(enabledIds)).toEqual(new Set(['act-1', 'act-2']))
        expect(result.current.liveSkillsCount).toBe(2)
    })

    it('excludes a skill from publishing when any of its actions fail to enable', async () => {
        const skills = [
            buildSkill(1, 'Returns', [101], ['act-1']),
            buildSkill(2, 'Orders', [201], ['act-2']),
        ]
        const wizard = buildWizard(skills, [
            { id: 1, status: SkillWizardSkillStatus.Approved },
            { id: 2, status: SkillWizardSkillStatus.Approved },
        ])
        ;(
            skills[0] as { article: { translation: { content: string } } }
        ).article.translation.content = 'Use $$$act-1$$$.'
        ;(
            skills[1] as { article: { translation: { content: string } } }
        ).article.translation.content = 'Use $$$act-2$$$.'

        const args = buildArgs({
            wizard,
            rawActions: [
                { id: 'act-1', name: 'Refund', is_draft: true },
                { id: 'act-2', name: 'Cancel', is_draft: true },
            ] as unknown as Parameters<
                typeof useApplyWizardChanges
            >[0]['rawActions'],
            guidanceActions: [
                {
                    name: 'Refund',
                    value: 'act-1',
                    enabled: false,
                    requiresAuth: false,
                    hasMissingValues: false,
                },
                {
                    name: 'Cancel',
                    value: 'act-2',
                    enabled: false,
                    requiresAuth: false,
                    hasMissingValues: false,
                },
            ] as unknown as Parameters<
                typeof useApplyWizardChanges
            >[0]['guidanceActions'],
        })

        enableAction.mockImplementation(
            ({ configuration }: { configuration: { id: string } }) =>
                configuration.id === 'act-2'
                    ? Promise.reject(new Error('boom'))
                    : Promise.resolve(undefined),
        )

        const { result } = renderHook(() => useApplyWizardChanges(args))

        act(() => {
            result.current.apply()
        })

        await waitFor(() => {
            expect(result.current.phase).toBe('success')
        })

        // Only skill 1 (article id 1) made it to publish
        const publishedArticleIds = updateGuidanceArticle.mock.calls
            .filter(
                ([payload]) =>
                    payload.visibility === VisibilityStatusEnum.PUBLIC,
            )
            .map(([, target]) => target.articleId)
        expect(publishedArticleIds).toEqual([1])
        expect(result.current.liveSkillsCount).toBe(1)
    })

    it('transitions to error when every skill fails action enablement', async () => {
        const skills = [buildSkill(1, 'Returns', [101], ['act-1'])]
        const wizard = buildWizard(skills, [
            { id: 1, status: SkillWizardSkillStatus.Approved },
        ])
        ;(
            skills[0] as { article: { translation: { content: string } } }
        ).article.translation.content = 'Use $$$act-1$$$.'

        const args = buildArgs({
            wizard,
            rawActions: [
                { id: 'act-1', name: 'Refund', is_draft: true },
            ] as unknown as Parameters<
                typeof useApplyWizardChanges
            >[0]['rawActions'],
            guidanceActions: [
                {
                    name: 'Refund',
                    value: 'act-1',
                    enabled: false,
                    requiresAuth: false,
                    hasMissingValues: false,
                },
            ] as unknown as Parameters<
                typeof useApplyWizardChanges
            >[0]['guidanceActions'],
        })

        enableAction.mockRejectedValue(new Error('boom'))

        const { result } = renderHook(() => useApplyWizardChanges(args))

        act(() => {
            result.current.apply()
        })

        await waitFor(() => {
            expect(result.current.phase).toBe('error')
        })

        expect(updateGuidanceArticle).not.toHaveBeenCalled()
    })

    it('transitions through enabling-skills and disabling-guidances before success', async () => {
        const publishDeferred = createDeferred<unknown>()
        const disableDeferred = createDeferred<unknown>()

        updateGuidanceArticle.mockImplementation(
            (payload: { visibility: VisibilityStatusEnum }) =>
                payload.visibility === VisibilityStatusEnum.PUBLIC
                    ? publishDeferred.promise
                    : disableDeferred.promise,
        )

        const { result } = renderHook(() => useApplyWizardChanges(buildArgs()))

        act(() => {
            result.current.apply()
        })

        await waitFor(() => {
            expect(result.current.phase).toBe('enabling-skills')
        })

        await act(async () => {
            publishDeferred.resolve({})
        })

        await waitFor(() => {
            expect(result.current.phase).toBe('disabling-guidances')
        })

        await act(async () => {
            disableDeferred.resolve({})
        })

        await waitFor(() => {
            expect(result.current.phase).toBe('success')
        })
    })

    it('errors if the locale is unavailable when apply runs', async () => {
        const { result } = renderHook(() =>
            useApplyWizardChanges(buildArgs({ localeCode: undefined })),
        )

        act(() => {
            result.current.apply()
        })

        await waitFor(() => {
            expect(result.current.phase).toBe('error')
        })

        expect(updateGuidanceArticle).not.toHaveBeenCalled()
    })
})
