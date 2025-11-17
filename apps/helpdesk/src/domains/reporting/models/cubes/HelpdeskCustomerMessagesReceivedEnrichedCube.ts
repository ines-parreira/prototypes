import type { TicketCubeWithJoins } from 'domains/reporting/models/cubes/TicketCube'
import type {
    Cube,
    JoinedCubesWithMapping,
} from 'domains/reporting/models/types'

export enum HelpdeskCustomerMessagesReceivedEnrichedMeasure {
    TicketCount = 'HelpdeskCustomerMessagesReceivedEnriched.ticketCount',
    MessageCount = 'HelpdeskCustomerMessagesReceivedEnriched.messageCount',
}

export enum HelpdeskCustomerMessagesReceivedEnrichedDimension {
    TicketId = 'HelpdeskCustomerMessagesReceivedEnriched.ticketId',
    SentDatetime = 'HelpdeskCustomerMessagesReceivedEnriched.sentDatetime',
    AccountId = 'HelpdeskCustomerMessagesReceivedEnriched.accountId',
}

export enum HelpdeskCustomerMessagesReceivedEnrichedMember {
    TicketId = 'HelpdeskCustomerMessagesReceivedEnriched.ticketId',
    SentDatetime = 'HelpdeskCustomerMessagesReceivedEnriched.sentDatetime',
    AccountId = 'HelpdeskCustomerMessagesReceivedEnriched.accountId',
}

type HelpdeskCustomerMessagesReceivedEnrichedTimeDimensions =
    ValueOf<HelpdeskCustomerMessagesReceivedEnrichedDimension.SentDatetime>

type HelpdeskCustomerMessagesReceivedEnrichedCube = Cube<
    HelpdeskCustomerMessagesReceivedEnrichedMeasure,
    HelpdeskCustomerMessagesReceivedEnrichedDimension,
    never,
    HelpdeskCustomerMessagesReceivedEnrichedMember,
    HelpdeskCustomerMessagesReceivedEnrichedTimeDimensions
>

export type HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins =
    JoinedCubesWithMapping<
        HelpdeskCustomerMessagesReceivedEnrichedCube,
        TicketCubeWithJoins
    >
