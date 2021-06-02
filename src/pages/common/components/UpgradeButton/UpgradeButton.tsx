import React from 'react'
import {Link} from 'react-router-dom'
import {Button} from 'reactstrap'
import classnames from 'classnames'

import upgradeIcon from '../../../../../img/icons/upgrade-icon.svg'

import * as segmentTracker from '../../../../store/middlewares/segmentTracker.js'

import css from './UpgradeButton.less'

type Size = 'sm'

type Props = {
    className?: string
    hasInvertedColors?: boolean
    label?: string
    size?: Size
    state?: any
    segmentEventToSend?: any
}

type SegmentEventToSend = {
    name: string
    props: any
}

function sendSegmentEvent(segmentEventToSend: SegmentEventToSend) {
    if (
        segmentEventToSend &&
        Object.prototype.hasOwnProperty.call(segmentEventToSend, 'name') &&
        Object.prototype.hasOwnProperty.call(segmentEventToSend, 'props')
    ) {
        segmentTracker.logEvent(
            segmentEventToSend.name,
            segmentEventToSend.props
        )
    }
}

const UpgradeButton = ({
    className = '',
    hasInvertedColors = false,
    label = 'Upgrade',
    size,
    state = {},
    segmentEventToSend = {},
}: Props) => {
    return (
        <div className={className}>
            <Link
                to={{pathname: '/app/settings/billing/plans', state}}
                className={classnames(
                    'd-flex',
                    'align-items-center',
                    css.upgradeLink
                )}
            >
                <Button
                    outline
                    color="warning"
                    className={classnames(
                        css.upgradeButton,
                        size && css[size],
                        {
                            [css.invertedColors]: hasInvertedColors,
                        }
                    )}
                    onClick={() => sendSegmentEvent(segmentEventToSend)}
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
                        className={classnames(
                            css.upgradeIcon,
                            size && css[size]
                        )}
                    />
                </Button>
            </Link>
        </div>
    )
}

export default UpgradeButton
