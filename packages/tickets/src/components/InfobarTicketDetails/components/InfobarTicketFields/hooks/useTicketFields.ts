import { useMemo } from 'react'

import { ObjectType } from '@gorgias/helpdesk-types'

import { useInitializeTicketFieldsStore } from '../store/useInitializeTicketFieldsStore'
import { useCustomFieldDefinitions } from './useCustomFieldDefinitions'
import { useCustomFieldsConditionsEvaluationResults } from './useCustomFieldsConditionsEvaluationResults'
import { useFilteredTicketFields } from './useFilteredTicketFields'

/**
 * High-level hook that orchestrates all the logic needed to get visible ticket fields
 *
 * This hook:
 * 1. Initializes the Zustand store with field values from API
 * 2. Fetches field definitions (schemas)
 * 3. Evaluates conditional visibility rules (custom fields only)
 * 4. Filters to only visible fields based on AI-managed status and conditional rules
 *
 * @param ticketId - The ticket ID to fetch and display fields for
 * @returns Object containing visible fields and loading states
 */
export function useTicketFields(ticketId: string) {
    const { isLoading: isInitializing } =
        useInitializeTicketFieldsStore(ticketId)

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

    const isLoading =
        isInitializing || isLoadingDefinitions || conditionsLoading

    return useMemo(
        () => ({
            ticketFields,
            isLoading,
            isInitializing,
            isLoadingDefinitions,
            conditionsLoading,
        }),
        [
            ticketFields,
            isLoading,
            isInitializing,
            isLoadingDefinitions,
            conditionsLoading,
        ],
    )
}
