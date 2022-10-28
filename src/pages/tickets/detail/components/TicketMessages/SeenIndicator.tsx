import classNames from 'classnames'
import React from 'react'

import {formatDatetime} from '../../../../../utils'
import Tooltip from '../../../../common/components/Tooltip'

import css from './SeenIndicator.style.less'

enum SeenIndicatorStatus {
    DELIVERED = 'Delivered',
    READ = `Read`,
}
type Props = {
    displayMessageStatusIndicator: boolean
    iconElementId: number
    openedDatetime?: string | null
    sentDatetime?: string | null
    timezone: string
}

export default function SeenIndicator(props: Props) {
    const {
        displayMessageStatusIndicator,
        iconElementId,
        openedDatetime,
        timezone,
    } = props
    const indicator = openedDatetime ? 'done_all' : 'done'
    const elementId = `seen-indicator-id-${iconElementId}`

    const getSeenIndicatorTooltipText = ({
        openedDatetime,
        timezone,
    }: Pick<Props, 'openedDatetime' | 'timezone'>) => {
        if (!openedDatetime) {
            return SeenIndicatorStatus.DELIVERED
        }

        const datetime = formatDatetime(openedDatetime, timezone)

        return typeof datetime === 'string'
            ? `${SeenIndicatorStatus.READ} ${datetime.toLowerCase()}`
            : SeenIndicatorStatus.DELIVERED
    }

    return (
        <span>
            {displayMessageStatusIndicator && (
                <>
                    <i
                        id={elementId}
                        className={classNames('material-icons mr-2')}
                    >
                        {indicator}
                    </i>
                    <Tooltip
                        placement="top"
                        target={elementId}
                        className={css.tooltip}
                    >
                        {getSeenIndicatorTooltipText({
                            openedDatetime,
                            timezone,
                        })}
                    </Tooltip>
                </>
            )}
        </span>
    )
}
