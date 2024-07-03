import React from 'react'
import classnames from 'classnames'

import css from './Loader.less'

type Props = {
    inline?: boolean
    message?: Record<string, unknown> | string
    minHeight?: string
    size?: string
    className?: string
    'data-testid'?: string
}

export default function Loader({
    className,
    message,
    inline = false,
    minHeight = '500px',
    size = '40px',
    'data-testid': dataTestId,
}: Props) {
    return (
        <div
            className={classnames(css.container, className)}
            data-testid={dataTestId}
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
