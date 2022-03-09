import {Map} from 'immutable'

import {IntegrationType} from '../../models/integration/types'

export enum WidgetContextType {
    Ticket = 'ticket',
    Customer = 'customer',
}

export type WidgetContext = WidgetContextType | string

export enum WidgetTemplateType {
    Wrapper = 'wrapper',
}

export enum WidgetTemplateWidgetType {
    Card = 'card',
    Text = 'text',
    List = 'list',
}

export type WidgetTemplateWidget = {
    order?: number
    title?: string
    type: WidgetTemplateWidgetType
    widgets?: WidgetTemplateWidget[]
    path?: string
    meta?: Record<string, unknown>
}

export type WidgetTemplate = {
    type?: WidgetTemplateType
    meta?: {
        color: string
    }
    widgets?: WidgetTemplateWidget[]
}

export type WidgetDraft = {
    order: number
    type: IntegrationType | 'custom'
    context: WidgetContextType
    template: WidgetTemplate
}

export type Widget = WidgetDraft & {
    created_datetime: string
    deactivated_datetime: Maybe<string>
    id: number
    integration_id: Maybe<number>
    updated_datetime: Maybe<string>
    uri: string
}

export type WidgetsState = Map<any, any>
