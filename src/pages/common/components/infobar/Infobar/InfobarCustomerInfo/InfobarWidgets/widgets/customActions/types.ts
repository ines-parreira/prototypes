import {
    ContentType,
    HttpMethod,
} from '../../../../../../../../../models/api/types'

type JSONValue =
    | string
    | number
    | boolean
    | {[x: string]: JSONValue}
    | Array<JSONValue>

export type Link = {
    url: string
    label: string
}
export type RemoveLink = (redirectionLinkIndex: number) => void
export type SubmitLink = (link: Link, index?: number) => void

export type Parameter = {
    key: string
    value: string
    label: string
    editable: boolean
    mandatory: boolean
}
export type Action = {
    method: HttpMethod
    url: string
    headers: Parameter[]
    params: Parameter[]
    body: {
        contentType: ContentType
        [ContentType.Json]: JSONValue
        [ContentType.Form]: Parameter[]
    }
}

export type PayloadParameters = {
    [k: string]: string
}
export type ActionPayload = {
    method: HttpMethod
    url: string
    headers: PayloadParameters
    params: PayloadParameters
    content_type?: ContentType
    form: PayloadParameters
    json: JSONValue
}
export type OnChangeAction = (path: string, data: unknown) => void

export type Button = {
    label: string
    action: Action
}
export type OnSubmitButton = (button: Button, index?: number) => void
export type OnRemoveButton = (index: number) => void
export type OnOpenForm = (index?: number) => void
