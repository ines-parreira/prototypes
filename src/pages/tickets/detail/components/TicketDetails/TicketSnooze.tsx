import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useRef} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Tooltip from 'pages/common/components/Tooltip'
import {formatDatetime} from 'utils'

import css from './TicketSnooze.less'

type Props = {
    className?: string
    datetime?: string
    timezone: string | null
}

const TicketSnooze = ({className, datetime, timezone}: Props) => {
    const hasSeparateSnooze =
        useFlags()[FeatureFlagKey.SeparateSnoozeButton] || false
    const badgeRef = useRef<HTMLDivElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)

    if (!datetime) return null

    return !hasSeparateSnooze ? (
        <>
            <div
                ref={wrapperRef}
                className={classnames(css.wrapper, className)}
            >
                <i className={classnames('icon material-icons', css.icon)}>
                    snooze
                </i>
                <span className={css.label}>Snoozed Ticket</span>
            </div>
            <Tooltip placement="bottom" target={wrapperRef}>
                Snooze {formatDatetime(datetime, timezone)}
            </Tooltip>
        </>
    ) : (
        <>
            <span ref={badgeRef} className={css.badge}>
                <Badge type={ColorType.Blue}>Snoozed</Badge>
            </span>
            <Tooltip placement="bottom" target={badgeRef}>
                Snoozed until {formatDatetime(datetime, timezone)}
            </Tooltip>
        </>
    )
}

export default TicketSnooze
