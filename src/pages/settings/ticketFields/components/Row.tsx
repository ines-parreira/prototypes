import React, {useState} from 'react'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {CustomField} from 'models/customField/types'
import {useUpdateCustomFieldStatus} from 'models/customField/queries'
import IconButton from 'pages/common/components/button/IconButton'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {DatetimeLabel} from 'pages/common/utils/labels'
import ArchiveConfirmationModal from 'pages/settings/ticketFields/components/ArchiveConfirmationModal'
import {TableBodyRowDraggable} from 'pages/common/components/table/TableBodyRowDraggable'
import {Callbacks} from 'pages/common/hooks/useReorderDnD'
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
    const {mutate, isLoading} = useUpdateCustomFieldStatus(ticketField.id)

    const link = `/app/settings/ticket-fields/${ticketField.id}/edit`
    const [archiveModalVisible, setArchiveModalVisible] = useState(false)

    return (
        <TableBodyRowDraggable
            className={classnames('draggable', css.row)}
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
                        <span className={classnames('mr-2', css.label)}>
                            {ticketField.label}
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
                        labelFormat="YYYY-MM-DD"
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
                                mutate({archived: true})
                            }}
                            onClose={() => setArchiveModalVisible(false)}
                        />
                    </>
                )}

                {ticketField.deactivated_datetime && (
                    <IconButton
                        className={classnames(css.actionButton, 'mr-1')}
                        onClick={() => {
                            mutate({archived: false})
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
