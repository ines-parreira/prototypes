export enum InstallationError {
    NoHelpCenter = 'no-help-center',
}

export const InstallationErrorMessage = {
    [InstallationError.NoHelpCenter]:
        'This rule requires an active Help Center.',
}
