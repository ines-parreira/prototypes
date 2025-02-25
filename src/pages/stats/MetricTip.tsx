import React, { PropsWithChildren, ReactNode } from 'react'

import classnames from 'classnames'

import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import css from 'pages/stats/MetricTip.less'

type SuccessLevel =
    | 'neutral'
    | 'error'
    | 'success'
    | 'light-error'
    | 'light-success'

type Props = {
    className?: string
    hint?: string
    title: ReactNode
    type?: SuccessLevel
}

export default function MetricTip({
    children,
    className,
    hint,
    title,
    type = 'neutral',
}: PropsWithChildren<Props>) {
    return (
        <div className={classnames(css.wrapper, className, css[type])}>
            <div className={classnames('body-semibold', css.title)}>
                {title}
                {hint && (
                    <IconTooltip
                        tooltipProps={{
                            placement: 'top-start',
                        }}
                    >
                        {hint}
                    </IconTooltip>
                )}
            </div>
            {children}
        </div>
    )
}
