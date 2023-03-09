import React, {useState} from 'react'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {CustomField} from 'models/customField/types'
import {useUpdateCustomFieldStatus} from 'models/customField/queries'
import IconButton from 'pages/common/components/button/IconButton'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {DatetimeLabel} from 'pages/common/utils/labels'
import ArchiveConfirmationModal from 'pages/settings/ticketFields/components/ArchiveConfirmationModal'
import css from './Row.less'

export type Props = {
    ticketField: CustomField
    canReorder: boolean
}
export default function Row({ticketField, canReorder}: Props) {
    const {mutate, isLoading} = useUpdateCustomFieldStatus(ticketField.id)

    const link = `/app/settings/ticket-fields/${ticketField.id}/edit`
    const [archiveModalVisible, setArchiveModalVisible] = useState(false)

    return (
        <tr
            id={ticketField.id.toString()}
            key={ticketField.id}
            data-id={ticketField.id} // dragging info
            className={classnames('draggable', css.row)}
        >
            {canReorder && !ticketField.deactivated_datetime && (
                <td
                    className="smallest align-middle"
                    onClick={(e) => e.stopPropagation()}
                >
                    <i className={'material-icons text-faded drag-handle'}>
                        drag_indicator
                    </i>
                </td>
            )}
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
        </tr>
    )
}
