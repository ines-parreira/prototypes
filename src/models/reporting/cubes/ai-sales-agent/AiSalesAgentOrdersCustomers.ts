import { Cube } from 'models/reporting/types'

export enum AiSalesAgentOrderCustomersMeasure {
    Count = 'AiSalesAgentOrderCustomers.count',
    RecurringCount = 'AiSalesAgentOrderCustomers.recurringCount',
    OrderCount = 'AiSalesAgentOrderCustomers.ordersCount',
}

export enum AiSalesAgentOrderCustomersDimension {
    AccountId = 'AiSalesAgentOrderCustomers.accountId',
    IntegrationId = 'AiSalesAgentOrderCustomers.integrationId',
    CustomerId = 'AiSalesAgentOrderCustomers.customerId',
    PeriodEnd = 'AiSalesAgentOrderCustomers.periodEnd',
    PeriodStart = 'AiSalesAgentOrderCustomers.periodStart',
}

export enum AiSalesAgentOrderCustomersFilterMember {
    AccountId = 'AiSalesAgentOrderCustomers.accountId',
    IntegrationId = 'AiSalesAgentOrderCustomers.integrationId',
    PeriodEnd = 'AiSalesAgentOrderCustomers.periodEnd',
    PeriodStart = 'AiSalesAgentOrderCustomers.periodStart',
}

export type AiSalesAgentOrderCustomersTimeDimension =
    | ValueOf<AiSalesAgentOrderCustomersFilterMember.PeriodStart>
    | ValueOf<AiSalesAgentOrderCustomersFilterMember.PeriodEnd>

export type AiSalesAgentOrderCustomersCube = Cube<
    AiSalesAgentOrderCustomersMeasure,
    AiSalesAgentOrderCustomersDimension,
    never,
    AiSalesAgentOrderCustomersFilterMember,
    AiSalesAgentOrderCustomersTimeDimension
>
