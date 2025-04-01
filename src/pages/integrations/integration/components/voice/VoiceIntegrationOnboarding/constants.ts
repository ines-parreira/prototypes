export enum VoiceIntegrationOnboardingStep {
    AddPhoneNumber = 'add-phone-number',
    ConfigureRoutingBehavior = 'configure-routing-behavior',
}

export const onboardingStepsLabels: Record<
    VoiceIntegrationOnboardingStep,
    string
> = {
    [VoiceIntegrationOnboardingStep.AddPhoneNumber]: 'Add phone number',
    [VoiceIntegrationOnboardingStep.ConfigureRoutingBehavior]:
        'Configure routing behavior',
}
