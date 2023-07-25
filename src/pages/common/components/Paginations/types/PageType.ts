export type PageType =
    | 'page'
    | 'previous'
    | 'start-ellipsis'
    | 'end-ellipsis'
    | 'next'

export function isPageType(type: string): type is PageType {
    return (
        type === 'page' ||
        type === 'previous' ||
        type === 'start-ellipsis' ||
        type === 'end-ellipsis' ||
        type === 'next'
    )
}
