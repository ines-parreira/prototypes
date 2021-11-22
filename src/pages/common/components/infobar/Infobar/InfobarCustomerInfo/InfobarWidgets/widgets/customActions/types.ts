export type Link = {
    url: string
    label: string
}

export type RemoveLink = (redirectionLinkIndex: number) => void
export type SubmitLink = (link: Link, index?: number) => void
export type LinksWidget = {
    links: Link[]
}
