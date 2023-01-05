import React from 'react'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {CustomField} from 'models/customField/types'
import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import css from 'pages/settings/ticketFields/components/Row.less'
import {DatetimeLabel} from 'pages/common/utils/labels'

export type Props = {
    ticketField: CustomField
}
export default function Row({ticketField}: Props) {
    const link = `/app/settings/ticket-fields/${ticketField.id}/edit`

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
                    <ConfirmationPopover
                        buttonProps={{
                            intent: 'destructive',
                        }}
                        id={`archive-ticket-field-${ticketField.id}`}
                        content={
                            <>
                                You are about to archive{' '}
                                <b>{ticketField.label}</b> ticket field.
                            </>
                        }
                        // TODO(@ionut): implement archiving
                        // onConfirm={handleArchiving}
                    >
                        {({uid, onDisplayConfirmation}) => (
                            <IconButton
                                className={classnames(css.actionButton, 'mr-1')}
                                onClick={onDisplayConfirmation}
                                fillStyle="ghost"
                                intent="secondary"
                                // isLoading={isArchiving} // TODO
                                isLoading={false}
                                title="Archive ticket field"
                                id={uid}
                            >
                                archive
                            </IconButton>
                        )}
                    </ConfirmationPopover>
                )}

                {ticketField.deactivated_datetime && (
                    <IconButton
                        className={classnames(css.actionButton, 'mr-1')}
                        // TODO(@ionut): implement unarchiving
                        // onClick={() => {}} // TODO
                        fillStyle="ghost"
                        intent="secondary"
                        // isLoading={isArchiving} // TODO
                        isLoading={false}
                        title="Restore ticket field"
                        id={`restore-ticket-field-name-${ticketField.id}`}
                    >
                        unarchive
                    </IconButton>
                )}
            </td>
        </tr>
    )
}
