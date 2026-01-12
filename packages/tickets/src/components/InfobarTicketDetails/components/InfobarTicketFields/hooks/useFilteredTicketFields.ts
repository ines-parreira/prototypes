import { useMemo } from 'react'

import type { CustomField, ExpressionFieldType } from '@gorgias/helpdesk-types'

import type { AITicketManagedType } from '../utils/constants'
import { AITicketManagedTypes } from '../utils/constants'
import { isFieldRequired } from '../utils/isFieldRequired'
import { isFieldVisible } from '../utils/isFieldVisible'

export type VisibleTicketField = {
    fieldDefinition: CustomField
    isRequired: boolean
}

export type TicketFieldConditionsEvaluationResults = Record<
    number,
    ExpressionFieldType | undefined
>

export function useFilteredTicketFields(
    ticketFieldDefinitions: CustomField[],
    ticketFieldConditionsEvaluationResults: TicketFieldConditionsEvaluationResults,
): VisibleTicketField[] {
    // Hide AI managed fields
    // TODO(CSR): Remove this once AI managed fields are migrated to conditional
    const filteredTicketFieldDefinitions = useMemo(
        () =>
            ticketFieldDefinitions.filter(
                (definition) =>
                    !definition.managed_type ||
                    !Object.values(AITicketManagedTypes).includes(
                        definition.managed_type as AITicketManagedType,
                    ),
            ),
        [ticketFieldDefinitions],
    )
    const visibleTicketFields = useMemo(
        () =>
            filteredTicketFieldDefinitions.reduce((acc, fieldDefinition) => {
                const isRequired = isFieldRequired(
                    fieldDefinition,
                    ticketFieldConditionsEvaluationResults[fieldDefinition.id],
                )

                const isVisible =
                    isRequired ||
                    isFieldVisible(
                        fieldDefinition,
                        ticketFieldConditionsEvaluationResults[
                            fieldDefinition.id
                        ],
                    )

                if (isVisible) {
                    return [
                        ...acc,
                        {
                            fieldDefinition,
                            isRequired,
                        },
                    ]
                }

                return acc
            }, [] as VisibleTicketField[]),
        [
            filteredTicketFieldDefinitions,
            ticketFieldConditionsEvaluationResults,
        ],
    )

    return visibleTicketFields
}
