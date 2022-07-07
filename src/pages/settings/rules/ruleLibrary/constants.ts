export enum InstallationError {
    MaxRulesReached = 'max-rule-reached',
    NoHelpCenter = 'no-help-center',
}

export const InstallationErrorMessage = {
    [InstallationError.NoHelpCenter]:
        'This rule requires an active Help Center.',
    [InstallationError.MaxRulesReached]:
        'You reached the maximum number of allowed rules. Remove unused rules to proceed.',
}
