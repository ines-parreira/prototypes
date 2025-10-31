import React, { useMemo } from 'react'

import { useCallbackRef, useElementSize, useId } from '@repo/hooks'
import cn from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'
import {
    CustomField,
    ObjectType,
    Ticket,
    TicketCompact,
    TicketCompactCustomFieldsAnyOf,
    useListCustomFields,
} from '@gorgias/helpdesk-queries'

import getWrappedElementCount from 'common/utils/getWrappedElementCount'
import { AI_MANAGED_TYPES, OBJECT_TYPES } from 'custom-fields/constants'
import { getShortValueLabel } from 'custom-fields/helpers/getValueLabels'
import { isFieldRequired } from 'custom-fields/helpers/isFieldRequired'
import { isFieldVisible } from 'custom-fields/helpers/isFieldVisible'
import { CustomFieldAIManagedType, CustomFieldValue } from 'custom-fields/types'

import { useCustomFieldsConditionsEvaluationResults } from '../custom-fields/hooks/useCustomFieldsConditionsEvaluationResults'

import css from './TicketFields.less'

type TicketFieldsProps = {
    fieldValues: TicketCompact['custom_fields']
    ticket: TicketCompact | Ticket
    className?: string
    isMultiline?: boolean
    isBold?: boolean
}

const ID_PREFIX = 'expand-tags-badge-'

export default function TicketFields({
    fieldValues: maybeFieldValues,
    ticket,
    className,
    isMultiline = false,
    isBold = false,
}: TicketFieldsProps) {
    const { data, isLoading } = useListCustomFields({
        object_type: ObjectType.Ticket,
        archived: false,
        limit: 100,
    })
    const {
        evaluationResults: ticketFieldConditionsEvaluationResults,
        conditionsLoading: ticketFieldConditionsLoading,
    } = useCustomFieldsConditionsEvaluationResults(OBJECT_TYPES.TICKET, ticket)
    const definitions = useMemo(
        () => data?.data?.data || [],
        [data?.data?.data],
    )

    const filteredDefinitions = useMemo(
        () =>
            definitions.filter(
                (definition) =>
                    !definition.managed_type ||
                    !Object.values(AI_MANAGED_TYPES).includes(
                        definition.managed_type as CustomFieldAIManagedType,
                    ),
            ),
        [definitions],
    )

    const visibleFieldIds = useMemo(() => {
        const fieldSet = new Set<number>()

        filteredDefinitions.forEach((fieldDefinition) => {
            const isRequired = isFieldRequired(
                fieldDefinition,
                ticketFieldConditionsEvaluationResults[fieldDefinition.id],
            )

            const isVisible =
                isRequired ||
                isFieldVisible(
                    fieldDefinition,
                    ticketFieldConditionsEvaluationResults[fieldDefinition.id],
                )

            if (isVisible) {
                fieldSet.add(fieldDefinition.id)
            }
        })

        return fieldSet
    }, [filteredDefinitions, ticketFieldConditionsEvaluationResults])

    const fieldValues = maybeFieldValues === null ? {} : maybeFieldValues || {}

    const allTicketFieldIds = Object.keys(fieldValues)
    const ticketFieldIds = allTicketFieldIds.filter((id) =>
        visibleFieldIds.has(Number(id)),
    )
    const hasTicketFields = ticketFieldIds.length > 0

    const [fieldsContainer, setFieldsContainer] = useCallbackRef()
    // Triggers re-render when the size of the fieldsContainer changes
    useElementSize(fieldsContainer)
    const wrappedTicketFieldCount = getWrappedElementCount(fieldsContainer)
    const hiddenTicketFieldIds = ticketFieldIds.slice(
        ticketFieldIds.length - wrappedTicketFieldCount,
    )

    return (
        <div
            className={cn(css.ticketFields, className, {
                [css.autoHeight]: isMultiline,
            })}
        >
            {isLoading || ticketFieldConditionsLoading ? (
                <div className={css.loading}>Loading ticket fields...</div>
            ) : !hasTicketFields ? (
                'No ticket fields yet'
            ) : (
                <ul ref={setFieldsContainer} className={css.fieldList}>
                    {ticketFieldIds.map((id: string, i) => {
                        return (
                            <React.Fragment key={id}>
                                {wrappedTicketFieldCount > 0 &&
                                    !isMultiline &&
                                    wrappedTicketFieldCount ===
                                        ticketFieldIds.length - i && (
                                        <ShowMore
                                            count={wrappedTicketFieldCount}
                                            remainingFieldIds={
                                                hiddenTicketFieldIds
                                            }
                                            definitions={definitions}
                                            fieldValues={fieldValues}
                                        />
                                    )}
                                <li key={id} className={css.ticketField}>
                                    <span className={css.fieldName}>
                                        {getCustomFieldLabel(
                                            definitions,
                                            Number(id),
                                        )}
                                    </span>
                                    :&nbsp;
                                    <span
                                        className={cn(css.fieldValue, {
                                            [css.bold]: isBold,
                                        })}
                                    >
                                        {getShortValueLabel(
                                            fieldValues[id]
                                                ?.value as CustomFieldValue,
                                        )}
                                    </span>
                                </li>
                            </React.Fragment>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

function getCustomFieldLabel(
    definitions: CustomField[],
    customFieldId: number,
) {
    const definition = definitions.find(
        (definition) => definition.id === customFieldId,
    )
    return definition?.label || `Custom Field ${customFieldId}`
}

type ShowMoreProps = {
    count: number
    remainingFieldIds: string[]
    definitions: CustomField[]
    fieldValues: TicketCompactCustomFieldsAnyOf
}

function ShowMore({
    count,
    remainingFieldIds,
    definitions,
    fieldValues,
}: ShowMoreProps) {
    const uniqueId = useId()
    return (
        <div id={`${ID_PREFIX}${uniqueId}`} className={css.more}>
            +{count} more
            <Tooltip target={`${ID_PREFIX}${uniqueId}`}>
                <ul className={css.tooltipContent}>
                    {remainingFieldIds?.map((id) => {
                        return (
                            <li key={id}>
                                {getCustomFieldLabel(definitions, Number(id))}
                                :&nbsp;
                                <span className={css.tooltipValue}>
                                    {getShortValueLabel(
                                        fieldValues[id]
                                            ?.value as CustomFieldValue,
                                    )}
                                </span>
                            </li>
                        )
                    })}
                </ul>
            </Tooltip>
        </div>
    )
}
