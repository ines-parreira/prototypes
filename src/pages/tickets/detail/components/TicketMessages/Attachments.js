//@flow
import React from 'react'
import {fromJS} from 'immutable'
import TicketAttachments from '../ReplyArea/TicketAttachments'
import css from './Attachments.less'
import type {TicketMessage} from '../../../../../models/ticketElement/types'
import classNamesBind from 'classnames/bind'

const classNames = classNamesBind.bind(css)

type Props = {
    message: TicketMessage
}

export default (props: Props) => {
    const {message} = props

    if (!message.attachments || !message.attachments.length) {
        return null
    }

    return (
        <div className={classNames('pt-4', 'wrapper')}>
            <span className={classNames('label')}>
                <i className="icon mr-1 material-icons">
                    attachment
                </i>
                New media files
            </span>
            <TicketAttachments attachments={fromJS(message.attachments || [])}/>
        </div>
    )
}
