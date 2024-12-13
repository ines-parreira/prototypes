import {CustomField} from 'custom-fields/types'
import {OrderDirection} from 'models/api/types'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {TicketCustomFieldsMember} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {customerSatisfactionPerCustomFieldQueryFactory} from 'models/reporting/queryFactories/ai-agent-insights/metrics'
import {
    customFieldsTicketTotalCountQueryFactory,
    customFieldsTicketFactory,
    customFieldsTicketCountQueryFactory,
} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

import {useMetric} from '../useMetric'
import {useMetricPerDimension} from '../useMetricPerDimension'
import {
    CUSTOM_FIELD_AI_AGENT_HANDOVER,
    CUSTOM_FIELD_AI_AGENT_CLOSE,
} from './types'

export const useTotalAiAgentTicketsByCustomField = (
    filters: StatsFilters,
    timezone: string,
    customField: CustomField | undefined,
    sorting?: OrderDirection
) =>
    useMetric(
        customFieldsTicketTotalCountQueryFactory(
            filters,
            timezone,
            String(customField?.id),
            sorting
        )
    )

export const useAiAgenTickets = (
    filters: StatsFilters,
    timezone: string,
    customField: CustomField | undefined,
    customFieldFilter?:
        | typeof CUSTOM_FIELD_AI_AGENT_HANDOVER
        | typeof CUSTOM_FIELD_AI_AGENT_CLOSE,
    sorting?: OrderDirection
) =>
    useMetricPerDimension(
        customFieldsTicketFactory(
            filters,
            timezone,
            String(customField?.id),
            customFieldFilter
                ? {
                      member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                      operator: ReportingFilterOperator.Contains,
                      values: [customFieldFilter],
                  }
                : undefined,
            sorting
        )
    )

export const useAiAgentTicketCountPerIntent = (
    filters: StatsFilters,
    timezone: string,
    customField: CustomField | undefined,
    ticketIds?: string[] | undefined,
    sorting?: OrderDirection
) =>
    useMetricPerDimension(
        customFieldsTicketCountQueryFactory(
            filters,
            timezone,
            String(customField?.id),
            sorting,
            ...(ticketIds && ticketIds.length
                ? [
                      {
                          member: TicketDimension.TicketId,
                          operator: ReportingFilterOperator.In,
                          values: ticketIds,
                      },
                  ]
                : [])
        )
    )

export const useCustomerSatisfactionMetricPerIntent = (
    filters: StatsFilters,
    timezone: string,
    customField: CustomField | undefined,
    sorting?: OrderDirection
) =>
    useMetricPerDimension(
        customerSatisfactionPerCustomFieldQueryFactory(
            filters,
            timezone,
            sorting,
            customField
                ? {
                      member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                      operator: ReportingFilterOperator.Equals,
                      values: [String(customField.id)],
                  }
                : undefined
        )
    )
