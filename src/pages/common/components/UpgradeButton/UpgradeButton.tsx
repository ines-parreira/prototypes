import React, {ComponentProps} from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel, {
    ButtonIconPosition,
} from 'pages/common/components/button/ButtonIconLabel'
import {
    logEvent,
    SegmentEvent,
} from '../../../../store/middlewares/segmentTracker'

import css from './UpgradeButton.less'

type Props = {
    segmentEventToSend?: Partial<SegmentEventToSend>
    state?: any
    label?: string
} & ComponentProps<typeof Button>

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
    className,
    label = 'Upgrade',
    onClick,
    state = {},
    segmentEventToSend = {},
    ...other
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
                        {...other}
                        onClick={(e) => {
                            sendSegmentEvent(segmentEventToSend)
                            onClick(e)
                        }}
                    >
                        <ButtonIconLabel
                            icon="auto_awesome"
                            position={ButtonIconPosition.Right}
                        >
                            {label}
                        </ButtonIconLabel>
                    </Button>
                ) : (
                    // TODO[COR-1569]: There should be a single source of truth for the state
                    <Link to={{pathname: '/app/settings/billing/plans', state}}>
                        <Button
                            {...other}
                            onClick={() => {
                                sendSegmentEvent(segmentEventToSend)
                            }}
                        >
                            <ButtonIconLabel
                                icon="auto_awesome"
                                position={ButtonIconPosition.Right}
                            >
                                {label}
                            </ButtonIconLabel>
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    )
}

export default UpgradeButton
