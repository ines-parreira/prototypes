import { render } from '@repo/testing'
import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'
import { useGetHelpCenter } from 'models/helpCenter/queries'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useApplyWizardChanges } from 'pages/aiAgent/skills/hooks/useApplyWizardChanges'
import type { EnrichedSkillWizard } from 'pages/aiAgent/skills/hooks/useEnrichedSkillWizard'
import { useSkillWizardMutations } from 'pages/aiAgent/skills/hooks/useSkillWizardMutations'
import {
    SkillWizardSkillStatus,
    SkillWizardStatus,
} from 'pages/aiAgent/skills/types'

import { SkillRecapStep } from './SkillRecapStep'
import { SkillWizardContext } from './SkillWizardContext'
import type { SkillWizardContextValue } from './SkillWizardContext'

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('pages/aiAgent/hooks/useGuidanceArticles')
jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
)
jest.mock('pages/aiAgent/skills/hooks/useApplyWizardChanges')
jest.mock('pages/aiAgent/skills/hooks/useSkillWizardMutations', () => ({
    SKILL_WIZARD_SAVING_MUTATION_KEY: ['skill-wizard-saving'],
    useSkillWizardMutations: jest.fn(),
}))
jest.mock('models/helpCenter/queries', () => ({
    ...jest.requireActual('models/helpCenter/queries'),
    useGetHelpCenter: jest.fn(),
}))
jest.mock('lottie-react', () => ({
    __esModule: true,
    default: jest.fn(({ animationData: __animationData, ...props }) => (
        <div data-testid="lottie-animation" {...props} />
    )),
}))

const mockUseApplyWizardChanges = useApplyWizardChanges as jest.MockedFunction<
    typeof useApplyWizardChanges
>
const mockUseSkillWizardMutations =
    useSkillWizardMutations as jest.MockedFunction<
        typeof useSkillWizardMutations
    >
const mockUseGetHelpCenter = useGetHelpCenter as jest.MockedFunction<
    typeof useGetHelpCenter
>

const buildApplyResult = (
    overrides: Partial<ReturnType<typeof useApplyWizardChanges>> = {},
): ReturnType<typeof useApplyWizardChanges> => ({
    apply: jest.fn(),
    phase: 'idle',
    liveSkillsCount: 0,
    ...overrides,
})

const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.MockedFunction<
        typeof useAiAgentStoreConfigurationContext
    >
const mockUseGuidanceArticles = useGuidanceArticles as jest.MockedFunction<
    typeof useGuidanceArticles
>
const mockUseGetGuidancesAvailableActions =
    useGetGuidancesAvailableActions as jest.MockedFunction<
        typeof useGetGuidancesAvailableActions
    >

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

const goBack = jest.fn()

const wizardContextValue: SkillWizardContextValue = {
    currentStep: 4,
    totalSteps: 4,
    reviewStepsCount: 3,
    isFirstStep: false,
    isLastStep: true,
    isRecapStep: true,
    goNext: jest.fn(),
    goBack,
    goToStep: jest.fn(),
    onTest: jest.fn(),
}

const buildSkill = (
    id: number,
    title: string,
    guidance_ids: number[],
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
        action_configuration_ids: [],
    }) as unknown as EnrichedSkillWizard['reviewable_skills'][number]

const buildWizard = (
    skillsConfiguration: Array<{
        id: number
        status: SkillWizardSkillStatus
    }>,
): EnrichedSkillWizard => {
    const reviewable_skills = [
        buildSkill(1, 'Returns and exchanges', [101, 102]),
        buildSkill(2, 'Order status', [201]),
    ]
    return {
        id: 1,
        account_id: 1,
        shop_integration_id: 1,
        help_center_id: 1,
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
        ui_wizard_state: { total_count: 2, current_step: 1 },
    }
}

