import {
    CustomFieldRequirementType,
    ExpressionFieldType,
} from '@gorgias/api-types'
import classNames from 'classnames'
import React, {memo, useEffect, useMemo, useState} from 'react'

import useFlag from 'common/flags/hooks/useFlag'
import {FeatureFlagKey} from 'config/featureFlags'
import {AI_MANAGED_TYPES, OBJECT_TYPES} from 'custom-fields/constants'
import {evaluateCustomFieldsConditions} from 'custom-fields/helpers/evaluateCustomFieldsConditions'
import {isFieldRequired} from 'custom-fields/helpers/isFieldRequired'
import {useCustomFieldConditions} from 'custom-fields/hooks/queries/useCustomFieldConditions'
import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'

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

import useHeight from './hooks/useHeight'
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
    const [ref, hasWrapped] = useHasWrapped<HTMLDivElement>()
    const height = useHeight(ref)
    const hasAttemptedToCloseTicket = useAppSelector(
        getHasAttemptedToCloseTicket
    )
    const conditionalFieldsSupported =
        useFlag(FeatureFlagKey.TicketConditionalFields, false) ?? false

    const {
        data: {data: ticketFieldDefinitions = []} = {},
        isLoading: ticketFieldDefinitionsLoading,
    } = useCustomFieldDefinitions({
        archived: false,
        object_type: OBJECT_TYPES.TICKET,
    })
    const {
        customFieldConditions: ticketFieldConditions = [],
        isLoading: ticketFieldConditionsLoading = false,
    } = useCustomFieldConditions(
        OBJECT_TYPES.TICKET,
        conditionalFieldsSupported
    )

    const customFieldsEvaluatedConditions = evaluateCustomFieldsConditions(
        ticketFieldConditions,
        OBJECT_TYPES.TICKET,
        ticketState
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
                height: showAllFields ? height : 24,
            }}
        >
            <div
                ref={ref}
                className={classNames(css.fields, {
                    [css.isExpanded]: showAllFields,
                })}
            >
                {filteredTicketFieldDefinitions.map((fieldDefinition) => {
                    if (!conditionalFieldsSupported) {
                        return (
                            <TicketField
                                key={fieldDefinition.id}
                                fieldDefinition={fieldDefinition}
                                fieldState={
                                    ticketFieldState[fieldDefinition.id]
                                }
                                isRequired={fieldDefinition.required}
                            />
                        )
                    }

                    const isRequired = isFieldRequired(
                        fieldDefinition,
                        customFieldsEvaluatedConditions[fieldDefinition.id]
                    )
                    if (
                        !isRequired &&
                        !isFieldVisible(
                            fieldDefinition,
                            customFieldsEvaluatedConditions[fieldDefinition.id]
                        )
                    ) {
                        return null
                    }

                    return (
                        <TicketField
                            key={fieldDefinition.id}
                            fieldDefinition={fieldDefinition}
                            fieldState={ticketFieldState[fieldDefinition.id]}
                            isRequired={isRequired}
                        />
                    )
                })}
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
