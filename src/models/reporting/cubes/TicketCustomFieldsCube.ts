import { Cube } from 'models/reporting/types'

export enum TicketCustomFieldsMeasure {
    TicketCustomFieldsTicketCount = 'TicketCustomFieldsEnriched.ticketCount',
}

export enum TicketCustomFieldsDimension {
    TicketCustomFieldsValueString = 'TicketCustomFieldsEnriched.valueString',
}

export enum TicketCustomFieldsMember {
    TicketCustomFieldsCustomFieldId = 'TicketCustomFieldsEnriched.customFieldId',
    TicketCustomFieldsValueString = 'TicketCustomFieldsEnriched.valueString',
    TicketCustomFieldsCustomFieldUpdatedDatetime = 'TicketCustomFieldsEnriched.customFieldUpdatedDatetime',
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
