import React, { forwardRef, useCallback, useMemo, useState } from 'react'

import { produce } from 'immer'

import { RequirementType } from '@gorgias/helpdesk-queries'
import type {
    CustomFieldConditionField,
    ExpressionFieldType,
} from '@gorgias/helpdesk-types'

import type { CustomField } from 'custom-fields/types'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import Caption from 'pages/common/forms/Caption/Caption'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'

import ConfirmCustomFieldRequirementTypeChangeModal from './ConfirmCustomFieldRequirementTypeChangeModal'
import CustomFieldSelectButton from './CustomFieldSelectButton'
import ThenFieldRow from './ThenFieldRow'

import css from './ThenField.less'

type ThenFieldProps = {
    value: CustomFieldConditionField[]
    onChange: (value: CustomFieldConditionField[]) => void
    error?: string
}

export default forwardRef(function ThenField(
    { value: requirements, onChange, error }: ThenFieldProps,
    __ref,
) {
    const [
        nonConditionalFieldRequestedForAddition,
        setNonConditionalFieldRequestedForAddition,
    ] = useState<Maybe<CustomField>>(null)

    const fieldIds = useMemo(
        () => requirements.map((field) => field.field_id),
        [requirements],
    )

    const handleAddField = useCallback(
        (customField: CustomField) => {
            onChange(
                produce(requirements, (draft) => {
                    draft.push({
                        field_id: customField.id,
                        type: 'visible',
                    })
                }),
            )
        },
        [requirements, onChange],
    )

    const handleOnChange = useCallback(
        (idx: number, value: ExpressionFieldType) => {
            onChange(
                produce(requirements, (draft) => {
                    draft[idx].type = value
                }),
            )
        },
        [requirements, onChange],
    )

    const handleOnDelete = useCallback(
        (idx: number) => {
            onChange(
                produce(requirements, (draft) => {
                    draft.splice(idx, 1)
                }),
            )
        },
        [requirements, onChange],
    )

    return (
        <>
            {requirements.length === 0 && (
                <div className={css.emptyContainer}>
                    <p>No selected ticket fields</p>
                    <p className={css.subtitle}>
                        Try adding ticket fields from the dropdown below to
                        display conditionally.
                    </p>
                </div>
            )}
            {requirements.length > 0 && (
                <TableWrapper className={css.table}>
                    <TableHead>
                        <HeaderCell>Field name</HeaderCell>
                        <HeaderCell>Field type</HeaderCell>
                        <HeaderCell>
                            <IconTooltip className={css.tooltip}>
                                Select Required to prevent agents from closing
                                the conditional ticket field if left empty.
                                Snooze and Send actions will still work.
                            </IconTooltip>
                            Required to close ticket
                        </HeaderCell>
                        <HeaderCell size="smallest" />
                    </TableHead>
                    <TableBody>
                        {requirements.map((requirement, idx) => (
                            <ThenFieldRow
                                key={requirement.field_id}
                                fieldId={requirement.field_id}
                                requirement={requirement.type}
                                onChange={(value) => handleOnChange(idx, value)}
                                onDelete={() => handleOnDelete(idx)}
                            />
                        ))}
                    </TableBody>
                </TableWrapper>
            )}
            {error && <Caption error={error} />}
            <div className={css.selectButton}>
                <CustomFieldSelectButton
                    objectType="Ticket"
                    ignoreIds={fieldIds}
                    onSelect={(customField: CustomField) => {
                        if (
                            customField.requirement_type !==
                            RequirementType.Conditional
                        ) {
                            setNonConditionalFieldRequestedForAddition(
                                customField,
                            )
                        } else {
                            handleAddField(customField)
                        }
                    }}
                />
            </div>
            {!!nonConditionalFieldRequestedForAddition && (
                <ConfirmCustomFieldRequirementTypeChangeModal
                    isOpen={!!nonConditionalFieldRequestedForAddition}
                    onCancel={() => {
                        setNonConditionalFieldRequestedForAddition(null)
                    }}
                    onConfirmationSuccess={(customField: CustomField) => {
                        handleAddField(customField)
                        setNonConditionalFieldRequestedForAddition(null)
                    }}
                    customField={nonConditionalFieldRequestedForAddition}
                />
            )}
        </>
    )
})
