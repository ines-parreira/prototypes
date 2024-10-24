import classnames from 'classnames'
import React from 'react'

import css from './Loader.less'

type Props = {
    inline?: boolean
    message?: Record<string, unknown> | string
    minHeight?: string
    size?: string
    className?: string
    role?: string
    'aria-label'?: string
    'data-testid'?: string
}

export default function Loader({
    className,
    message,
    inline = false,
    minHeight = '500px',
    size = '40px',
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    role,
}: Props) {
    return (
        <div
            className={classnames(css.container, className)}
            aria-label={ariaLabel}
            data-testid={dataTestId}
            role={role}
        >
            <div className={css.inner} style={{minHeight}}>
                <i
                    className="icon-custom icon-circle-o-notch md-spin"
                    style={{fontSize: size}}
                />
                {!inline && message && <div className="mt-3">{message}</div>}
            </div>
        </div>
    )
}
