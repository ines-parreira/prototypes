export enum InstallationError {
    MaxRulesReached = 'max-rule-reached',
    NoHelpCenter = 'no-help-center',
}

export const InstallationErrorMessage = {
    [InstallationError.NoHelpCenter]:
        'This rule requires an active Help Center.',
    [InstallationError.MaxRulesReached]:
        'You’ve reached the maximum number of rules. Delete an existing rule to install this one.',
}
