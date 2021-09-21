export enum HelpCenterThemes {
    LIGHT = 'light',
    DARK = 'dark',
}

export function isHelpCenterTheme(test: unknown): test is HelpCenterThemes {
    return Object.values(HelpCenterThemes).includes(test as HelpCenterThemes)
}
