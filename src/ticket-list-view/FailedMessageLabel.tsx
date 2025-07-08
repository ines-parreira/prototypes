import React from 'react'

import cn from 'classnames'

import css from './Ticket.less'

const FailedMessageLabel = () => {
    return (
        <p className={cn(css.icon, css.errorLabel)}>
            <span className="material-icons mr-1">warning</span>
            Last message not delivered
        </p>
    )
}

export default FailedMessageLabel
