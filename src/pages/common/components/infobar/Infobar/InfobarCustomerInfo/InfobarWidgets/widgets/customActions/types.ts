export type Link = {
    url: string
    label: string
}
export type RemoveLink = (redirectionLinkIndex: number) => void
export type SubmitLink = (link: Link, index?: number) => void
export type LinksWidget = {
    links: Link[]
}

export type Button = {
    label: string
}
export type OnSubmitButton = (button: Button, index?: number) => void
export type OnRemoveButton = (index: number) => void
export type OnOpenForm = (index?: number) => void
export type ButtonsWidget = {
    buttons: Button[]
}
