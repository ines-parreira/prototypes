export enum HelpCenterLayout {
    DEFAULT = 'default',
    ONEPAGER = '1-pager',
}

export function isHelpCenterLayout(test: unknown): test is HelpCenterLayout {
    return Object.values(HelpCenterLayout).includes(test as HelpCenterLayout)
}
