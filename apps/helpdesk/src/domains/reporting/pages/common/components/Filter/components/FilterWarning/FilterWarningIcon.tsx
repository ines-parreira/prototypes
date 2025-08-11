import React, { ComponentProps, useRef } from 'react'

import classnames from 'classnames'

import { Tooltip } from '@gorgias/axiom'

import css from 'domains/reporting/pages/common/components/Filter/components/FilterWarning/FilterWarningIcon.less'
import { FILTER_WARNING_ICON } from 'domains/reporting/pages/common/components/Filter/constants'

type Props = {
    warningType: 'non-existent' | 'not-applicable'
    tooltip: string
    tooltipPlacement?: ComponentProps<typeof Tooltip>['placement']
}

export const FilterWarningIcon = ({
    warningType,
    tooltip,
    tooltipPlacement = 'bottom-end',
}: Props) => {
    const ref = useRef<HTMLElement>(null)
    const iconColorClass =
        warningType === 'non-existent' ? 'nonExistent' : 'notApplicable'

    return (
        <>
            <i
                className={classnames(
                    'icon material-icons',
                    css.icon,
                    css[iconColorClass],
                )}
                ref={ref}
            >
                {FILTER_WARNING_ICON}
            </i>
            <Tooltip
                target={ref}
                placement={tooltipPlacement}
                boundariesElement={'body'}
            >
                {tooltip}
            </Tooltip>
        </>
    )
}
