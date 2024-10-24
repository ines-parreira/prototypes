import {Tooltip} from '@gorgias/ui-kit'
import classnames from 'classnames'
import React, {useRef} from 'react'

import css from 'pages/stats/common/components/Filter/components/FilterWarning/FilterWarningIcon.less'
import {FILTER_WARNING_ICON} from 'pages/stats/common/components/Filter/constants'

type Props = {
    warningType: 'non-existent' | 'not-applicable'
    tooltip: string
}

export const FilterWarningIcon = ({warningType, tooltip}: Props) => {
    const ref = useRef<HTMLElement>(null)
    const iconColorClass =
        warningType === 'non-existent' ? 'nonExistent' : 'notApplicable'

    return (
        <>
            <i
                className={classnames(
                    'icon material-icons',
                    css.icon,
                    css[iconColorClass]
                )}
                ref={ref}
            >
                {FILTER_WARNING_ICON}
            </i>
            <Tooltip
                target={ref}
                placement="bottom-end"
                boundariesElement={'body'}
            >
                {tooltip}
            </Tooltip>
        </>
    )
}
