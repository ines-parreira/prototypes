import React, {MouseEvent, useMemo} from 'react'
import {Link} from 'react-router-dom'

import Alert, {AlertProps} from './Alert'

import css from './LinkAlert.less'

type LinkAlertProps = {
    actionHref?: string
    actionLabel: string
    onAction?: (e: MouseEvent) => void
} & Omit<AlertProps, 'customActions'>

const LinkAlert = ({
    actionHref,
    actionLabel,
    onAction,
    ...alertProps
}: LinkAlertProps) => {
    const handleClick = (event: MouseEvent) => {
        if (onAction) {
            event.preventDefault()
            onAction(event)
        }
    }

    const isExternalLink = useMemo(() => {
        return !!(actionHref && actionHref.includes('http'))
    }, [actionHref])

    return (
        <Alert
            {...alertProps}
            customActions={
                isExternalLink ? (
                    <a
                        href={actionHref || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleClick}
                        className={css.actionLink}
                    >
                        {actionLabel}
                    </a>
                ) : (
                    <Link
                        to={actionHref || '#'}
                        onClick={handleClick}
                        className={css.actionLink}
                    >
                        {actionLabel}
                    </Link>
                )
            }
        />
    )
}

export default LinkAlert
