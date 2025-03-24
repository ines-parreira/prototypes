import cn from 'classnames'

import { CustomField, TicketSummary } from '@gorgias/api-queries'
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
    fieldValues: TicketSummary['custom_fields']
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
    const uniqueId = useId()
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
                <>
                    <ul ref={setFieldsContainer} className={css.fieldList}>
                        {ticketFieldIds.map((id: string) => {
                            return (
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
                            )
                        })}
                    </ul>
                    {wrappedTicketFieldCount > 0 && (
                        <div
                            id={`${ID_PREFIX}${uniqueId}`}
                            className={css.more}
                        >
                            + {wrappedTicketFieldCount} more
                            <Tooltip target={`${ID_PREFIX}${uniqueId}`}>
                                <ul className={css.tooltipContent}>
                                    {hiddenTicketFieldIds?.map((id) => {
                                        return (
                                            <li key={id}>
                                                {getCustomFieldLabel(
                                                    definitions,
                                                    Number(id),
                                                )}
                                                :&nbsp;
                                                <span
                                                    className={css.tooltipValue}
                                                >
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
                    )}
                </>
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
