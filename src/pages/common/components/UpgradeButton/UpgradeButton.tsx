import React, {ComponentProps, useMemo} from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel, {
    ButtonIconPosition,
} from 'pages/common/components/button/ButtonIconLabel'
import {logEvent, SegmentEventToSend} from 'store/middlewares/segmentTracker'

import css from './UpgradeButton.less'

type Props = {
    hasIcon?: boolean
    label?: string
    position?: ButtonIconPosition
    segmentEventToSend?: SegmentEventToSend
    state?: any
} & ComponentProps<typeof Button>

const UpgradeButton = ({
    className,
    label = 'Upgrade',
    onClick,
    state = {},
    segmentEventToSend,
    position = 'right',
    hasIcon = true,
    ...other
}: Props) => {
    const buttonContent = useMemo(
        () =>
            hasIcon ? (
                <ButtonIconLabel icon="auto_awesome" position={position}>
                    {label}
                </ButtonIconLabel>
            ) : (
                label
            ),
        [hasIcon, label, position]
    )

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
                            !!segmentEventToSend &&
                                logEvent(
                                    segmentEventToSend.name,
                                    segmentEventToSend.props
                                )
                            onClick(e)
                        }}
                    >
                        {buttonContent}
                    </Button>
                ) : (
                    // TODO[COR-1569]: There should be a single source of truth for the state
                    <Link to={{pathname: '/app/settings/billing/plans', state}}>
                        <Button
                            {...other}
                            onClick={() =>
                                !!segmentEventToSend &&
                                logEvent(
                                    segmentEventToSend.name,
                                    segmentEventToSend.props
                                )
                            }
                        >
                            {buttonContent}
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    )
}

export default UpgradeButton
