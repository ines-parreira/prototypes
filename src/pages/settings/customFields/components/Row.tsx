import React, {useState} from 'react'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {Tooltip} from '@gorgias/ui-kit'
import {ulid} from 'ulidx'

import {CustomField, isCustomFieldAIManagedType} from 'models/customField/types'
import IconButton from 'pages/common/components/button/IconButton'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import ArchiveConfirmationModal from 'pages/settings/customFields/components/ArchiveConfirmationModal'
import {TableBodyRowDraggable} from 'pages/common/components/table/TableBodyRowDraggable'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'
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
    const isAIManaged = isCustomFieldAIManagedType(ticketField.managed_type)
    const tooltipId = 'a' + ulid()

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
            shouldRenderDragHandle={canReorder}
            onMoveEntity={onMoveEntity}
            onDropEntity={onDropEntity}
        >
            <td id={`ticket-field-label-${ticketField.id}`}>
                <Link to={link}>
                    <BodyCellContent>
                        <strong className={classnames('mr-4', css.label)}>
                            {ticketField.label}
                            {isAIManaged && (
                                <>
                                    {' '}
                                    <i
                                        id={tooltipId}
                                        className={classnames(
                                            'material-icons-outlined',
                                            'ml-1',
                                            'md-2',
                                            css.infoIcon
                                        )}
                                    >
                                        info
                                    </i>
                                    <>
                                        <Tooltip target={tooltipId}>
                                            {ticketField.label} is a Gorgias AI
                                            managed field and cannot be edited
                                        </Tooltip>
                                    </>
                                </>
                            )}
                        </strong>
                        <span className="d-inline-flex text-faded">
                            <span className={css.description}>
                                {ticketField.description}
                            </span>
                        </span>
                    </BodyCellContent>
                </Link>
            </td>
            <BodyCell>
                {ticketField.required && !ticketField.deactivated_datetime && (
                    <Badge type={ColorType.Warning}>REQUIRED</Badge>
                )}
            </BodyCell>
            <BodyCell>
                <div className={'text-faded'}>
                    <DatetimeLabel
                        dateTime={ticketField.updated_datetime}
                        labelFormat={DateAndTimeFormatting.CompactDate}
                    />
                </div>
            </BodyCell>

            <BodyCell>
                {!ticketField.deactivated_datetime && (
                    <>
                        <IconButton
                            className={classnames(css.actionButton, 'mr-1')}
                            onClick={() => setArchiveModalVisible(true)}
                            fillStyle="ghost"
                            intent="secondary"
                            isLoading={isLoading}
                            isDisabled={isCustomFieldAIManagedType(
                                ticketField.managed_type
                            )}
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
                        isDisabled={isCustomFieldAIManagedType(
                            ticketField.managed_type
                        )}
                        isLoading={isLoading}
                        title="Unarchive"
                        id={`restore-ticket-field-${ticketField.id}`}
                    >
                        unarchive
                    </IconButton>
                )}
            </BodyCell>
        </TableBodyRowDraggable>
    )
}
