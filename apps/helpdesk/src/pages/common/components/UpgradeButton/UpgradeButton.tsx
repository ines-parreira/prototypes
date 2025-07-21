import React, { useMemo } from 'react'

import classnames from 'classnames'
import { Link } from 'react-router-dom'

import { logEvent, SegmentEventToSend } from 'common/segment'
import Button, { type ButtonProps } from 'pages/common/components/button/Button'
import ButtonIconLabel, {
    ButtonIconPosition,
} from 'pages/common/components/button/ButtonIconLabel'

import css from './UpgradeButton.less'

type Props = {
    hasIcon?: boolean
    label?: string
    position?: ButtonIconPosition
    segmentEventToSend?: SegmentEventToSend
    state?: any
} & Omit<ButtonProps, 'children'>

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
                <ButtonIconLabel icon="bolt" position={position}>
                    {label}
                </ButtonIconLabel>
            ) : (
                label
            ),
        [hasIcon, label, position],
    )

    const pathname = '/app/settings/billing'

    return (
        <div className={className}>
            <div
                className={classnames(
                    'd-flex',
                    'align-items-center',
                    css.upgradeLink,
                )}
            >
                {onClick ? (
                    <Button
                        {...other}
                        onClick={(e) => {
                            !!segmentEventToSend &&
                                logEvent(
                                    segmentEventToSend.name,
                                    segmentEventToSend.props,
                                )
                            onClick(e)
                        }}
                    >
                        {buttonContent}
                    </Button>
                ) : (
                    // TODO[COR-1569]: There should be a single source of truth for the state
                    <Link to={{ pathname, state }}>
                        <Button
                            {...other}
                            onClick={() =>
                                !!segmentEventToSend &&
                                logEvent(
                                    segmentEventToSend.name,
                                    segmentEventToSend.props,
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
