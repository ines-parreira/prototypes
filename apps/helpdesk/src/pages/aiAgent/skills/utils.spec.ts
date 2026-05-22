import { SkillWizardStatus } from './types'
import { formatIntentName, getSkillsView } from './utils'

describe('formatIntentName', () => {
    it('capitalizes each part and joins with " / "', () => {
        expect(formatIntentName('order::status')).toBe('Order / Status')
    })

    it('capitalizes multi-word parts', () => {
        expect(formatIntentName('order::missing item')).toBe(
            'Order / Missing Item',
        )
    })

    it('handles names without a namespace separator', () => {
        expect(formatIntentName('other')).toBe('Other')
    })

    it('handles more than two parts', () => {
        expect(formatIntentName('a::b::c')).toBe('A / B / C')
    })

    it('handles names with special characters like "&"', () => {
        expect(formatIntentName('promotion & discount::information')).toBe(
            'Promotion & Discount / Information',
        )
    })
})

describe('getSkillsView', () => {
    it('returns "no-wizard" when the feature flag is disabled', () => {
        expect(
            getSkillsView({
                isSkillWizardEnabled: false,
                isWizardQueryLoading: false,
                wizardStatus: SkillWizardStatus.InProgress,
            }),
        ).toBe('no-wizard')
    })

    it('returns "wizard-loading" when the wizard query is loading', () => {
        expect(
            getSkillsView({
                isSkillWizardEnabled: true,
                isWizardQueryLoading: true,
                wizardStatus: undefined,
            }),
        ).toBe('wizard-loading')
    })

    it('returns "no-wizard" when the wizard is enabled but no wizard exists', () => {
        expect(
            getSkillsView({
                isSkillWizardEnabled: true,
                isWizardQueryLoading: false,
                wizardStatus: undefined,
            }),
        ).toBe('no-wizard')
    })

    it('returns "wizard-completed" when the wizard status is completed', () => {
        expect(
            getSkillsView({
                isSkillWizardEnabled: true,
                isWizardQueryLoading: false,
                wizardStatus: SkillWizardStatus.Completed,
            }),
        ).toBe('wizard-completed')
    })

    it('returns "wizard-active" when the wizard is not started', () => {
        expect(
            getSkillsView({
                isSkillWizardEnabled: true,
                isWizardQueryLoading: false,
                wizardStatus: SkillWizardStatus.NotStarted,
            }),
        ).toBe('wizard-active')
    })

    it('returns "wizard-active" when the wizard is in progress', () => {
        expect(
            getSkillsView({
                isSkillWizardEnabled: true,
                isWizardQueryLoading: false,
                wizardStatus: SkillWizardStatus.InProgress,
            }),
        ).toBe('wizard-active')
    })
})
