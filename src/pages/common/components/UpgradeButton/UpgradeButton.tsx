import React, {SyntheticEvent} from 'react'
import {Link} from 'react-router-dom'
import {Button as ReactstrapButton} from 'reactstrap'
import classnames from 'classnames'

import upgradeIcon from 'assets/img/icons/upgrade-icon.svg'

import {
    logEvent,
    SegmentEvent,
} from '../../../../store/middlewares/segmentTracker'

import css from './UpgradeButton.less'

type Size = 'sm'

type Props = {
    hasInvertedColors?: boolean
    className?: string
    segmentEventToSend?: Partial<SegmentEventToSend>
    state?: any
    label?: string
    size?: Size
    onClick?: (event?: SyntheticEvent) => void
}

type SegmentEventToSend = {
    name: SegmentEvent
    props: any
}

function sendSegmentEvent(segmentEventToSend?: Partial<SegmentEventToSend>) {
    if (
        segmentEventToSend &&
        Object.prototype.hasOwnProperty.call(segmentEventToSend, 'name') &&
        Object.prototype.hasOwnProperty.call(segmentEventToSend, 'props')
    ) {
        logEvent(segmentEventToSend.name!, segmentEventToSend.props)
    }
}

const UpgradeButton = ({
    className = '',
    hasInvertedColors = false,
    label = 'Upgrade',
    onClick,
    size,
    state = {},
    segmentEventToSend = {},
}: Props) => {
    return (
        <div className={className}>
            <div
                className={classnames(
                    'd-flex',
                    'align-items-center',
                    css.upgradeLink
                )}
            >
                {onClick ? (
                    <Button
                        className={classnames({
                            [css.invertedColors]: hasInvertedColors,
                        })}
                        label={label}
                        onClick={(e) => {
                            sendSegmentEvent(segmentEventToSend)
                            onClick(e)
                        }}
                        size={size}
                    />
                ) : (
                    // TODO[COR-1569]: There should be a single source of truth for the state
                    <Link to={{pathname: '/app/settings/billing/plans', state}}>
                        <Button
                            className={classnames({
                                [css.invertedColors]: hasInvertedColors,
                            })}
                            label={label}
                            size={size}
                            onClick={() => {
                                sendSegmentEvent(segmentEventToSend)
                            }}
                        />
                    </Link>
                )}
            </div>
        </div>
    )
}

function Button({
    label,
    className,
    onClick,
    size,
}: Pick<Props, 'label' | 'className' | 'onClick' | 'size'>) {
    return (
        <ReactstrapButton
            outline
            color="warning"
            className={classnames(
                css.upgradeButton,
                size && css[size],
                className
            )}
            onClick={onClick}
        >
            <span
                className={classnames(
                    'mr-2',
                    css.upgradeLabel,
                    size && css[size]
                )}
            >
                {label}
            </span>
            <img
                src={upgradeIcon}
                alt="upgrade-icon"
                className={classnames(css.upgradeIcon, size && css[size])}
            />
        </ReactstrapButton>
    )
}

export default UpgradeButton
