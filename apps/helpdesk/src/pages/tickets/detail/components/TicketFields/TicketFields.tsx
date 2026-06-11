import { memo, useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'
import { useCallbackRef, useElementSize } from '@gorgias/toolkit-react'

import { LegacyButton as Button } from '@gorgias/axiom'

import { getWrappedElementCount } from 'common/utils'
import { OBJECT_TYPES } from 'custom-fields/constants'
import { isFieldRequired } from 'custom-fields/helpers/isFieldRequired'
import { isFieldVisible } from 'custom-fields/helpers/isFieldVisible'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useCustomFieldsConditionsEvaluationResults } from 'custom-fields/hooks/useCustomFieldsConditionsEvaluationResults'
import { isCustomFieldAIManagedType } from 'custom-fields/types'
import type { CustomField } from 'custom-fields/types'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'
import { DefaultExportButtonIconLabel as ButtonIconLabel } from 'pages/common/components/button/ButtonIconLabel'
import { useStandaloneAiContext as useStandaloneAiAccess } from 'providers/standalone-ai/StandaloneAiContext'
import { setHasAttemptedToCloseTicket } from 'state/ticket/actions'
import {
    getHasAttemptedToCloseTicket,
    getTicket,
    getTicketFieldState,
} from 'state/ticket/selectors'

import { DefaultExportTicketField as TicketField } from './TicketField'

import css from './TicketFields.less'

const MIN_HEIGHT = 24
const MAX_HEIGHT = 500

function TicketFields() {
    const dispatch = useAppDispatch()
    const { isStandaloneAiAgent } = useStandaloneAiAccess()
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

    const filteredTicketFieldDefinitions = useMemo(
        () =>
            ticketFieldDefinitions.filter(({ managed_type }) =>
                isStandaloneAiAgent
                    ? isCustomFieldAIManagedType(managed_type ?? null)
                    : !isCustomFieldAIManagedType(managed_type ?? null),
            ),
        [isStandaloneAiAgent, ticketFieldDefinitions],
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

const DefaultExportTicketFields = memo(TicketFields)

export { DefaultExportTicketFields }
