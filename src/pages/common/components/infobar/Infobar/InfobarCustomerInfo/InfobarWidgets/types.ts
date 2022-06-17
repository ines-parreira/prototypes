import {
    Link,
    Button,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

export type WidgetTypes = 'wrapper' | 'card' | 'list'
export type DataTypes = 'text' | 'boolean' | 'array' | 'email'

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
    limit: string
    orderBy: string
}

type baseTemplate = {
    widgets?: Template[]
    order?: number
}

// The type of 'path' in WrapperTemplate is due to _getPreparedDisplayList in InfobarWidgets.js

export type WrapperTemplate = baseTemplate & {
    type: 'wrapper'
    path: string[]
    meta?: WrapperMeta
}

export type CardTemplate = baseTemplate & {
    meta?: CardMeta
    type: 'card'
    path: string
    title: string
}

export type ListTemplate = baseTemplate & {
    meta: ListMeta
    type: 'list'
    path: string
    title?: string
}

export type DataTemplate = {
    path: string
    type: DataTypes
    title: string
}

export type Template =
    | WrapperTemplate
    | CardTemplate
    | ListTemplate
    | DataTemplate

export type PartialTemplate = DeepPartial<Template>
