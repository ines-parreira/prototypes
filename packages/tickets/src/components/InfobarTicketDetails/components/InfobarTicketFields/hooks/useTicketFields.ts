import { useMemo } from 'react'

import { ObjectType } from '@gorgias/helpdesk-types'

import { useCustomFieldDefinitions } from './useCustomFieldDefinitions'
import { useCustomFieldsConditionsEvaluationResults } from './useCustomFieldsConditionsEvaluationResults'
import { useFilteredTicketFields } from './useFilteredTicketFields'

/**
 * High-level hook that orchestrates all the logic needed to get visible ticket fields
 *
 * This hook:
 * 1. Fetches field definitions (schemas)
 * 2. Evaluates conditional visibility rules (custom fields only)
 * 3. Filters to only visible fields based on AI-managed status and conditional rules
 *
 * @returns Object containing visible fields and loading states
 */
export function useTicketFields() {
    const {
        data: { data: ticketFieldDefinitions = [] } = {},
        isLoading: isLoadingDefinitions,
    } = useCustomFieldDefinitions({
        archived: false,
        object_type: ObjectType.Ticket,
    })

    const { evaluationResults, conditionsLoading } =
        useCustomFieldsConditionsEvaluationResults()

    const ticketFields = useFilteredTicketFields(
        ticketFieldDefinitions,
        evaluationResults,
    )

    const isLoading = isLoadingDefinitions || conditionsLoading

    return useMemo(
        () => ({
            ticketFields,
            isLoading,
        }),
        [ticketFields, isLoading],
    )
}
