import { act, renderHook } from '@repo/testing'
import { useQueryClient } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { helpCenterKeys } from 'models/helpCenter/queries'
import {
    patchWizard,
    updateArticleTranslation,
} from 'models/helpCenter/resources'
import type { SkillWizardData } from 'pages/aiAgent/skills/types'
import {
    SkillWizardSkillStatus,
    SkillWizardStatus,
    SkillWizardStep,
} from 'pages/aiAgent/skills/types'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { useSkillWizardMutations } from './useSkillWizardMutations'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
jest.mock('models/helpCenter/resources', () => ({
    ...jest.requireActual('models/helpCenter/resources'),
    patchWizard: jest.fn(),
    updateArticleTranslation: jest.fn(),
}))

const mockUseHelpCenterApi = useHelpCenterApi as jest.Mock
const mockPatchWizard = patchWizard as jest.MockedFunction<typeof patchWizard>
const mockUpdateArticleTranslation =
    updateArticleTranslation as jest.MockedFunction<
        typeof updateArticleTranslation
    >

const HELP_CENTER_ID = 42
const STUB_CLIENT = {} as never

const seedWizard = (
    overrides: Partial<SkillWizardData> = {},
): SkillWizardData => ({
    id: 1,
    account_id: 100,
    shop_integration_id: 200,
    help_center_id: HELP_CENTER_ID,
    gaia_payload: {
        analysis_period: {
            start: '2026-03-01T00:00:00.000Z',
            end: '2026-04-27T23:59:59.000Z',
            total_tickets: 0,
        },
        recommendations: [],
    },
    state: {},
    status: SkillWizardStatus.NotStarted,
    started_datetime: null,
    completed_datetime: null,
    last_nudge_sent_datetime: null,
    created_datetime: '2026-04-28T10:15:00.000Z',
    updated_datetime: '2026-04-28T10:15:00.000Z',
    ...overrides,
})

const useTestHook = (helpCenterId: number) => ({
    queryClient: useQueryClient(),
    mutations: useSkillWizardMutations(helpCenterId),
})

const renderMutations = (initial: SkillWizardData = seedWizard()) => {
    const rendered = renderHook(() => useTestHook(HELP_CENTER_ID))
    act(() => {
        rendered.result.current.queryClient.setQueryData(
            helpCenterKeys.wizard(HELP_CENTER_ID),
            initial,
        )
    })
    return rendered
}

const readWizard = (
    client: ReturnType<typeof useQueryClient>,
): SkillWizardData | undefined =>
    client.getQueryData<SkillWizardData>(helpCenterKeys.wizard(HELP_CENTER_ID))

