import { SkillWizardStatus } from './types'
import type { SkillsView } from './types'

export const formatIntentName = (name: string): string =>
    name
        .split('::')
        .map((part) => part.replace(/\b\w/g, (char) => char.toUpperCase()))
        .join(' / ')

export const getSkillsView = ({
    isSkillWizardEnabled,
    isWizardQueryLoading,
    wizardStatus,
}: {
    isSkillWizardEnabled: boolean
    isWizardQueryLoading: boolean
    wizardStatus: SkillWizardStatus | undefined
}): SkillsView => {
    if (!isSkillWizardEnabled) return 'no-wizard'
    if (isWizardQueryLoading) return 'wizard-loading'
    if (!wizardStatus) return 'no-wizard'
    if (wizardStatus === SkillWizardStatus.Completed) return 'wizard-completed'
    return 'wizard-active'
}
