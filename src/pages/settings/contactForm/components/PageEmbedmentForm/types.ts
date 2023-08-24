export enum PagePosition {
    TOP = 'TOP',
    BOTTOM = 'BOTTOM',
}

export enum EmbedMode {
    NEW_PAGE = 'embed-on-new-page',
    EXISTING_PAGE = 'embed-on-existing-page',
}

export type SelectedPage = {
    id: string
    title: string
}

export type PageEmbedmentFormValueStateWithError<T = string> = {
    value: T
    error: string
}
