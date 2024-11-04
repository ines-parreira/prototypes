import {Placement} from '@floating-ui/react'
import {Tooltip} from '@gorgias/merchant-ui-kit'
import React, {ReactNode} from 'react'

import StatsHelpIcon from '../../../../stats/common/components/StatsHelpIcon'
import css from './InfoIconWithTooltip.less'

type Props = {
    id: string
    tooltipProps: {
        autohide?: boolean
        placement?: Placement
    }
    children: ReactNode
}
const InfoIconWithTooltip: React.FC<Props> = ({id, tooltipProps, children}) => {
    return (
        <span className={css.infoIconWithTooltip}>
            <StatsHelpIcon id={id} />
            <Tooltip target={id} {...tooltipProps}>
                {children}
            </Tooltip>
        </span>
    )
}

export default InfoIconWithTooltip
