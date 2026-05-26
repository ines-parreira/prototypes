import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Switch, useLocation } from 'react-router-dom'

import { ThemeProvider } from 'core/theme'
import { useGetWizard } from 'models/helpCenter/queries'
import { useEnrichedSkillWizard } from 'pages/aiAgent/skills/hooks/useEnrichedSkillWizard'
import type { SkillWizardData } from 'pages/aiAgent/skills/types'
import { SkillWizardStatus } from 'pages/aiAgent/skills/types'

import { SkillWizardPage } from './SkillWizardPage'

const mockNotStartedWizard: SkillWizardData = {
    id: 1,
    account_id: 6069,
    shop_integration_id: 7,
    help_center_id: 21,
    gaia_payload: {
        analysis_period: {
            start: '2026-03-01T00:00:00.000Z',
            end: '2026-04-27T23:59:59.000Z',
            total_tickets: 0,
        },
        recommendations: [],
    },
    state: { skills_configuration: [] },
    status: SkillWizardStatus.NotStarted,
    started_datetime: null,
    completed_datetime: null,
    last_nudge_sent_datetime: null,
    created_datetime: '2026-04-28T10:15:00.000Z',
    updated_datetime: '2026-04-28T10:15:00.000Z',
}

const mockStart = jest.fn()
const mockSetStepLocation = jest.fn()
const mockSetSkillStatus = jest.fn()
const mockSaveInstructions = jest.fn()

jest.mock('pages/aiAgent/skills/hooks/useEnrichedSkillWizard')
jest.mock('models/helpCenter/queries', () => ({
    useGetWizard: jest.fn(),
}))
jest.mock('pages/aiAgent/skills/hooks/useSkillWizardMutations', () => ({
    SKILL_WIZARD_SAVING_MUTATION_KEY: ['skill-wizard-saving'],
    useSkillWizardMutations: () => ({
        start: mockStart,
        setStepLocation: mockSetStepLocation,
        setSkillStatus: mockSetSkillStatus,
        saveInstructions: mockSaveInstructions,
        isSaving: false,
    }),
}))

const mockUseSkillWizard = useEnrichedSkillWizard as jest.MockedFunction<
    typeof useEnrichedSkillWizard
>
const mockUseGetWizard = useGetWizard as jest.MockedFunction<
    typeof useGetWizard
>

const wizardProps: { current: any } = { current: undefined }

jest.mock('./SkillWizard', () => ({
    SkillWizard: (props: any) => {
        wizardProps.current = props
        return (
            <div>
                <p>initialStep: {String(props.initialStep)}</p>
                <p>itemsCount: {props.items.length}</p>
                <button onClick={props.onClose}>Close from wizard</button>
                <button onClick={() => props.onStepChange(7, 6)}>
                    Move to step 7
                </button>
                <button onClick={() => props.onStepChange(2, 1)}>
                    Leave step 1
                </button>
            </div>
        )
    },
}))

const SHOP_NAME = 'ekster'
const WIZARD_PATH = `/app/ai-agent/shopify/${SHOP_NAME}/skills/wizard`
const SKILLS_PATH = `/app/ai-agent/shopify/${SHOP_NAME}/skills`

const PathProbe = () => {
    const location = useLocation()
    return (
        <div>
            <p>path: {location.pathname}</p>
            <p>search: {location.search}</p>
        </div>
    )
}

const renderAt = (initialEntry: string) =>
    render(
        <ThemeProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Switch>
                    <Route
                        path="/app/ai-agent/shopify/:shopName/skills/wizard"
                        component={SkillWizardPage}
                    />
                    <Route
                        path="/app/ai-agent/shopify/:shopName/skills"
                        render={() => <p>Skills landing</p>}
                    />
                </Switch>
                <PathProbe />
            </MemoryRouter>
        </ThemeProvider>,
    )

const buildWizardReturn = (
    overrides: Partial<
        ReturnType<typeof useEnrichedSkillWizard>['wizard']
    > = {},
): ReturnType<typeof useEnrichedSkillWizard> => ({
    wizard: {
        ...mockNotStartedWizard,
        all_skills: [],
        reviewable_skills: [],
        ui_wizard_state: { total_count: 0, current_step: 1 },
        ...overrides,
    },
    guidanceActions: [],
    isLoading: false,
    isError: false,
})