describe('useSkillWizardMutations', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseHelpCenterApi.mockReturnValue({ client: STUB_CLIENT })
        mockPatchWizard.mockImplementation(async (_client, _params, data) =>
            seedWizard({
                ...(data.status ? { status: data.status } : {}),
                state: {
                    ...(data.current_step !== undefined
                        ? { current_step: data.current_step }
                        : {}),
                    ...('current_skill_id' in data
                        ? { current_skill_id: data.current_skill_id }
                        : {}),
                    ...(data.skills_configuration
                        ? { skills_configuration: data.skills_configuration }
                        : {}),
                },
            }),
        )
        mockUpdateArticleTranslation.mockResolvedValue({} as never)
    })

    describe('start', () => {
        it('PATCHes status=in_progress and updates the wizard cache', async () => {
            const { result } = renderMutations()

            act(() => {
                result.current.mutations.start()
            })

            await waitFor(() => {
                expect(mockPatchWizard).toHaveBeenCalledWith(
                    STUB_CLIENT,
                    { help_center_id: HELP_CENTER_ID },
                    { status: 'in_progress' },
                )
            })

            await waitFor(() => {
                expect(readWizard(result.current.queryClient)?.status).toBe(
                    SkillWizardStatus.InProgress,
                )
            })
        })
    })

    describe('setStepLocation', () => {
        it('PATCHes current_step and current_skill_id', async () => {
            const { result } = renderMutations()

            act(() => {
                result.current.mutations.setStepLocation({
                    current_step: SkillWizardStep.Review,
                    current_skill_id: 777,
                })
            })

            await waitFor(() => {
                expect(mockPatchWizard).toHaveBeenCalledWith(
                    STUB_CLIENT,
                    { help_center_id: HELP_CENTER_ID },
                    {
                        current_step: SkillWizardStep.Review,
                        current_skill_id: 777,
                    },
                )
            })

            await waitFor(() => {
                expect(
                    readWizard(result.current.queryClient)?.state.current_step,
                ).toBe(SkillWizardStep.Review)
                expect(
                    readWizard(result.current.queryClient)?.state
                        .current_skill_id,
                ).toBe(777)
            })
        })

        it('records the recap step without a current_skill_id', async () => {
            const { result } = renderMutations()

            act(() => {
                result.current.mutations.setStepLocation({
                    current_step: SkillWizardStep.Recap,
                })
            })

            await waitFor(() => {
                expect(mockPatchWizard).toHaveBeenCalledWith(
                    STUB_CLIENT,
                    { help_center_id: HELP_CENTER_ID },
                    { current_step: SkillWizardStep.Recap },
                )
            })
        })
    })

    describe('setSkillStatus', () => {
        it('PATCHes a single skills_configuration upsert', async () => {
            const { result } = renderMutations()

            act(() => {
                result.current.mutations.setSkillStatus({
                    skillId: 5641448,
                    status: SkillWizardSkillStatus.Approved,
                })
            })

            await waitFor(() => {
                expect(mockPatchWizard).toHaveBeenCalledWith(
                    STUB_CLIENT,
                    { help_center_id: HELP_CENTER_ID },
                    {
                        skills_configuration: [
                            { id: 5641448, status: 'approved' },
                        ],
                    },
                )
            })
        })

        it('optimistically upserts the entry into the wizard cache', async () => {
            const { result } = renderMutations()

            act(() => {
                result.current.mutations.setSkillStatus({
                    skillId: 5641448,
                    status: SkillWizardSkillStatus.Draft,
                })
            })

            await waitFor(() => {
                const config = readWizard(result.current.queryClient)?.state
                    .skills_configuration
                expect(config).toEqual([{ id: 5641448, status: 'draft' }])
            })
        })

        it('updates an existing entry instead of appending a duplicate', async () => {
            const initial = seedWizard({
                state: {
                    skills_configuration: [
                        { id: 5641448, status: SkillWizardSkillStatus.Draft },
                    ],
                },
            })
            mockPatchWizard.mockImplementationOnce(async () =>
                seedWizard({
                    state: {
                        skills_configuration: [
                            {
                                id: 5641448,
                                status: SkillWizardSkillStatus.Approved,
                            },
                        ],
                    },
                }),
            )

            const { result } = renderMutations(initial)

            act(() => {
                result.current.mutations.setSkillStatus({
                    skillId: 5641448,
                    status: SkillWizardSkillStatus.Approved,
                })
            })

            await waitFor(() => {
                const config = readWizard(result.current.queryClient)?.state
                    .skills_configuration
                expect(config).toEqual([{ id: 5641448, status: 'approved' }])
            })
        })

        it('rolls the cache back to the previous wizard when the PATCH fails', async () => {
            const initial = seedWizard({
                state: { skills_configuration: [] },
            })
            mockPatchWizard.mockRejectedValueOnce(new Error('network down'))

            const { result } = renderMutations(initial)

            act(() => {
                result.current.mutations.setSkillStatus({
                    skillId: 5641448,
                    status: SkillWizardSkillStatus.Approved,
                })
            })

            await waitFor(() => {
                expect(
                    readWizard(result.current.queryClient)?.state
                        .skills_configuration,
                ).toEqual([])
            })
        })
    })

    describe('saveInstructions', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.runOnlyPendingTimers()
            jest.useRealTimers()
        })

        it('debounces the article translation PATCH', async () => {
            const { result } = renderMutations()

            act(() => {
                result.current.mutations.saveInstructions({
                    articleId: 99,
                    locale: 'en',
                    content: 'hello',
                })
            })

            // Nothing fired yet — still within the debounce window.
            expect(mockUpdateArticleTranslation).not.toHaveBeenCalled()

            await act(async () => {
                await jest.advanceTimersByTimeAsync(499)
            })
            expect(mockUpdateArticleTranslation).not.toHaveBeenCalled()

            await act(async () => {
                await jest.advanceTimersByTimeAsync(1)
            })
            expect(mockUpdateArticleTranslation).toHaveBeenCalledTimes(1)
            expect(mockUpdateArticleTranslation).toHaveBeenCalledWith(
                STUB_CLIENT,
                {
                    help_center_id: HELP_CENTER_ID,
                    article_id: 99,
                    locale: 'en',
                },
                { content: 'hello', is_current: false },
            )
        })

        it('coalesces rapid calls into a single PATCH with the latest content', async () => {
            const { result } = renderMutations()

            act(() => {
                result.current.mutations.saveInstructions({
                    articleId: 99,
                    locale: 'en',
                    content: 'first',
                })
            })
            await act(async () => {
                await jest.advanceTimersByTimeAsync(200)
            })
            act(() => {
                result.current.mutations.saveInstructions({
                    articleId: 99,
                    locale: 'en',
                    content: 'second',
                })
            })
            await act(async () => {
                await jest.advanceTimersByTimeAsync(500)
            })

            expect(mockUpdateArticleTranslation).toHaveBeenCalledTimes(1)
            expect(mockUpdateArticleTranslation).toHaveBeenCalledWith(
                expect.anything(),
                expect.anything(),
                { content: 'second', is_current: false },
            )
        })

        it('fires a Draft setSkillStatus after the article save when draftSkillIdAfterSave is set', async () => {
            const { result } = renderMutations()

            act(() => {
                result.current.mutations.saveInstructions({
                    articleId: 99,
                    locale: 'en',
                    content: '',
                    draftSkillIdAfterSave: 5641448,
                })
            })

            await act(async () => {
                await jest.advanceTimersByTimeAsync(500)
            })

            await waitFor(() => {
                expect(mockPatchWizard).toHaveBeenCalledWith(
                    STUB_CLIENT,
                    { help_center_id: HELP_CENTER_ID },
                    {
                        skills_configuration: [
                            { id: 5641448, status: 'draft' },
                        ],
                    },
                )
            })
        })

        it('does not fire a Draft PATCH when draftSkillIdAfterSave is omitted', async () => {
            const { result } = renderMutations()

            act(() => {
                result.current.mutations.saveInstructions({
                    articleId: 99,
                    locale: 'en',
                    content: 'plenty of instructions',
                })
            })

            await act(async () => {
                await jest.advanceTimersByTimeAsync(500)
            })

            expect(mockUpdateArticleTranslation).toHaveBeenCalled()
            expect(mockPatchWizard).not.toHaveBeenCalled()
        })
    })

    describe('isSaving', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.runOnlyPendingTimers()
            jest.useRealTimers()
        })

        it('is true while a saveInstructions call is pending its debounced PATCH', () => {
            const { result } = renderMutations()

            expect(result.current.mutations.isSaving).toBe(false)

            act(() => {
                result.current.mutations.saveInstructions({
                    articleId: 99,
                    locale: 'en',
                    content: 'typing',
                })
            })

            expect(result.current.mutations.isSaving).toBe(true)
        })
    })
})
