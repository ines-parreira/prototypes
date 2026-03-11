import type { ComponentProps, MouseEvent } from 'react'
import React, { useMemo } from 'react'

import { Link } from 'react-router-dom'

import Alert from './Alert'

import css from './LinkAlert.less'

export type Props = {
    actionHref?: string
    actionLabel: string
    onAction?: (e: MouseEvent) => void
} & Omit<ComponentProps<typeof Alert>, 'customActions'>

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Banner variant="inline" />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const LinkAlert = ({
    actionHref,
    actionLabel,
    onAction,
    ...alertProps
}: Props) => {
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
