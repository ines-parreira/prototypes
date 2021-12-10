import {
    ContentType,
    HttpMethod,
} from '../../../../../../../../../models/api/types'

export type Link = {
    url: string
    label: string
}
export type RemoveLink = (redirectionLinkIndex: number) => void
export type SubmitLink = (link: Link, index?: number) => void
export type LinksWidget = {
    links: Link[]
}

export type Parameter = {
    key: string
    value: string
    label: string
    editable: boolean
    mandatory: boolean
}
export type ActionType = {
    method: HttpMethod
    url: string
    headers: Parameter[]
    params: Parameter[]
    body: {
        content_type?: ContentType
        [ContentType.Json]?: string
        [ContentType.Form]?: Parameter[]
    }
}
export type OnChangeAction = (path: string, data: unknown) => void

export type Button = {
    label: string
    action: ActionType
}
export type OnSubmitButton = (button: Button, index?: number) => void
export type OnRemoveButton = (index: number) => void
export type OnOpenForm = (index?: number) => void
export type ButtonsWidget = {
    buttons: Button[]
}
