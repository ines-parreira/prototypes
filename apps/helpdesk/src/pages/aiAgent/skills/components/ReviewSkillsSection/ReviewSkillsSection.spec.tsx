import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AxiomProvider } from '@gorgias/axiom'

import { ThemeProvider } from 'core/theme'
import type {
    EnrichedSkillWizard,
    WizardSkill,
} from 'pages/aiAgent/skills/hooks/useEnrichedSkillWizard'
import { SkillWizardStatus } from 'pages/aiAgent/skills/types'

import { ReviewSkillsSection } from './ReviewSkillsSection'

const makeWizardSkill = (
    skillId: number,
    title: string,
    options: {
        intents?: string[]
        impact?: string
    } = {},
): WizardSkill => ({
    skill_id: skillId,
    article: {
        id: skillId,
        help_center_id: 21,
        translation: {
            title,
            content: '',
            intents: options.intents,
        },
        // Cast to ArticleListDataDto — only the fields the component reads.
    } as WizardSkill['article'],
    guidance_ids: [501],
    recommendation: 'rec',
    estimated_automation_rate_impact: options.impact ?? '+4.20%',
    action_configuration_ids: [],
})

const makeEnrichedWizard = (
    overrides: Partial<EnrichedSkillWizard> = {},
): EnrichedSkillWizard => {
    const reviewable_skills = overrides.reviewable_skills ?? [
        makeWizardSkill(1, 'Order tracking', {
            intents: ['order::status'],
        }),
        makeWizardSkill(2, 'Returns', { intents: ['return::request'] }),
    ]

    return {
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
        state: {},
        status: SkillWizardStatus.NotStarted,
        started_datetime: null,
        completed_datetime: null,
        last_nudge_sent_datetime: null,
        created_datetime: '2026-04-28T10:15:00.000Z',
        updated_datetime: '2026-04-28T10:15:00.000Z',
        all_skills: reviewable_skills,
        reviewable_skills,
        ui_wizard_state: {
            total_count: reviewable_skills.length,
            current_step: 1,
        },
        ...overrides,
    }
}

const renderSection = (
    overrides: Partial<EnrichedSkillWizard> = {},
    onCTA: () => void = jest.fn(),
) =>
    render(
        <AxiomProvider rootNode={document.body}>
            <ThemeProvider>
                <ReviewSkillsSection
                    wizard={makeEnrichedWizard(overrides)}
                    onCTA={onCTA}
                />
            </ThemeProvider>
        </AxiomProvider>,
        {},
    )

describe('ReviewSkillsSection', () => {
    it('renders the heading and description', () => {
        renderSection()

        expect(
            screen.getByRole('heading', {
                name: 'We created your core skills',
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Built from your existing guidance and best practices from top-performing merchants.',
            ),
        ).toBeInTheDocument()
    })

    it('renders one card per reviewable skill', () => {
        renderSection()

        expect(screen.getByText('Order tracking')).toBeInTheDocument()
        expect(screen.getByText('Returns')).toBeInTheDocument()
    })

    it('renders the impact label using the estimated_automation_rate_impact string', () => {
        renderSection({
            reviewable_skills: [
                makeWizardSkill(1, 'Order tracking', { impact: '15%-20%' }),
            ],
        })

        expect(
            screen.getByText('Estimated impact: 15%-20% automation rate'),
        ).toBeInTheDocument()
    })

    describe('not_started state', () => {
        it('renders the "~5 minutes" meta and the "Review your skills" CTA', () => {
            renderSection({ status: SkillWizardStatus.NotStarted })

            expect(screen.getByText('~5 minutes')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Review your skills/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /Resume skill review/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('in_progress state', () => {
        it('renders the "Resume skill review" CTA', () => {
            renderSection({
                status: SkillWizardStatus.InProgress,
                ui_wizard_state: { total_count: 3, current_step: 2 },
            })

            expect(
                screen.getByRole('button', { name: /Resume skill review/i }),
            ).toBeInTheDocument()
            expect(screen.queryByText('~5 minutes')).not.toBeInTheDocument()
        })

        it('renders "{current_step - 1} of {total_count} reviewed"', () => {
            renderSection({
                status: SkillWizardStatus.InProgress,
                ui_wizard_state: { total_count: 3, current_step: 2 },
            })

            expect(screen.getByText('1 of 3 reviewed')).toBeInTheDocument()
        })

        it('renders the "~5 minutes" estimate instead of "0 of N reviewed" when no skills have been reviewed yet', () => {
            renderSection({
                status: SkillWizardStatus.InProgress,
                ui_wizard_state: { total_count: 3, current_step: 1 },
            })

            expect(screen.getByText('~5 minutes')).toBeInTheDocument()
            expect(
                screen.queryByText('0 of 3 reviewed'),
            ).not.toBeInTheDocument()
        })
    })

    it('invokes onCTA when the CTA button is clicked', async () => {
        const user = userEvent.setup()
        const onCTA = jest.fn()
        renderSection({}, onCTA)

        await user.click(
            screen.getByRole('button', { name: /Review your skills/i }),
        )

        expect(onCTA).toHaveBeenCalledTimes(1)
    })
})
