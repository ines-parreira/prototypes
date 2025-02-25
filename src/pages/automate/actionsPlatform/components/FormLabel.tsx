import React, { ReactNode } from 'react'

import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'

import css from './FormLabel.less'

type Props = {
    isRequired?: boolean
    tooltip?: ReactNode
    placement?: 'top-start' | 'right'
    children: ReactNode
}

const FormLabel = ({
    isRequired,
    tooltip,
    placement = 'top-start',
    children,
}: Props) => {
    return (
        <div className={css.container}>
            <span className={css.label}>{children}</span>
            {isRequired && <span className={css.asterisk}>*</span>}
            {tooltip && (
                <IconTooltip
                    tooltipProps={{
                        placement,
                        className: css.tooltip,
                    }}
                >
                    {tooltip}
                </IconTooltip>
            )}
        </div>
    )
}

export default FormLabel
