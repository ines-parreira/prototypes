import {Map, List} from 'immutable'

import {isRecord} from 'utils/types'
import {ApiPaginationParams} from 'models/api/types'
import {THIRD_PARTY_APP_NAME_KEY} from 'state/widgets/constants'
import {
    Link,
    Button,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

import {LEAF_TYPES} from './constants'

export type ImmutableSource =
    | Map<string, unknown>
    | List<Map<string, unknown>>
    | undefined
    | null

export type Source =
    | {
          [key: string]: Source
          [THIRD_PARTY_APP_NAME_KEY]?: string
      }
    | null
    | undefined
    | Array<Source>
    | string
    | number
    | boolean

export function isSourceRecord(
    source: Source
): source is Record<string, Source> {
    return isRecord(source)
}

export function isSourceArray(source: Source): source is Source[] {
    return Array.isArray(source)
}

export type LeafType = (typeof LEAF_TYPES)[keyof typeof LEAF_TYPES]

export function isLeafType(type: string): type is LeafType {
    return Object.values(LEAF_TYPES).includes(type as LeafType)
}

export type WrapperMeta = {
    color?: string
}

export type CardMeta = {
    link?: string
    color?: string
    custom?: {
        links?: Link[]
        buttons?: Button[]
    }
    pictureUrl?: string
    displayCard?: boolean
}

export type ListMeta = {
    limit: number | string
    orderBy: string
}

type baseTemplate = {
    order?: number
    // for now, we rely on template object to set template/absolute path.
    // It should be a context instead
    templatePath?: string
    absolutePath?: (number | string)[]
    path?: string
}

export type WrapperTemplate = baseTemplate & {
    type: 'wrapper'
    title?: string
    widgets?: Array<CardTemplate | ListTemplate>
    meta?: WrapperMeta
}

export type CardTemplate = baseTemplate & {
    type: 'card'
    title?: string
    order?: number
    widgets?: Array<CardTemplate | ListTemplate | LeafTemplate>
    meta?: CardMeta
}

export type ListTemplate = baseTemplate & {
    type: 'list'
    title?: string
    widgets: Array<CardTemplate | LeafTemplate>
    meta?: ListMeta
}

export type LeafTemplate = baseTemplate & {
    // We can’t guarantee that type is LeafType because backend is compromised
    type: string
    title: string
    // TODO: remove this when we set proper typeguards
    // this allows to access the properties in any case
    widgets?: undefined
}

export type TemplateTypes = Template['type']

export type Template =
    | WrapperTemplate
    | CardTemplate
    | ListTemplate
    | LeafTemplate

export type PartialTemplate = DeepPartial<Template>

export type FetchWidgetsOptions = ApiPaginationParams & {
    orderBy?:
        | 'order:asc'
        | 'order:desc'
        | 'created_datetime:asc'
        | 'created_datetime:desc'
}

export function isWrapperTemplate(
    template?: Template
): template is WrapperTemplate {
    return template?.type === 'wrapper'
}

export function isCardTemplate(template?: Template): template is CardTemplate {
    return template?.type === 'card'
}

export function isListTemplate(template?: Template): template is ListTemplate {
    return template?.type === 'list'
}

// LeafType can actually also be a string because we don’t check it on the backend yet
export function isLeafTemplate(template?: Template): template is LeafTemplate {
    return (
        isLeafType(template?.type || '') ||
        (!isCardTemplate(template) &&
            !isListTemplate(template) &&
            !isWrapperTemplate(template))
    )
}
