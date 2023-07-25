export enum PagePosition {
    TOP = 'top',
    BOTTOM = 'bottom',
}

export enum EmbedMode {
    NEW_PAGE = 'embed-on-new-page',
    EXISTING_PAGE = 'embed-on-existing-page',
}

export type SelectedPage = {
    id: string
    name: string
}

export type PageEmbedmentFormValueStateWithError<T = string> = {
    value: T
    error: string
}

export type ShopifyPage = {id: string; name: string; slug: string}
