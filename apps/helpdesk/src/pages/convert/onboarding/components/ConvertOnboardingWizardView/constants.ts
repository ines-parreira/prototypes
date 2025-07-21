export enum OnboardingWizardSteps {
    Campaigns = 'campaigns',
    Install = 'install',
}

export const ONBOARDING_WIZARD_LABELS: Record<OnboardingWizardSteps, string> = {
    [OnboardingWizardSteps.Campaigns]: 'Campaigns',
    [OnboardingWizardSteps.Install]: 'Install bundle',
}