const renderRecap = (wizard: EnrichedSkillWizard) =>
    render(
        <ThemeProvider>
            <SkillWizardContext.Provider value={wizardContextValue}>
                <SkillRecapStep wizard={wizard} />
            </SkillWizardContext.Provider>
        </ThemeProvider>,
    )

describe('SkillRecapStep', () => {
    beforeEach(() => {
        goBack.mockClear()
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                storeName: 'ekster',
                shopType: 'shopify',
                guidanceHelpCenterId: 21,
            },
        } as ReturnType<typeof useAiAgentStoreConfigurationContext>)
        mockUseGetGuidancesAvailableActions.mockReturnValue({
            isLoading: false,
            guidanceActions: [],
            rawActions: [],
        } as ReturnType<typeof useGetGuidancesAvailableActions>)
        mockUseGuidanceArticles.mockReturnValue({
            guidanceArticles: [
                { id: 101, title: 'Return policy' },
                { id: 102, title: 'Exchange eligibility' },
                { id: 201, title: 'Shipping policy' },
            ] as ReturnType<typeof useGuidanceArticles>['guidanceArticles'],
            isGuidanceArticleListLoading: false,
            isFetched: true,
        })
        mockUseApplyWizardChanges.mockReturnValue(buildApplyResult())
        mockUseSkillWizardMutations.mockReturnValue({
            complete: jest.fn().mockResolvedValue(undefined),
        } as unknown as ReturnType<typeof useSkillWizardMutations>)
        mockUseGetHelpCenter.mockReturnValue({
            data: { default_locale: 'en-US' },
        } as ReturnType<typeof useGetHelpCenter>)
    })

    it('shows the count of skills approved in skills_configuration', () => {
        renderRecap(
            buildWizard([
                { id: 1, status: SkillWizardSkillStatus.Approved },
                { id: 2, status: SkillWizardSkillStatus.Approved },
            ]),
        )

        expect(screen.getByText('2 skills ready to enable')).toBeInTheDocument()
    })

    it('renders the success-state guidance card with "Continue to skills" when no skill is approved', () => {
        renderRecap(
            buildWizard([
                { id: 1, status: SkillWizardSkillStatus.Draft },
                { id: 2, status: SkillWizardSkillStatus.Draft },
            ]),
        )

        expect(
            screen.getByText('All of your enabled guidance will remain active'),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /continue to skills/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /apply all changes/i }),
        ).not.toBeInTheDocument()
    })

    it('shows "Apply all changes" CTA when at least one skill is approved', () => {
        renderRecap(
            buildWizard([{ id: 1, status: SkillWizardSkillStatus.Approved }]),
        )

        expect(
            screen.getByRole('button', { name: /apply all changes/i }),
        ).toBeInTheDocument()
    })

    it('opens the skills sidepanel when the skills card is clicked', async () => {
        const user = userEvent.setup()
        renderRecap(
            buildWizard([
                { id: 1, status: SkillWizardSkillStatus.Approved },
                { id: 2, status: SkillWizardSkillStatus.Draft },
            ]),
        )

        await user.click(screen.getByText('1 skill ready to enable'))

        const dialog = await screen.findByRole('dialog')
        expect(
            within(dialog).getByRole('heading', { name: 'Skills' }),
        ).toBeInTheDocument()
        expect(
            within(dialog).getByText('Returns and exchanges'),
        ).toBeInTheDocument()
    })

    it('toggling a skill off in the sidepanel decrements the recap count and removes its guidance', async () => {
        const user = userEvent.setup()
        renderRecap(
            buildWizard([
                { id: 1, status: SkillWizardSkillStatus.Approved },
                { id: 2, status: SkillWizardSkillStatus.Approved },
            ]),
        )

        expect(screen.getByText('2 skills ready to enable')).toBeInTheDocument()

        await user.click(screen.getByText('2 skills ready to enable'))

        const skillsDialog = await screen.findByRole('dialog')
        const orderStatusRow = within(skillsDialog)
            .getByText('Order status')
            .closest('tr') as HTMLElement
        await user.click(within(orderStatusRow).getByRole('switch'))

        // Close skills sidepanel
        await user.keyboard('{Escape}')

        expect(
            await screen.findByText('1 skill ready to enable'),
        ).toBeInTheDocument()

        // Open guidance sidepanel and verify Order status's guidance (201 -> Shipping policy) is gone
        await user.click(
            screen.getByText('Some of your guidance can now be disabled'),
        )

        const guidanceDialog = await screen.findByRole('dialog')
        expect(
            within(guidanceDialog).queryByText('Shipping policy'),
        ).not.toBeInTheDocument()
        expect(
            within(guidanceDialog).getByText('Return policy'),
        ).toBeInTheDocument()
    })

    it('renders the guidance card as non-interactive when no skills are enabled', () => {
        renderRecap(
            buildWizard([
                { id: 1, status: SkillWizardSkillStatus.Draft },
                { id: 2, status: SkillWizardSkillStatus.Draft },
            ]),
        )

        // The guidance card with the "remain active" copy is non-interactive
        // (no chevron, no onClick), and the "Review guidance to disable" copy
        // for an interactive card is not present.
        expect(
            screen.queryByText('Some of your guidance can now be disabled'),
        ).not.toBeInTheDocument()
    })

    it('renders the guidance card as non-interactive when enabled skills cover no guidances', async () => {
        const user = userEvent.setup()
        // Override buildWizard's defaults: both approved skills have empty
        // guidance_ids → there's nothing to disable in the sidepanel.
        const wizard = buildWizard([
            { id: 1, status: SkillWizardSkillStatus.Approved },
            { id: 2, status: SkillWizardSkillStatus.Approved },
        ])
        wizard.reviewable_skills.forEach((skill) => {
            ;(skill as { guidance_ids: number[] }).guidance_ids = []
        })

        renderRecap(wizard)

        // Success copy is shown, not the "can be disabled" CTA copy
        expect(
            screen.getByText('All of your enabled guidance will remain active'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('Some of your guidance can now be disabled'),
        ).not.toBeInTheDocument()

        // Clicking the card does not open the guidance sidepanel
        await user.click(
            screen.getByText('All of your enabled guidance will remain active'),
        )
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('does not open the skills sidepanel when no skills were approved on the server', async () => {
        const user = userEvent.setup()
        renderRecap(
            buildWizard([
                { id: 1, status: SkillWizardSkillStatus.Draft },
                { id: 2, status: SkillWizardSkillStatus.Draft },
            ]),
        )

        await user.click(screen.getByText('0 skills ready to enable'))

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('keeps the cards interactive after the merchant toggles every approved skill off', async () => {
        const user = userEvent.setup()
        renderRecap(
            buildWizard([
                { id: 1, status: SkillWizardSkillStatus.Approved },
                { id: 2, status: SkillWizardSkillStatus.Approved },
            ]),
        )

        // Toggle both approved skills off in the sidepanel.
        await user.click(screen.getByText('2 skills ready to enable'))
        const skillsDialog = await screen.findByRole('dialog')
        for (const title of ['Returns and exchanges', 'Order status']) {
            const row = within(skillsDialog)
                .getByText(title)
                .closest('tr') as HTMLElement
            await user.click(within(row).getByRole('switch'))
        }
        await user.keyboard('{Escape}')

        // Count drops to 0 and CTA flips, but the cards remain interactive
        // so the merchant can re-enable a skill.
        expect(
            await screen.findByText('0 skills ready to enable'),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /continue to skills/i }),
        ).toBeInTheDocument()

        await user.click(screen.getByText('0 skills ready to enable'))
        expect(await screen.findByRole('dialog')).toBeInTheDocument()
        await user.keyboard('{Escape}')

        // Guidance card flips to the success/non-interactive copy because no
        // skills are currently enabled.
        expect(
            screen.getByText('All of your enabled guidance will remain active'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('Some of your guidance can now be disabled'),
        ).not.toBeInTheDocument()
    })

    describe('action availability warnings', () => {
        const buildWizardWithActionContent = (
            skillsConfiguration: Array<{
                id: number
                status: SkillWizardSkillStatus
            }>,
        ): EnrichedSkillWizard => {
            // Skill 1's content references action "act-1"; skill 2's does not.
            const reviewable_skills = [
                buildSkill(
                    1,
                    'Returns and exchanges',
                    [101, 102],
                    '<p>Use $$$act-1$$$ to refund.</p>',
                ),
                buildSkill(2, 'Order status', [201]),
            ]
            return {
                id: 1,
                account_id: 1,
                shop_integration_id: 1,
                help_center_id: 1,
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
                ui_wizard_state: { total_count: 2, current_step: 1 },
            }
        }

        const mockDisabledAction = () => {
            mockUseGetGuidancesAvailableActions.mockReturnValue({
                isLoading: false,
                guidanceActions: [
                    {
                        name: 'Refund',
                        value: 'act-1',
                        enabled: false,
                        requiresAuth: false,
                        hasMissingValues: false,
                    },
                ],
                rawActions: [],
            } as unknown as ReturnType<typeof useGetGuidancesAvailableActions>)
        }

        it('renders a warning banner in the sidepanel when any skill references an action needing setup', async () => {
            const user = userEvent.setup()
            mockDisabledAction()
            renderRecap(
                buildWizardWithActionContent([
                    { id: 1, status: SkillWizardSkillStatus.Approved },
                    { id: 2, status: SkillWizardSkillStatus.Approved },
                ]),
            )

            await user.click(screen.getByText('2 skills ready to enable'))

            const dialog = await screen.findByRole('dialog')
            expect(
                within(dialog).getByText(
                    'Review new actions and their conditions before applying all changes',
                ),
            ).toBeInTheDocument()
            const reviewActionsLink = within(dialog).getByRole('link', {
                name: /review actions/i,
            })
            expect(reviewActionsLink).toHaveAttribute('target', '_blank')
        })

        it('renders a warning icon only on rows whose skill needs action setup', async () => {
            const user = userEvent.setup()
            mockDisabledAction()
            renderRecap(
                buildWizardWithActionContent([
                    { id: 1, status: SkillWizardSkillStatus.Approved },
                    { id: 2, status: SkillWizardSkillStatus.Approved },
                ]),
            )

            await user.click(screen.getByText('2 skills ready to enable'))
            const dialog = await screen.findByRole('dialog')

            expect(
                within(dialog).getByRole('img', {
                    name: 'Returns and exchanges has actions that need to be enabled',
                }),
            ).toBeInTheDocument()
            expect(
                within(dialog).queryByRole('img', {
                    name: 'Order status has actions that need to be enabled',
                }),
            ).not.toBeInTheDocument()
        })

        it('keeps the row warning visible after the merchant toggles the skill off', async () => {
            const user = userEvent.setup()
            mockDisabledAction()
            renderRecap(
                buildWizardWithActionContent([
                    { id: 1, status: SkillWizardSkillStatus.Approved },
                    { id: 2, status: SkillWizardSkillStatus.Approved },
                ]),
            )

            await user.click(screen.getByText('2 skills ready to enable'))
            const dialog = await screen.findByRole('dialog')
            const row = within(dialog)
                .getByText('Returns and exchanges')
                .closest('tr') as HTMLElement
            await user.click(within(row).getByRole('switch'))

            expect(
                within(dialog).getByRole('img', {
                    name: 'Returns and exchanges has actions that need to be enabled',
                }),
            ).toBeInTheDocument()
        })

        it('does not show any warning when no skill references an action needing setup', async () => {
            const user = userEvent.setup()
            // Default mock has no available actions => no skill flagged.
            renderRecap(
                buildWizardWithActionContent([
                    { id: 1, status: SkillWizardSkillStatus.Approved },
                    { id: 2, status: SkillWizardSkillStatus.Draft },
                ]),
            )

            await user.click(screen.getByText('1 skill ready to enable'))
            const dialog = await screen.findByRole('dialog')
            expect(
                within(dialog).queryByText(
                    'Review new actions and their conditions before applying all changes',
                ),
            ).not.toBeInTheDocument()
        })

        it('shows a "Review actions" tag on the skills card when an enabled skill needs action setup', () => {
            mockDisabledAction()
            renderRecap(
                buildWizardWithActionContent([
                    { id: 1, status: SkillWizardSkillStatus.Approved },
                    { id: 2, status: SkillWizardSkillStatus.Approved },
                ]),
            )

            expect(screen.getByText('Review actions')).toBeInTheDocument()
        })

        it('does not show the "Review actions" tag when no enabled skill needs action setup', () => {
            // Default mock has no available actions => no skill flagged.
            renderRecap(
                buildWizardWithActionContent([
                    { id: 1, status: SkillWizardSkillStatus.Approved },
                    { id: 2, status: SkillWizardSkillStatus.Draft },
                ]),
            )

            expect(screen.queryByText('Review actions')).not.toBeInTheDocument()
        })
    })

    it('Back button calls goBack from wizard context', async () => {
        const user = userEvent.setup()
        renderRecap(
            buildWizard([{ id: 1, status: SkillWizardSkillStatus.Approved }]),
        )

        await user.click(screen.getByRole('button', { name: /back/i }))

        expect(goBack).toHaveBeenCalled()
    })

    describe('apply flow', () => {
        it('calls apply when the merchant clicks Apply with enabled skills', async () => {
            const apply = jest.fn()
            mockUseApplyWizardChanges.mockReturnValue(
                buildApplyResult({ apply }),
            )

            const user = userEvent.setup()
            renderRecap(
                buildWizard([
                    { id: 1, status: SkillWizardSkillStatus.Approved },
                ]),
            )

            await user.click(
                screen.getByRole('button', { name: /apply all changes/i }),
            )

            expect(apply).toHaveBeenCalledTimes(1)
        })

        it('marks the wizard completed when the merchant clicks Apply with enabled skills', async () => {
            const complete = jest.fn().mockResolvedValue(undefined)
            mockUseSkillWizardMutations.mockReturnValue({
                complete,
            } as unknown as ReturnType<typeof useSkillWizardMutations>)

            const user = userEvent.setup()
            renderRecap(
                buildWizard([
                    { id: 1, status: SkillWizardSkillStatus.Approved },
                ]),
            )

            await user.click(
                screen.getByRole('button', { name: /apply all changes/i }),
            )

            expect(complete).toHaveBeenCalledTimes(1)
        })

        it('marks the wizard completed when the merchant clicks Continue to skills with no approved skills', async () => {
            const complete = jest.fn().mockResolvedValue(undefined)
            mockUseSkillWizardMutations.mockReturnValue({
                complete,
            } as unknown as ReturnType<typeof useSkillWizardMutations>)

            const user = userEvent.setup()
            renderRecap(
                buildWizard([
                    { id: 1, status: SkillWizardSkillStatus.Draft },
                    { id: 2, status: SkillWizardSkillStatus.Draft },
                ]),
            )

            await user.click(
                screen.getByRole('button', { name: /continue to skills/i }),
            )

            expect(complete).toHaveBeenCalledTimes(1)
        })

        it('does not call apply when the merchant clicks Continue to skills', async () => {
            const apply = jest.fn()
            mockUseApplyWizardChanges.mockReturnValue(
                buildApplyResult({ apply }),
            )

            const user = userEvent.setup()
            renderRecap(
                buildWizard([
                    { id: 1, status: SkillWizardSkillStatus.Draft },
                    { id: 2, status: SkillWizardSkillStatus.Draft },
                ]),
            )

            await user.click(
                screen.getByRole('button', { name: /continue to skills/i }),
            )

            expect(apply).not.toHaveBeenCalled()
        })

        it('disables the Continue to skills button while complete is in flight', async () => {
            let resolveComplete!: () => void
            const complete = jest.fn(
                () =>
                    new Promise<void>((resolve) => {
                        resolveComplete = resolve
                    }),
            )
            mockUseSkillWizardMutations.mockReturnValue({
                complete,
            } as unknown as ReturnType<typeof useSkillWizardMutations>)

            const user = userEvent.setup()
            renderRecap(
                buildWizard([
                    { id: 1, status: SkillWizardSkillStatus.Draft },
                    { id: 2, status: SkillWizardSkillStatus.Draft },
                ]),
            )

            const continueButton = screen.getByRole('button', {
                name: /continue to skills/i,
            })
            await user.click(continueButton)

            await waitFor(() => {
                expect(continueButton).toHaveAttribute('aria-disabled', 'true')
            })

            await act(async () => {
                resolveComplete()
            })

            await waitFor(() => {
                expect(continueButton).toHaveAttribute('aria-disabled', 'false')
            })
        })

        it('surfaces a toast error and stays on the recap when complete fails on Continue to skills', async () => {
            const complete = jest
                .fn()
                .mockRejectedValue(new Error('network down'))
            mockUseSkillWizardMutations.mockReturnValue({
                complete,
            } as unknown as ReturnType<typeof useSkillWizardMutations>)

            const user = userEvent.setup()
            renderRecap(
                buildWizard([
                    { id: 1, status: SkillWizardSkillStatus.Draft },
                    { id: 2, status: SkillWizardSkillStatus.Draft },
                ]),
            )

            await user.click(
                screen.getByRole('button', { name: /continue to skills/i }),
            )

            expect(
                await screen.findByRole('status', {
                    name: /couldn't complete the wizard/i,
                }),
            ).toBeInTheDocument()
        })

        it('renders the enabling-skills loading screen during phase 1+2', () => {
            mockUseApplyWizardChanges.mockReturnValue(
                buildApplyResult({ phase: 'enabling-skills' }),
            )

            renderRecap(
                buildWizard([
                    { id: 1, status: SkillWizardSkillStatus.Approved },
                ]),
            )

            expect(
                screen.getByText('Enabling your skills...'),
            ).toBeInTheDocument()
        })

        it('renders the disabling-guidances loading screen during phase 3', () => {
            mockUseApplyWizardChanges.mockReturnValue(
                buildApplyResult({ phase: 'disabling-guidances' }),
            )

            renderRecap(
                buildWizard([
                    { id: 1, status: SkillWizardSkillStatus.Approved },
                ]),
            )

            expect(
                screen.getByText('Disabling guidance...'),
            ).toBeInTheDocument()
        })

        it('renders the success screen with the live skill count', () => {
            mockUseApplyWizardChanges.mockReturnValue(
                buildApplyResult({ phase: 'success', liveSkillsCount: 9 }),
            )

            renderRecap(
                buildWizard([
                    { id: 1, status: SkillWizardSkillStatus.Approved },
                ]),
            )

            expect(
                screen.getByRole('heading', { name: /9 skills are live/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/taking you to skills/i),
            ).toBeInTheDocument()
        })

        it('uses singular copy when exactly one skill is live', () => {
            mockUseApplyWizardChanges.mockReturnValue(
                buildApplyResult({ phase: 'success', liveSkillsCount: 1 }),
            )

            renderRecap(
                buildWizard([
                    { id: 1, status: SkillWizardSkillStatus.Approved },
                ]),
            )

            expect(
                screen.getByRole('heading', { name: /1 skill is live/i }),
            ).toBeInTheDocument()
        })
    })
})
