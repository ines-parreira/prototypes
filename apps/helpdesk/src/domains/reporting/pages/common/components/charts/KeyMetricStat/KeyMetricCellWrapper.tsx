import React, { ReactNode } from 'react'

import classnames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import css from 'domains/reporting/pages/common/components/charts/KeyMetricStat/KeyMetricCellWrapper.less'
import StatsHelpIcon from 'domains/reporting/pages/common/components/StatsHelpIcon'

type Props = {
    children: ReactNode
    label: string
    tooltipId?: string
    tooltip?: string | ReactNode
}

const KeyMetricCellWrapper = ({
    children,
    label,
    tooltipId,
    tooltip,
}: Props) => {
    return (
        <div className={css.metric}>
            <div className={classnames(css.label)}>
                {label}
                {tooltip && tooltipId && (
                    <span>
                        <StatsHelpIcon
                            id={tooltipId}
                            className={css['info-icon']}
                        />
                        <Tooltip
                            autohide={false}
                            placement="top"
                            target={tooltipId}
                        >
                            {tooltip}
                        </Tooltip>
                    </span>
                )}
            </div>
            {children}
        </div>
    )
}

export default KeyMetricCellWrapper
