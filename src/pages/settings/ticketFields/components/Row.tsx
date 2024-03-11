import React, {useState} from 'react'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {CustomField} from 'models/customField/types'
import IconButton from 'pages/common/components/button/IconButton'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import ArchiveConfirmationModal from 'pages/settings/ticketFields/components/ArchiveConfirmationModal'
import {TableBodyRowDraggable} from 'pages/common/components/table/TableBodyRowDraggable'
import {Callbacks} from 'pages/common/hooks/useReorderDnD'
import {useUpdateCustomFieldArchiveStatus} from 'hooks/customField/useUpdateCustomFieldArchiveStatus'
import {DateAndTimeFormatting} from 'constants/datetime'
import css from './Row.less'

export type Props = {
    position: number
    ticketField: CustomField
    canReorder: boolean
    onMoveEntity: Callbacks['onHover']
    onDropEntity: Callbacks['onDrop']
}
export default function Row({
    position,
    ticketField,
    canReorder,
    onMoveEntity,
    onDropEntity,
}: Props) {
    const {mutate, isLoading} = useUpdateCustomFieldArchiveStatus(
        ticketField.id
    )

    const link = `/app/settings/ticket-fields/${ticketField.id}/edit`
    const [archiveModalVisible, setArchiveModalVisible] = useState(false)

    return (
        <TableBodyRowDraggable
            className={classnames(
                'draggable',
                css.row,
                canReorder && css.canReorder
            )}
            dragItem={{
                id: ticketField.id,
                position,
                type: 'ticket-fields-row',
            }}
            shouldRenderDragHandle={
                canReorder && !ticketField.deactivated_datetime
            }
            onMoveEntity={onMoveEntity}
            onDropEntity={onDropEntity}
        >
            <td
                className={classnames('link-full-td align-middle')}
                id={`ticket-field-label-${ticketField.id}`}
            >
                <Link to={link}>
                    <div>
                        <strong className={classnames('mr-4', css.label)}>
                            {ticketField.label}
                        </strong>
                        <span className="d-inline-flex text-faded">
                            <span className={css.description}>
                                {ticketField.description}
                            </span>
                        </span>
                    </div>
                </Link>
            </td>
            <td
                className={classnames(
                    'link-full-td align-middle smallest pr-4'
                )}
            >
                {ticketField.required && !ticketField.deactivated_datetime && (
                    <Badge type={ColorType.Warning}>REQUIRED</Badge>
                )}
            </td>
            <td
                className={classnames(
                    'link-full-td align-middle smallest pr-4'
                )}
            >
                <div className={'text-faded'}>
                    <DatetimeLabel
                        dateTime={ticketField.updated_datetime}
                        labelFormat={DateAndTimeFormatting.CompactDate}
                    />
                </div>
            </td>

            <td className={classnames('align-middle smallest', css.actions)}>
                {!ticketField.deactivated_datetime && (
                    <>
                        <IconButton
                            className={classnames(css.actionButton, 'mr-1')}
                            onClick={() => setArchiveModalVisible(true)}
                            fillStyle="ghost"
                            intent="secondary"
                            isLoading={isLoading}
                            title="Archive"
                            id={`archive-ticket-field-${ticketField.id}`}
                        >
                            archive
                        </IconButton>

                        <ArchiveConfirmationModal
                            ticketFieldLabel={ticketField.label}
                            isOpen={archiveModalVisible}
                            onConfirm={() => {
                                setArchiveModalVisible(false)
                                mutate(true)
                            }}
                            onClose={() => setArchiveModalVisible(false)}
                        />
                    </>
                )}

                {ticketField.deactivated_datetime && (
                    <IconButton
                        className={classnames(css.actionButton, 'mr-1')}
                        onClick={() => {
                            mutate(false)
                        }}
                        fillStyle="ghost"
                        intent="secondary"
                        isLoading={isLoading}
                        title="Unarchive"
                        id={`restore-ticket-field-${ticketField.id}`}
                    >
                        unarchive
                    </IconButton>
                )}
            </td>
        </TableBodyRowDraggable>
    )
}
