import { memo, useEffect, useMemo, useState } from 'react'

import { useCallbackRef, useElementSize } from '@repo/hooks'
import classNames from 'classnames'

import { Button } from '@gorgias/axiom'
import { ExpressionFieldType, RequirementType } from '@gorgias/helpdesk-types'

import { getWrappedElementCount } from 'common/utils'
import { AI_MANAGED_TYPES, OBJECT_TYPES } from 'custom-fields/constants'
import { isFieldRequired } from 'custom-fields/helpers/isFieldRequired'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useCustomFieldsConditionsEvaluationResults } from 'custom-fields/hooks/useCustomFieldsConditionsEvaluationResults'
import { CustomField, CustomFieldAIManagedType } from 'custom-fields/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import { setHasAttemptedToCloseTicket } from 'state/ticket/actions'
import {
    getHasAttemptedToCloseTicket,
    getTicket,
    getTicketFieldState,
} from 'state/ticket/selectors'

import TicketField from './TicketField'

import css from './TicketFields.less'

const MIN_HEIGHT = 24
const MAX_HEIGHT = 500

const isFieldVisible = (
    fieldDefinition: CustomField,
    conditionalRequirementType?: ExpressionFieldType,
): boolean => {
    return (
        (fieldDefinition.required === false &&
            fieldDefinition.requirement_type !== RequirementType.Conditional) ||
        (fieldDefinition.requirement_type === RequirementType.Conditional &&
            conditionalRequirementType === ExpressionFieldType.Visible)
    )
}

function TicketFields() {
    const dispatch = useAppDispatch()
    const ticketState = useAppSelector(getTicket)
    const ticketFieldState = useAppSelector(getTicketFieldState)
    const [showAllFields, setShowAllFields] = useState(false)
    const hasAttemptedToCloseTicket = useAppSelector(
        getHasAttemptedToCloseTicket,
    )

    const {
        data: { data: ticketFieldDefinitions = [] } = {},
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
    )

    // Hide AI managed fields
    // TODO(CSR): Remove this once AI managed fields are migrated to conditional
    const filteredTicketFieldDefinitions = useMemo(
        () =>
            ticketFieldDefinitions.filter(
                (definition) =>
                    !definition.managed_type ||
                    !Object.values(AI_MANAGED_TYPES).includes(
                        definition.managed_type as CustomFieldAIManagedType,
                    ),
            ),
        [ticketFieldDefinitions],
    )
    const ticketFieldsToRender = useMemo(
        () =>
            filteredTicketFieldDefinitions.reduce(
                (acc, fieldDefinition) => {
                    const isRequired = isFieldRequired(
                        fieldDefinition,
                        ticketFieldConditionsEvaluationResults[
                            fieldDefinition.id
                        ],
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
                },
                [] as {
                    fieldDefinition: CustomField
                    isRequired: boolean
                }[],
            ),
        [
            filteredTicketFieldDefinitions,
            ticketFieldConditionsEvaluationResults,
        ],
    )

    const [element, setElement] = useCallbackRef()
    const [, height] = useElementSize(element)
    const wrappedElementCount = getWrappedElementCount(element)

    const hasErroredTicketFields = filteredTicketFieldDefinitions.some(
        ({ id }) => ticketFieldState[id]?.hasError,
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
        ticketFieldConditionsLoading ||
        !filteredTicketFieldDefinitions.length
    ) {
        return null
    }

    return (
        <div
            className={css.wrapper}
            style={{
                height: showAllFields ? height : MIN_HEIGHT,
                maxHeight: MAX_HEIGHT,
            }}
        >
            <div
                className={classNames(css.fieldsWrapper, {
                    [css.isScrollable]: showAllFields,
                })}
            >
                <div ref={setElement} className={css.fields}>
                    {ticketFieldsToRender.map(
                        ({ fieldDefinition, isRequired }) => (
                            <TicketField
                                key={fieldDefinition.id}
                                fieldDefinition={fieldDefinition}
                                fieldState={
                                    ticketFieldState[fieldDefinition.id]
                                }
                                isRequired={isRequired}
                            />
                        ),
                    )}
                </div>
            </div>

            <div className={css.buttonWrapper}>
                {!!wrappedElementCount && (
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
