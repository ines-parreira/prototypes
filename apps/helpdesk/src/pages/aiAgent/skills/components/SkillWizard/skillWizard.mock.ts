export enum SkillWizardStatus {
    NotStarted = 'not_started',
    InProgress = 'in_progress',
    Completed = 'completed',
}

export enum SkillWizardStep {
    Review = 'review',
    Recap = 'recap',
}

export enum SkillWizardSkillStatus {
    Draft = 'draft',
    Approved = 'approved',
}

export type SkillWizardSkillConfiguration = {
    id: number
    status: SkillWizardSkillStatus
}

export type SkillWizardState = {
    current_step?: SkillWizardStep
    current_skill_id?: number
    skills_configuration?: SkillWizardSkillConfiguration[]
}

export type GaiaAnalysisPeriod = {
    start: string
    end: string
    total_tickets: number
}

export type GaiaRecommendation = {
    skill_id: number
    estimated_automation_rate_impact: string
    recommendation: string
    guidance_ids: number[]
    action_configuration_ids: string[]
}

export type GaiaPayload = {
    generated_at?: string
    analysis_period?: GaiaAnalysisPeriod
    recommendations?: GaiaRecommendation[]
}

export type SkillWizard = {
    id: number
    account_id: number
    shop_integration_id: number
    help_center_id: number
    gaia_payload: GaiaPayload
    state: SkillWizardState
    status: SkillWizardStatus
    started_datetime: string | null
    completed_datetime: string | null
    last_nudge_sent_datetime: string | null
    created_datetime: string
    updated_datetime: string
}

export const mockGaiaPayload: GaiaPayload = {
    generated_at: '2026-04-28T10:15:00.000Z',
    analysis_period: {
        start: '2026-03-01T00:00:00.000Z',
        end: '2026-04-27T23:59:59.000Z',
        total_tickets: 18420,
    },
    recommendations: [
        {
            skill_id: 5851420,
            estimated_automation_rate_impact: '+4.20%',
            recommendation:
                'Create a skill to automate "Where is my order?" requests by pulling tracking info from Shopify and replying with the latest carrier status.',
            guidance_ids: [4928559, 1916596],
            action_configuration_ids: [
                '01JKT3YTVYT9D3H32R328WYMN4',
                '01JN0RJ1M1PG4DATZ7S4CYZ5J2',
                '01HZSCNPP5KTXEAAKNG03TXAW2',
                '01KNTG58X93ZB19Q6EH15GFBXA',
            ],
        },
        {
            skill_id: 5915217,
            estimated_automation_rate_impact: '+2.80%',
            recommendation:
                'Add a skill to handle return requests within the eligibility window by generating a return label and sharing return policy details.',
            guidance_ids: [503],
            action_configuration_ids: ['9002', '9003'],
        },
        {
            skill_id: 5891418,
            estimated_automation_rate_impact: '+1.95%',
            recommendation:
                'Automate cancellation requests for orders that have not yet shipped by canceling in Shopify and confirming the refund timeline.',
            guidance_ids: [504, 505],
            action_configuration_ids: ['9004'],
        },
    ],
}

export const mockSkillWizardStateNotStarted: SkillWizardState = {
    skills_configuration: [
        { id: 5851420, status: SkillWizardSkillStatus.Approved },
        { id: 5915217, status: SkillWizardSkillStatus.Approved },
    ],
}

export const mockSkillWizardStateInProgress: SkillWizardState = {
    current_step: SkillWizardStep.Review,
    current_skill_id: 5891418,
    skills_configuration: [
        { id: 5851420, status: SkillWizardSkillStatus.Approved },
        { id: 5915217, status: SkillWizardSkillStatus.Draft },
    ],
}

export const mockSkillWizardStateCompleted: SkillWizardState = {
    current_step: SkillWizardStep.Recap,
    skills_configuration: [
        { id: 5851420, status: SkillWizardSkillStatus.Approved },
        { id: 5915217, status: SkillWizardSkillStatus.Approved },
        { id: 5891418, status: SkillWizardSkillStatus.Draft },
        { id: 5915217, status: SkillWizardSkillStatus.Approved },
    ],
}

export const mockSkillWizardNotStarted: SkillWizard = {
    id: 1,
    account_id: 6069,
    shop_integration_id: 7,
    help_center_id: 21,
    gaia_payload: mockGaiaPayload,
    state: mockSkillWizardStateNotStarted,
    status: SkillWizardStatus.NotStarted,
    started_datetime: null,
    completed_datetime: null,
    last_nudge_sent_datetime: null,
    created_datetime: '2026-04-28T10:15:00.000Z',
    updated_datetime: '2026-04-28T10:15:00.000Z',
}

export const mockSkillWizardInProgress: SkillWizard = {
    id: 2,
    account_id: 6069,
    shop_integration_id: 7,
    help_center_id: 22,
    gaia_payload: mockGaiaPayload,
    state: mockSkillWizardStateInProgress,
    status: SkillWizardStatus.InProgress,
    started_datetime: '2026-04-29T08:30:00.000Z',
    completed_datetime: null,
    last_nudge_sent_datetime: '2026-05-02T09:00:00.000Z',
    created_datetime: '2026-04-28T10:15:00.000Z',
    updated_datetime: '2026-05-02T16:45:00.000Z',
}

export const mockSkillWizardCompleted: SkillWizard = {
    id: 3,
    account_id: 6069,
    shop_integration_id: 7,
    help_center_id: 23,
    gaia_payload: mockGaiaPayload,
    state: mockSkillWizardStateCompleted,
    status: SkillWizardStatus.Completed,
    started_datetime: '2026-04-29T08:30:00.000Z',
    completed_datetime: '2026-05-04T14:20:00.000Z',
    last_nudge_sent_datetime: '2026-05-02T09:00:00.000Z',
    created_datetime: '2026-04-28T10:15:00.000Z',
    updated_datetime: '2026-05-04T14:20:00.000Z',
}

export const mockSkillWizards: SkillWizard[] = [
    mockSkillWizardNotStarted,
    mockSkillWizardInProgress,
    mockSkillWizardCompleted,
]
