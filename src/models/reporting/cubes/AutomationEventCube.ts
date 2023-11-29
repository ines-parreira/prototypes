import {Cube} from 'models/reporting/types'

export enum AutomationEventDimension {
    Channel = 'AutomationEvent.channel',
    AccountId = 'AutomationEvent.accountId',
}

export enum AutomationEventMember {
    PeriodStart = 'AutomationEvent.periodStart',
    PeriodEnd = 'AutomationEvent.periodEnd',
    CreatedDate = 'AutomationEvent.createdDate',
    Channel = 'AutomationEvent.channel',
}

type AutomationEventTimeDimension =
    | ValueOf<AutomationEventMember.PeriodEnd>
    | ValueOf<AutomationEventMember.PeriodStart>
    | ValueOf<AutomationEventMember.CreatedDate>

export type AutomationEventCube = Cube<
    never,
    AutomationEventDimension,
    AutomationEventMember,
    never,
    AutomationEventTimeDimension
>
