export enum VoiceIntegrationOnboardingStep {
    AddPhoneNumber = 'add-phone-number',
    ConfigureCallFlow = 'configure-call-flow',
}

export const onboardingStepsLabels: Record<
    VoiceIntegrationOnboardingStep,
    string
> = {
    [VoiceIntegrationOnboardingStep.AddPhoneNumber]: 'Add phone number',
    [VoiceIntegrationOnboardingStep.ConfigureCallFlow]: 'Configure call flow',
}
