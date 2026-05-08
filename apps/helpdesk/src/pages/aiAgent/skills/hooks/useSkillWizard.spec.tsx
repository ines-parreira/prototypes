import type React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import type { SkillWizard } from 'pages/aiAgent/skills/components/SkillWizard/skillWizard.mock'
import {
    SkillWizardSkillStatus,
    SkillWizardStatus,
    SkillWizardStep,
} from 'pages/aiAgent/skills/components/SkillWizard/skillWizard.mock'

import { useSkillWizard } from './useSkillWizard'

jest.mock('models/helpCenter/queries', () => ({
    useGetHelpCenterArticleList: jest.fn(),
}))

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
    () => ({
        useGetGuidancesAvailableActions: jest.fn(),
    }),
)

const mockUseGetHelpCenterArticleList = useGetHelpCenterArticleList as jest.Mock
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock
const mockUseGetGuidancesAvailableActions =
    useGetGuidancesAvailableActions as jest.Mock

type ArticleStub = {
    id: number
    help_center_id: number
    translation: { title: string; content: string; intents?: string[] }
}

const makeArticle = (
    id: number,
    options: { title?: string; content?: string; intents?: string[] } = {},
): ArticleStub => ({
    id,
    help_center_id: 7,
    translation: {
        title: options.title ?? `Skill ${id}`,
        content: options.content ?? '',
        intents: options.intents,
    },
})

const baseWizard: SkillWizard = {
    id: 1,
    account_id: 6069,
    shop_integration_id: 7,
    help_center_id: 21,
    gaia_payload: {
        recommendations: [
            {
                skill_id: 5641448,
                estimated_automation_rate_impact: '+4.20%',
                recommendation: 'rec 1',
                guidance_ids: [501],
                action_configuration_ids: ['9001'],
            },
            {
                skill_id: 5891087,
                estimated_automation_rate_impact: '+2.80%',
                recommendation: 'rec 2',
                guidance_ids: [503],
                action_configuration_ids: [],
            },
            {
                skill_id: 5891418,
                estimated_automation_rate_impact: '+1.95%',
                recommendation: 'rec 3',
                guidance_ids: [504],
                action_configuration_ids: [],
            },
            {
                skill_id: 5915217,
                estimated_automation_rate_impact: '+1.60%',
                recommendation: 'rec 4 (no article in account)',
                guidance_ids: [506],
                action_configuration_ids: [],
            },
        ],
    },
    state: {},
    status: SkillWizardStatus.NotStarted,
    started_datetime: null,
    completed_datetime: null,
    last_nudge_sent_datetime: null,
    created_datetime: '2026-04-28T10:15:00.000Z',
    updated_datetime: '2026-04-28T10:15:00.000Z',
}

