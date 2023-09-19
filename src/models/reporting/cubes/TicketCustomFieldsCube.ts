import {Cube} from 'models/reporting/types'

export enum TicketCustomFieldsMeasure {
    TicketCustomFieldsTicketCount = 'TicketCustomFields.ticketCount',
}

export enum TicketCustomFieldsDimension {
    TicketCustomFieldsValueString = 'TicketCustomFields.valueString',
}

export enum TicketCustomFieldsMember {
    TicketCustomFieldsCustomFieldId = 'TicketCustomFields.customFieldId',
    TicketCustomFieldsValueString = 'TicketCustomFields.valueString',
    TicketCustomFieldsCustomFieldUpdatedDatetime = 'TicketCustomFields.customFieldUpdatedDatetime',
}

export type TicketCustomFieldsTimeDimensions =
    ValueOf<TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime>

export type TicketCustomFieldsCube = Cube<
    TicketCustomFieldsMeasure,
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
    never,
    TicketCustomFieldsTimeDimensions
>
