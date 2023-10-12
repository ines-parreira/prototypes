export enum PageEmbedmentPosition {
    TOP = 'TOP',
    BOTTOM = 'BOTTOM',
}

export enum EmbedMode {
    NEW_PAGE = 'embed-on-new-page',
    EXISTING_PAGE = 'embed-on-existing-page',
}

export type SelectedPage = {
    external_id: string
    title: string
}

export type PageEmbedmentFormValueStateWithError<T = string> = {
    value: T
    error: string
    isTouched?: true
}

export type EmbeddablePage = {
    external_id: string
    title: string
    url_path: string
    body_html: string | null
}
