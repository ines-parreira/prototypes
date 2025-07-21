export enum HelpCenterArticleModalView {
    BASIC = 'basic',
    ADVANCED = 'advanced',
}

export type HelpCenterArticleModalState = {
    isOpened: boolean
    view: HelpCenterArticleModalView | null
}
