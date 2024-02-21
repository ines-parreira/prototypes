import {ApiPaginationParams} from 'models/api/types'
import {THIRD_PARTY_APP_NAME_KEY} from 'state/widgets/constants'
import {
    Link,
    Button,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

export type Source = {
    [key: string]:
        | Source
        | string
        | number
        | boolean
        | Array<Source>
        | undefined
        | null
    [THIRD_PARTY_APP_NAME_KEY]?: string
}

export type LeafTypes =
    | 'text'
    | 'boolean'
    | 'date'
    | 'array'
    | 'email'
    | 'age'
    | 'url'
    | 'email'
    | 'sentiment'
    | 'rating'
    | 'points'
    | 'percent'
    | 'editableList'

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
    // for now, we rely on template object to set template path.
    // It should be a context instead
    templatePath?: string
}

export type Wrapper = baseTemplate & {
    type: 'wrapper'
    title?: string
    widgets: Array<Card | List>
    meta?: WrapperMeta
    // The type of 'path' here is due to getPreparedDisplayList in InfobarWidgets.tsx
    path: string[]
}

export type Card = baseTemplate & {
    type: 'card'
    // in the case card has a list as a parent, path is the path of the list
    path?: string
    title?: string
    order?: number
    widgets: Array<Card | List | Leaf>
    meta?: CardMeta
}

export type List = baseTemplate & {
    type: 'list'
    title?: string
    path: string
    widgets: Array<Card | Leaf>
    meta?: ListMeta
}

export type Leaf = baseTemplate & {
    type: LeafTypes
    path: string
    title: string
    // allows to access the widget property in any case
    widgets?: undefined
}

export type TemplateTypes = Template['type']

export type Template = Wrapper | Card | List | Leaf

export type PartialTemplate = DeepPartial<Template>

export type FetchWidgetsOptions = ApiPaginationParams & {
    orderBy?:
        | 'order:asc'
        | 'order:desc'
        | 'created_datetime:asc'
        | 'created_datetime:desc'
}
