import React, {useCallback, useState} from 'react'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {CustomField} from 'models/customField/types'
import IconButton from 'pages/common/components/button/IconButton'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import css from 'pages/settings/ticketFields/components/Row.less'
import {DatetimeLabel} from 'pages/common/utils/labels'
import useAppDispatch from 'hooks/useAppDispatch'
import ArchiveConfirmationModal from 'pages/settings/ticketFields/components/ArchiveConfirmationModal'
import {handleArchivingCustomField} from 'pages/settings/ticketFields/utils/handleArchivingCustomField'

export type Props = {
    ticketField: CustomField
    onFieldChange: () => void
}
export default function Row({ticketField, onFieldChange}: Props) {
    const dispatch = useAppDispatch()

    const link = `/app/settings/ticket-fields/${ticketField.id}/edit`
    const [archiveModalVisible, setArchiveModalVisible] = useState(false)
    const [isLoading, setLoading] = useState(false)

    const handleArchivingCustomFieldCallback = useCallback(
        async (id: number, archive: boolean) => {
            setLoading(true)
            await handleArchivingCustomField(id, archive, dispatch)
            setLoading(false)
        },
        [dispatch]
    )

    return (
        <tr
            id={ticketField.id.toString()}
            key={ticketField.id}
            className={classnames('draggable', css.row)}
        >
            <td
                className={classnames(
                    'link-full-td',
                    'align-middle',
                    css['middle-column']
                )}
                id={`ticket-field-name-${ticketField.id}`}
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
                            onConfirm={async () => {
                                await handleArchivingCustomFieldCallback(
                                    ticketField.id,
                                    true
                                )
                                onFieldChange()
                            }}
                            onClose={() => setArchiveModalVisible(false)}
                        />
                    </>
                )}

                {ticketField.deactivated_datetime && (
                    <IconButton
                        className={classnames(css.actionButton, 'mr-1')}
                        onClick={async () => {
                            await handleArchivingCustomFieldCallback(
                                ticketField.id,
                                false
                            )
                            onFieldChange()
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