const reviewableSkill = (skill_id: number) => ({
    skill_id,
    article: null,
    guidance_ids: [],
    recommendation: `Recommendation ${skill_id}`,
    estimated_automation_rate_impact: '+1.00%',
    action_configuration_ids: [],
})

const skipIntro = () => {
    act(() => {
        jest.advanceTimersByTime(4000)
    })
}

describe('SkillWizardPage', () => {
    beforeEach(() => {
        wizardProps.current = undefined
        mockStart.mockClear()
        mockSetStepLocation.mockClear()
        mockSetSkillStatus.mockClear()
        mockSaveInstructions.mockClear()
        jest.useFakeTimers()
        mockUseGetWizard.mockReturnValue({
            data: mockNotStartedWizard,
        } as unknown as ReturnType<typeof useGetWizard>)
        mockUseSkillWizard.mockReturnValue(
            buildWizardReturn({
                status: SkillWizardStatus.InProgress,
                all_skills: [reviewableSkill(1), reviewableSkill(2)],
                reviewable_skills: [reviewableSkill(1), reviewableSkill(2)],
            }),
        )
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    describe('intro splash', () => {
        it('shows the all-reviewable copy when status is NotStarted and every skill is reviewable', () => {
            mockUseSkillWizard.mockReturnValue(
                buildWizardReturn({
                    status: SkillWizardStatus.NotStarted,
                    all_skills: [reviewableSkill(1), reviewableSkill(2)],
                    reviewable_skills: [reviewableSkill(1), reviewableSkill(2)],
                }),
            )

            renderAt(WIZARD_PATH)

            expect(
                screen.getByText('Preparing your skills for review'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'They’re all ready to enable, give them a quick look first',
                ),
            ).toBeInTheDocument()
        })

        it('shows the partial copy when only some skills are reviewable', () => {
            mockUseSkillWizard.mockReturnValue(
                buildWizardReturn({
                    status: SkillWizardStatus.NotStarted,
                    all_skills: [
                        reviewableSkill(1),
                        reviewableSkill(2),
                        reviewableSkill(3),
                    ],
                    reviewable_skills: [reviewableSkill(1), reviewableSkill(2)],
                }),
            )

            renderAt(WIZARD_PATH)

            expect(
                screen.getByText(
                    '2 of your skills are ready to enable, give them a quick look first',
                ),
            ).toBeInTheDocument()
        })

        it('replaces the splash with the wizard after the intro duration elapses', () => {
            mockUseSkillWizard.mockReturnValue(
                buildWizardReturn({
                    status: SkillWizardStatus.NotStarted,
                    all_skills: [reviewableSkill(1)],
                    reviewable_skills: [reviewableSkill(1)],
                }),
            )

            renderAt(WIZARD_PATH)

            expect(
                screen.getByText('Preparing your skills for review'),
            ).toBeInTheDocument()

            skipIntro()

            expect(
                screen.queryByText('Preparing your skills for review'),
            ).not.toBeInTheDocument()
            expect(screen.getByText('itemsCount: 1')).toBeInTheDocument()
        })

        it('skips the splash when status is InProgress', () => {
            renderAt(WIZARD_PATH)

            expect(screen.getByText('itemsCount: 2')).toBeInTheDocument()
            expect(
                screen.queryByText('Give them a quick review first'),
            ).not.toBeInTheDocument()
        })

        it('skips the splash when there are no reviewable skills', () => {
            mockUseSkillWizard.mockReturnValue(
                buildWizardReturn({
                    status: SkillWizardStatus.NotStarted,
                    all_skills: [reviewableSkill(1)],
                    reviewable_skills: [],
                }),
            )

            renderAt(WIZARD_PATH)

            expect(screen.getByText('itemsCount: 0')).toBeInTheDocument()
            expect(
                screen.queryByText('Give them a quick review first'),
            ).not.toBeInTheDocument()
        })
    })

    it('uses ui_wizard_state.current_step from the backend as initialStep', () => {
        mockUseSkillWizard.mockReturnValue(
            buildWizardReturn({
                status: SkillWizardStatus.InProgress,
                all_skills: [reviewableSkill(1), reviewableSkill(2)],
                reviewable_skills: [reviewableSkill(1), reviewableSkill(2)],
                ui_wizard_state: { total_count: 2, current_step: 2 },
            }),
        )
        renderAt(WIZARD_PATH)

        expect(screen.getByText('initialStep: 2')).toBeInTheDocument()
    })

    it('ignores ?step= in the URL — backend state wins', () => {
        mockUseSkillWizard.mockReturnValue(
            buildWizardReturn({
                status: SkillWizardStatus.InProgress,
                all_skills: [reviewableSkill(1), reviewableSkill(2)],
                reviewable_skills: [reviewableSkill(1), reviewableSkill(2)],
                ui_wizard_state: { total_count: 2, current_step: 1 },
            }),
        )
        renderAt(`${WIZARD_PATH}?step=99`)

        expect(screen.getByText('initialStep: 1')).toBeInTheDocument()
    })

    it('replaces the step query param when the wizard reports a step change', async () => {
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        })
        renderAt(WIZARD_PATH)

        await user.click(screen.getByRole('button', { name: 'Move to step 7' }))

        expect(screen.getByText('search: ?step=7')).toBeInTheDocument()
        expect(screen.getByText(`path: ${WIZARD_PATH}`)).toBeInTheDocument()
    })

    it('navigates to the skills list when the wizard requests close', async () => {
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        })
        renderAt(`${WIZARD_PATH}?step=2`)

        await user.click(
            screen.getByRole('button', { name: 'Close from wizard' }),
        )

        expect(screen.getByText('Skills landing')).toBeInTheDocument()
        expect(screen.getByText(`path: ${SKILLS_PATH}`)).toBeInTheDocument()
    })

    it('passes a draftKnowledge function that returns the article id when present, falling back to the skill id', () => {
        const skillWithArticle = {
            ...reviewableSkill(42),
            article: { id: 999 } as any,
        }
        const skillWithoutArticle = reviewableSkill(7)

        mockUseSkillWizard.mockReturnValue(
            buildWizardReturn({
                status: SkillWizardStatus.InProgress,
                all_skills: [skillWithArticle, skillWithoutArticle],
                reviewable_skills: [skillWithArticle, skillWithoutArticle],
            }),
        )

        renderAt(WIZARD_PATH)

        const draftKnowledge = wizardProps.current.draftKnowledge
        expect(typeof draftKnowledge).toBe('function')
        expect(draftKnowledge(skillWithArticle, 0)).toEqual({
            sourceId: 999,
            sourceSetId: 1,
        })
        expect(draftKnowledge(skillWithoutArticle, 1)).toEqual({
            sourceId: 7,
            sourceSetId: 1,
        })
    })

    describe('mutations wiring', () => {
        it('calls mutations.start when the wizard is not_started on mount', () => {
            mockUseSkillWizard.mockReturnValue(
                buildWizardReturn({
                    status: SkillWizardStatus.NotStarted,
                    all_skills: [reviewableSkill(1)],
                    reviewable_skills: [reviewableSkill(1)],
                }),
            )

            renderAt(WIZARD_PATH)

            expect(mockStart).toHaveBeenCalledTimes(1)
        })

        it('does not call mutations.start when the wizard is already in_progress', () => {
            renderAt(WIZARD_PATH)

            expect(mockStart).not.toHaveBeenCalled()
        })

        it('PATCHes the new step location on step change', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            renderAt(WIZARD_PATH)

            await user.click(
                screen.getByRole('button', { name: 'Move to step 7' }),
            )

            expect(mockSetStepLocation).toHaveBeenCalledWith(
                expect.objectContaining({ current_step: 'recap' }),
            )
        })

        it('does not commit a status when the user leaves a skill — recap derives defaults instead', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            const skillA = reviewableSkill(5641448)
            skillA.article = {
                id: 11,
                translation: {
                    title: 'Returns',
                    content: '<p>Non-empty instructions</p>',
                    locale: 'en',
                    intents: [],
                },
            } as never
            const skillB = reviewableSkill(5641449)
            mockUseSkillWizard.mockReturnValue(
                buildWizardReturn({
                    status: SkillWizardStatus.InProgress,
                    state: { skills_configuration: [] },
                    all_skills: [skillA, skillB],
                    reviewable_skills: [skillA, skillB],
                }),
            )

            renderAt(WIZARD_PATH)

            await user.click(
                screen.getByRole('button', { name: 'Leave step 1' }),
            )

            expect(mockSetSkillStatus).not.toHaveBeenCalled()
        })
    })
})
