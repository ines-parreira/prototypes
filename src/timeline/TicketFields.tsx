import React from 'react'

import cn from 'classnames'

import {
    CustomField,
    TicketCompact,
    TicketCompactCustomFieldsAnyOf,
} from '@gorgias/api-queries'
import { Tooltip } from '@gorgias/merchant-ui-kit'

import getWrappedElementCount from 'common/utils/getWrappedElementCount'
import { getShortValueLabel } from 'custom-fields/helpers/getValueLabels'
import { CustomFieldValue } from 'custom-fields/types'
import useCallbackRef from 'hooks/useCallbackRef'
import useElementSize from 'hooks/useElementSize'
import useId from 'hooks/useId'

import css from './TicketFields.less'

type TicketFieldsProps = {
    definitions?: CustomField[]
    fieldValues: TicketCompact['custom_fields']
    className?: string
    isLoading?: boolean
}

const ID_PREFIX = 'expand-tags-badge-'

export default function TicketFields({
    definitions = [],
    fieldValues: maybeFieldValues,
    className,
    isLoading = false,
}: TicketFieldsProps) {
    const fieldValues = maybeFieldValues === null ? {} : maybeFieldValues || {}
    const [fieldsContainer, setFieldsContainer] = useCallbackRef()
    // Triggers re-render when the size of the fieldsContainer changes
    useElementSize(fieldsContainer)
    const wrappedTicketFieldCount = getWrappedElementCount(fieldsContainer)
    const ticketFieldIds = Object.keys(fieldValues)
    const hasTicketFields = ticketFieldIds.length > 0
    const hiddenTicketFieldIds = ticketFieldIds.slice(
        ticketFieldIds.length - wrappedTicketFieldCount,
    )

    return (
        <div className={cn(css.ticketFields, className)}>
            {isLoading ? (
                <div className={css.loading}>Loading ticket fields...</div>
            ) : !hasTicketFields ? (
                'No ticket fields yet'
            ) : (
                <ul ref={setFieldsContainer} className={css.fieldList}>
                    {ticketFieldIds.map((id: string, i) => {
                        return (
                            <React.Fragment key={id}>
                                {wrappedTicketFieldCount > 0 &&
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
                                    <span className={css.fieldValue}>
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
