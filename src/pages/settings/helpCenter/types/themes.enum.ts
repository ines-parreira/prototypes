export enum HelpCenterTheme {
    LIGHT = 'light',
    DARK = 'dark',
}

export function isHelpCenterTheme(test: unknown): test is HelpCenterTheme {
    return Object.values(HelpCenterTheme).includes(test as HelpCenterTheme)
}
