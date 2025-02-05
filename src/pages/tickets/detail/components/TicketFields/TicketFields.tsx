import {
    CustomFieldRequirementType,
    ExpressionFieldType,
} from '@gorgias/api-types'
import classNames from 'classnames'
import React, {memo, useEffect, useMemo, useState} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'
import {AI_MANAGED_TYPES, OBJECT_TYPES} from 'custom-fields/constants'
import {isFieldRequired} from 'custom-fields/helpers/isFieldRequired'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'

import {useCustomFieldsConditionsEvaluationResults} from 'custom-fields/hooks/useCustomFieldsConditionsEvaluationResults'
import {CustomField} from 'custom-fields/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useHasWrapped from 'hooks/useHasWrapped'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {setHasAttemptedToCloseTicket} from 'state/ticket/actions'
import {
    getHasAttemptedToCloseTicket,
    getTicketFieldState,
    getTicket,
} from 'state/ticket/selectors'

import useHeight, {
    MAX_HEIGHT as FIELDS_CONTAINER_MAX_HEIGHT,
} from './hooks/useHeight'
import TicketField from './TicketField'
import css from './TicketFields.less'

const isFieldVisible = (
    fieldDefinition: CustomField,
    conditionalRequirementType?: ExpressionFieldType
): boolean => {
    return (
        (fieldDefinition.required === false &&
            fieldDefinition.requirement_type !==
                CustomFieldRequirementType.Conditional) ||
        (fieldDefinition.requirement_type ===
            CustomFieldRequirementType.Conditional &&
            conditionalRequirementType === ExpressionFieldType.Visible)
    )
}

function TicketFields() {
    const dispatch = useAppDispatch()
    const ticketState = useAppSelector(getTicket)
    const ticketFieldState = useAppSelector(getTicketFieldState)
    const [showAllFields, setShowAllFields] = useState(false)
    const hasAttemptedToCloseTicket = useAppSelector(
        getHasAttemptedToCloseTicket
    )
    const conditionalFieldsSupported = useFlag(
        FeatureFlagKey.TicketConditionalFields
    )

    const {
        data: {data: ticketFieldDefinitions = []} = {},
        isLoading: ticketFieldDefinitionsLoading,
    } = useCustomFieldDefinitions({
        archived: false,
        object_type: OBJECT_TYPES.TICKET,
    })

    const {
        evaluationResults: ticketFieldConditionsEvaluationResults,
        conditionsLoading: ticketFieldConditionsLoading,
    } = useCustomFieldsConditionsEvaluationResults(
        OBJECT_TYPES.TICKET,
        ticketState,
        conditionalFieldsSupported
    )

    // Hide AI managed fields
    // TODO(CSR): Remove this once AI managed fields are migrated to conditional
    const filteredTicketFieldDefinitions = useMemo(
        () =>
            ticketFieldDefinitions.filter(
                (definition) =>
                    !definition.managed_type ||
                    !Object.values(AI_MANAGED_TYPES).includes(
                        definition.managed_type
                    )
            ),
        [ticketFieldDefinitions]
    )
    const ticketFieldsToRender = useMemo(() => {
        if (!conditionalFieldsSupported) {
            return filteredTicketFieldDefinitions.map((fieldDefinition) => ({
                fieldDefinition,
                isRequired: fieldDefinition.required,
            }))
        }

        return filteredTicketFieldDefinitions.reduce(
            (acc, fieldDefinition) => {
                const isRequired = isFieldRequired(
                    fieldDefinition,
                    ticketFieldConditionsEvaluationResults[fieldDefinition.id]
                )

                const isVisible =
                    isRequired ||
                    isFieldVisible(
                        fieldDefinition,
                        ticketFieldConditionsEvaluationResults[
                            fieldDefinition.id
                        ]
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
            },
            [] as {
                fieldDefinition: CustomField
                isRequired: boolean
            }[]
        )
    }, [
        conditionalFieldsSupported,
        filteredTicketFieldDefinitions,
        ticketFieldConditionsEvaluationResults,
    ])

    const [ref, hasWrapped] = useHasWrapped<HTMLDivElement>(
        ticketFieldsToRender.length
    )
    const height = useHeight(ref, ticketFieldsToRender.length, showAllFields)

    const hasErroredTicketFields = filteredTicketFieldDefinitions.some(
        ({id}) => ticketFieldState[id]?.hasError
    )

    useEffect(() => {
        if (
            hasAttemptedToCloseTicket &&
            hasErroredTicketFields &&
            !showAllFields
        ) {
            setShowAllFields(true)
            dispatch(setHasAttemptedToCloseTicket(false))
        }
    }, [
        dispatch,
        hasAttemptedToCloseTicket,
        hasErroredTicketFields,
        showAllFields,
    ])

    if (
        ticketFieldDefinitionsLoading ||
        (conditionalFieldsSupported && ticketFieldConditionsLoading) ||
        !filteredTicketFieldDefinitions.length
    ) {
        return null
    }

    return (
        <div
            className={css.wrapper}
            style={{
                maxHeight: height,
            }}
        >
            <div
                ref={ref}
                className={classNames(css.fields, {
                    [css.isScrollable]:
                        showAllFields &&
                        ref.current?.scrollHeight > FIELDS_CONTAINER_MAX_HEIGHT,
                })}
                data-testid="fields-container"
            >
                {ticketFieldsToRender.map(({fieldDefinition, isRequired}) => (
                    <TicketField
                        key={fieldDefinition.id}
                        fieldDefinition={fieldDefinition}
                        fieldState={ticketFieldState[fieldDefinition.id]}
                        isRequired={isRequired}
                    />
                ))}
            </div>

            <div className={css.buttonWrapper}>
                {hasWrapped && (
                    <Button
                        fillStyle="ghost"
                        size="small"
                        onClick={() => setShowAllFields(!showAllFields)}
                    >
                        <ButtonIconLabel
                            className={css.button}
                            position="right"
                            icon={showAllFields ? 'expand_less' : 'expand_more'}
                        >
                            {`Show ${showAllFields ? 'less' : 'more'}`}
                        </ButtonIconLabel>
                    </Button>
                )}
            </div>
        </div>
    )
}

export default memo(TicketFields)
