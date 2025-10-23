import React, { MouseEvent, useCallback } from 'react'

import { history } from '@repo/routing'
import moment from 'moment'
import { Link } from 'react-router-dom'

import { CustomFieldCondition } from '@gorgias/helpdesk-queries'

import { DateAndTimeFormatting } from 'constants/datetime'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
import { TableBodyRowDraggable } from 'pages/common/components/table/TableBodyRowDraggable'
import ToggleInput from 'pages/common/forms/ToggleInput'
import { Callbacks } from 'pages/common/hooks/useReorderDnD'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import useCreateCustomFieldCondition from '../hooks/useCreateCustomFieldCondition'
import useUpdateCustomFieldCondition from '../hooks/useUpdateCustomFieldCondition'
import { DeletionPopover } from './DeletionPopover'

import css from './ConditionalFieldRow.less'

type ConditionalFieldRowProps = {
    condition: CustomFieldCondition
    canDuplicate?: boolean
    position: number
    onMoveEntity: Callbacks['onHover']
    onDropEntity: Callbacks['onDrop']
}

export default function ConditionalFieldRow({
    condition,
    canDuplicate,
    position,
    onMoveEntity,
    onDropEntity,
}: ConditionalFieldRowProps) {
    const { mutateAsync: updateCondition, isLoading: isUpdating } =
        useUpdateCustomFieldCondition()
    const { mutateAsync: createCondition, isLoading: isCreating } =
        useCreateCustomFieldCondition()

    const handleActivate = useCallback(() => {
        void updateCondition({
            id: condition.id,
            data: { deactivated_datetime: null },
        })
    }, [condition, updateCondition])
    const handleDeactivate = useCallback(() => {
        void updateCondition({
            id: condition.id,
            data: { deactivated_datetime: moment().toISOString() },
        })
    }, [condition, updateCondition])
    const handleToggleClick = useCallback(
        (onDisplayConfirmation: (event: MouseEvent) => void) =>
            (value: boolean, event: MouseEvent) => {
                event.stopPropagation()
                if (!!condition.deactivated_datetime) {
                    void handleActivate()
                } else {
                    onDisplayConfirmation(event)
                }
            },
        [condition, handleActivate],
    )

    const handleDuplicate = async () => {
        try {
            const newCondition = await createCondition({
                data: {
                    name: `(Copy) ${condition.name}`,
                    object_type: condition.object_type,
                    expression: condition.expression,
                    requirements: condition.requirements,
                    sort_order: condition.sort_order,
                    deactivated_datetime: null,
                },
            })
            history.push(
                `/app/settings/ticket-field-conditions/${newCondition.data.id}`,
            )
        } catch {
            /* no-op */
        }
    }

    return (
        <TableBodyRowDraggable
            dragItem={{
                id: condition.id,
                position,
                type: 'conditional-fields-row',
            }}
            onMoveEntity={onMoveEntity}
            onDropEntity={onDropEntity}
        >
            <BodyCell>
                <ConfirmationPopover
                    buttonProps={{
                        intent: 'destructive',
                    }}
                    content={
                        <>
                            You are about to deactivate <b>{condition.name}</b>.
                        </>
                    }
                    id={`toggle-condition-${condition.id}`}
                    onConfirm={handleDeactivate}
                    placement="bottom"
                >
                    {({ uid, onDisplayConfirmation }) => (
                        <div id={uid}>
                            <ToggleInput
                                isToggled={!condition.deactivated_datetime}
                                isLoading={isUpdating}
                                onClick={handleToggleClick(
                                    onDisplayConfirmation,
                                )}
                            />
                        </div>
                    )}
                </ConfirmationPopover>
            </BodyCell>
            <td className={css.nameCell}>
                <Link
                    to={`/app/settings/ticket-field-conditions/${condition.id}`}
                >
                    <BodyCellContent>{condition.name}</BodyCellContent>
                </Link>
            </td>
            <BodyCell>
                {/* FIXME(Nicolas): should be updated_datetime */}
                <DatetimeLabel
                    className="text-faded"
                    dateTime={condition.created_datetime}
                    labelFormat={DateAndTimeFormatting.CompactDate}
                />
            </BodyCell>
            <BodyCell className={css.actionsCell}>
                <IconButton
                    className="mr-1"
                    fillStyle="ghost"
                    intent="secondary"
                    title="Duplicate Condition"
                    isDisabled={!canDuplicate}
                    isLoading={isCreating}
                    onClick={(e) => {
                        e.stopPropagation()
                        void handleDuplicate()
                    }}
                >
                    file_copy
                </IconButton>
                <DeletionPopover condition={condition}>
                    {({ uid, onDisplayConfirmation }) => (
                        <IconButton
                            fillStyle="ghost"
                            intent="destructive"
                            title="Delete Condition"
                            onClick={onDisplayConfirmation}
                            id={uid}
                        >
                            delete
                        </IconButton>
                    )}
                </DeletionPopover>
            </BodyCell>
        </TableBodyRowDraggable>
    )
}
