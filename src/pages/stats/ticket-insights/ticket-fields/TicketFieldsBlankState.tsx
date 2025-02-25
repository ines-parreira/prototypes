import React from 'react'

import classnames from 'classnames'
import { Link } from 'react-router-dom'

import graphsImage from 'assets/img/stats/graphs.png'
import Button from 'pages/common/components/button/Button'
import css from 'pages/stats/BlankState.less'

export const BLANK_STATE_TITLE = 'Nothing to report on'
export const BLANK_STATE_TEXT =
    'You don’t have any active dropdown ticket fields. Create your first dropdown ticket field to start getting insights.'

export function TicketFieldsBlankState() {
    return (
        <div className={classnames(css.wrapper)}>
            <img
                src={graphsImage}
                alt={BLANK_STATE_TITLE}
                className={css.image}
            />
            <h3 className={css.title}>{BLANK_STATE_TITLE}</h3>
            <p className={css.text}>{BLANK_STATE_TEXT}</p>
            <Link to="/app/settings/ticket-fields/active" target="_blank">
                <Button>Manage Ticket Fields</Button>
            </Link>
        </div>
    )
}
