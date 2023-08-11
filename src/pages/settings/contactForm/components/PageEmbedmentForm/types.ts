import {Components} from 'rest_api/help_center_api/client.generated'

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
    title: string
}

export type PageEmbedmentFormValueStateWithError<T = string> = {
    value: T
    error: string
}

export type EmbeddablePage = Components.Schemas.ShopifyPageDto
