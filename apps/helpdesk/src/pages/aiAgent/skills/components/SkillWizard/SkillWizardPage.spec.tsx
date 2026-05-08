import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Switch, useLocation } from 'react-router-dom'

import { ThemeProvider } from 'core/theme'
import { useSkillWizard } from 'pages/aiAgent/skills/hooks/useSkillWizard'

import {
    mockSkillWizardNotStarted,
    SkillWizardStatus,
} from './skillWizard.mock'
import { SkillWizardPage } from './SkillWizardPage'

jest.mock('pages/aiAgent/skills/hooks/useSkillWizard')

const mockUseSkillWizard = useSkillWizard as jest.MockedFunction<
    typeof useSkillWizard
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
                <button onClick={() => props.onStepChange(7)}>
                    Move to step 7
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
    overrides: Partial<ReturnType<typeof useSkillWizard>['wizard']> = {},
): ReturnType<typeof useSkillWizard> => ({
    wizard: {
        ...mockSkillWizardNotStarted,
        all_skills: [],
        reviewable_skills: [],
        ui_wizard_state: { total_count: 0, current_step: 1 },
        ...overrides,
    },
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
        jest.useFakeTimers()
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
                screen.getByText('All of your skills are ready to enable'),
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
                    'Good news: 2 of your skills are ready to enable',
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
                screen.getByText('All of your skills are ready to enable'),
            ).toBeInTheDocument()

            skipIntro()

            expect(
                screen.queryByText('All of your skills are ready to enable'),
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

    it('renders the wizard for the /skills/wizard route with no initial step', () => {
        renderAt(WIZARD_PATH)

        expect(screen.getByText('initialStep: undefined')).toBeInTheDocument()
    })

    it('parses ?step=N from the URL and forwards it as initialStep', () => {
        renderAt(`${WIZARD_PATH}?step=5`)

        expect(screen.getByText('initialStep: 5')).toBeInTheDocument()
    })

    it('ignores invalid step values', () => {
        renderAt(`${WIZARD_PATH}?step=not-a-number`)

        expect(screen.getByText('initialStep: undefined')).toBeInTheDocument()
    })

    it('ignores zero or negative steps', () => {
        renderAt(`${WIZARD_PATH}?step=0`)
        expect(screen.getByText('initialStep: undefined')).toBeInTheDocument()
    })

    it('replaces the step query param when the wizard reports a step change', async () => {
        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        })
        renderAt(`${WIZARD_PATH}?step=3`)

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
})