describe('useSkillWizard', () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            isLoading: false,
            storeConfiguration: {
                guidanceHelpCenterId: 21,
                storeName: 'test-shop',
                shopType: 'shopify',
            },
        })

        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: {
                data: [
                    makeArticle(5641448, { title: 'Order tracking' }),
                    makeArticle(5891087, { title: 'Returns' }),
                    makeArticle(5891418, { title: 'Cancellations' }),
                ],
            },
            isLoading: false,
            isError: false,
        })

        mockUseGetGuidancesAvailableActions.mockReturnValue({
            isLoading: false,
            guidanceActions: [],
            rawActions: [],
        })
    })

    it('passes the original wizard fields through', () => {
        const { result } = renderHook(() => useSkillWizard(baseWizard), {
            wrapper,
        })

        expect(result.current.wizard.id).toBe(baseWizard.id)
        expect(result.current.wizard.account_id).toBe(baseWizard.account_id)
        expect(result.current.wizard.shop_integration_id).toBe(
            baseWizard.shop_integration_id,
        )
        expect(result.current.wizard.help_center_id).toBe(
            baseWizard.help_center_id,
        )
        expect(result.current.wizard.status).toBe(baseWizard.status)
        expect(result.current.wizard.created_datetime).toBe(
            baseWizard.created_datetime,
        )
    })

    it('builds all_skills for every recommendation, with null article when missing', () => {
        const { result } = renderHook(() => useSkillWizard(baseWizard), {
            wrapper,
        })

        const ids = result.current.wizard.all_skills.map((s) => s.skill_id)
        expect(ids).toEqual([5641448, 5891087, 5891418, 5915217])

        const missing = result.current.wizard.all_skills.find(
            (s) => s.skill_id === 5915217,
        )
        expect(missing?.article).toBeNull()

        const present = result.current.wizard.all_skills.find(
            (s) => s.skill_id === 5641448,
        )
        expect(present?.article?.translation.title).toBe('Order tracking')
        expect(present?.guidance_ids).toEqual([501])
        expect(present?.estimated_automation_rate_impact).toBe('+4.20%')
        expect(present?.action_configuration_ids).toEqual(['9001'])
    })

    it('filters skills without an article out of reviewable_skills', () => {
        const { result } = renderHook(() => useSkillWizard(baseWizard), {
            wrapper,
        })

        const ids = result.current.wizard.reviewable_skills.map(
            (s) => s.skill_id,
        )
        expect(ids).not.toContain(5915217)
        expect(ids).toEqual([5641448, 5891087, 5891418])
    })

    it('keeps skills marked as draft in skills_configuration', () => {
        const wizard: SkillWizard = {
            ...baseWizard,
            state: {
                current_step: SkillWizardStep.Review,
                skills_configuration: [
                    {
                        id: 5891087,
                        status: SkillWizardSkillStatus.Draft,
                    },
                ],
            },
        }

        const { result } = renderHook(() => useSkillWizard(wizard), { wrapper })

        const ids = result.current.wizard.reviewable_skills.map(
            (s) => s.skill_id,
        )
        expect(ids).toContain(5891087)
    })

    it('keeps skills marked as approved in skills_configuration', () => {
        const wizard: SkillWizard = {
            ...baseWizard,
            state: {
                skills_configuration: [
                    {
                        id: 5641448,
                        status: SkillWizardSkillStatus.Approved,
                    },
                ],
            },
        }

        const { result } = renderHook(() => useSkillWizard(wizard), { wrapper })

        const ids = result.current.wizard.reviewable_skills.map(
            (s) => s.skill_id,
        )
        expect(ids).toContain(5641448)
    })

    it('filters skills whose actions require auth', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: {
                data: [
                    makeArticle(5641448, { content: 'use $$$action-auth$$$' }),
                    makeArticle(5891087),
                    makeArticle(5891418),
                ],
            },
            isLoading: false,
            isError: false,
        })
        mockUseGetGuidancesAvailableActions.mockReturnValue({
            isLoading: false,
            guidanceActions: [
                {
                    name: 'auth-action',
                    value: 'action-auth',
                    enabled: true,
                    requiresAuth: true,
                    hasMissingValues: false,
                },
            ],
            rawActions: [],
        })

        const { result } = renderHook(() => useSkillWizard(baseWizard), {
            wrapper,
        })

        const ids = result.current.wizard.reviewable_skills.map(
            (s) => s.skill_id,
        )
        expect(ids).not.toContain(5641448)
    })

    it('filters skills whose actions have missing values', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: {
                data: [
                    makeArticle(5641448, {
                        content: 'use $$$action-missing$$$',
                    }),
                    makeArticle(5891087),
                    makeArticle(5891418),
                ],
            },
            isLoading: false,
            isError: false,
        })
        mockUseGetGuidancesAvailableActions.mockReturnValue({
            isLoading: false,
            guidanceActions: [
                {
                    name: 'missing-action',
                    value: 'action-missing',
                    enabled: true,
                    requiresAuth: false,
                    hasMissingValues: true,
                },
            ],
            rawActions: [],
        })

        const { result } = renderHook(() => useSkillWizard(baseWizard), {
            wrapper,
        })

        const ids = result.current.wizard.reviewable_skills.map(
            (s) => s.skill_id,
        )
        expect(ids).not.toContain(5641448)
    })

    it('keeps skills with blocking action setup if they are already in skills_configuration', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: {
                data: [
                    makeArticle(5641448, { content: 'use $$$action-auth$$$' }),
                    makeArticle(5891087),
                    makeArticle(5891418),
                ],
            },
            isLoading: false,
            isError: false,
        })
        mockUseGetGuidancesAvailableActions.mockReturnValue({
            isLoading: false,
            guidanceActions: [
                {
                    name: 'auth-action',
                    value: 'action-auth',
                    enabled: true,
                    requiresAuth: true,
                    hasMissingValues: false,
                },
            ],
            rawActions: [],
        })
        const wizard: SkillWizard = {
            ...baseWizard,
            state: {
                skills_configuration: [
                    {
                        id: 5641448,
                        status: SkillWizardSkillStatus.Approved,
                    },
                ],
            },
        }

        const { result } = renderHook(() => useSkillWizard(wizard), { wrapper })

        const ids = result.current.wizard.reviewable_skills.map(
            (s) => s.skill_id,
        )
        expect(ids).toContain(5641448)
    })

    it('keeps skills marked as draft even when they have blocking actions', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: {
                data: [
                    makeArticle(5641448, { content: 'use $$$action-auth$$$' }),
                    makeArticle(5891087),
                    makeArticle(5891418),
                ],
            },
            isLoading: false,
            isError: false,
        })
        mockUseGetGuidancesAvailableActions.mockReturnValue({
            isLoading: false,
            guidanceActions: [
                {
                    name: 'auth-action',
                    value: 'action-auth',
                    enabled: true,
                    requiresAuth: true,
                    hasMissingValues: false,
                },
            ],
            rawActions: [],
        })
        const wizard: SkillWizard = {
            ...baseWizard,
            state: {
                skills_configuration: [
                    { id: 5641448, status: SkillWizardSkillStatus.Draft },
                ],
            },
        }

        const { result } = renderHook(() => useSkillWizard(wizard), { wrapper })

        const ids = result.current.wizard.reviewable_skills.map(
            (s) => s.skill_id,
        )
        expect(ids).toContain(5641448)
    })

    it('keeps skills whose actions are only disabled', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: {
                data: [
                    makeArticle(5641448, {
                        content: 'use $$$action-disabled$$$',
                    }),
                    makeArticle(5891087),
                    makeArticle(5891418),
                ],
            },
            isLoading: false,
            isError: false,
        })
        mockUseGetGuidancesAvailableActions.mockReturnValue({
            isLoading: false,
            guidanceActions: [
                {
                    name: 'disabled-action',
                    value: 'action-disabled',
                    enabled: false,
                    requiresAuth: false,
                    hasMissingValues: false,
                },
            ],
            rawActions: [],
        })

        const { result } = renderHook(() => useSkillWizard(baseWizard), {
            wrapper,
        })

        const ids = result.current.wizard.reviewable_skills.map(
            (s) => s.skill_id,
        )
        expect(ids).toContain(5641448)
    })

    describe('ui_wizard_state', () => {
        it('reports total_count as the count of reviewable_skills', () => {
            const { result } = renderHook(() => useSkillWizard(baseWizard), {
                wrapper,
            })

            expect(result.current.wizard.ui_wizard_state.total_count).toBe(3)
        })

        it('returns current_step as the 1-based position of current_skill_id', () => {
            const wizard: SkillWizard = {
                ...baseWizard,
                state: { current_skill_id: 5891418 },
            }

            const { result } = renderHook(() => useSkillWizard(wizard), {
                wrapper,
            })

            expect(result.current.wizard.ui_wizard_state.current_step).toBe(3)
        })

        it('defaults current_step to 1 when there is no current_skill_id', () => {
            const { result } = renderHook(() => useSkillWizard(baseWizard), {
                wrapper,
            })

            expect(result.current.wizard.ui_wizard_state.current_step).toBe(1)
        })

        it('defaults current_step to 1 when the current_skill_id has been filtered out', () => {
            mockUseGetHelpCenterArticleList.mockReturnValue({
                data: {
                    data: [
                        makeArticle(5641448),
                        makeArticle(5891087, {
                            content: 'use $$$action-auth$$$',
                        }),
                        makeArticle(5891418),
                    ],
                },
                isLoading: false,
                isError: false,
            })
            mockUseGetGuidancesAvailableActions.mockReturnValue({
                isLoading: false,
                guidanceActions: [
                    {
                        name: 'auth-action',
                        value: 'action-auth',
                        enabled: true,
                        requiresAuth: true,
                        hasMissingValues: false,
                    },
                ],
                rawActions: [],
            })
            const wizard: SkillWizard = {
                ...baseWizard,
                state: { current_skill_id: 5891087 },
            }

            const { result } = renderHook(() => useSkillWizard(wizard), {
                wrapper,
            })

            expect(result.current.wizard.ui_wizard_state.current_step).toBe(1)
        })
    })

    it('reports loading while any underlying query is loading', () => {
        mockUseGetHelpCenterArticleList.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        })

        const { result } = renderHook(() => useSkillWizard(baseWizard), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(true)
    })
})
