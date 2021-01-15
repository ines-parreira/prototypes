import React from 'react'
import {Link} from 'react-router'
import {Button} from 'reactstrap'
import classnames from 'classnames'

import upgradeIcon from '../../../../../img/icons/upgrade-icon.svg'

import css from './UpgradeButton.less'

type Size = 'sm'

type Props = {
    className?: string
    hasInvertedColors?: boolean
    size?: Size
    label?: string
}

const UpgradeButton = ({
    className = '',
    hasInvertedColors = false,
    size,
    label = 'Upgrade',
}: Props) => {
    return (
        <Button
            outline
            color="warning"
            className={classnames(
                className,
                css.upgradeButton,
                size && css[size],
                {
                    [css.invertedColors]: hasInvertedColors,
                }
            )}
        >
            <Link
                to="/app/settings/billing/plans"
                className={classnames(
                    'd-flex',
                    'align-items-center',
                    css.upgradeLink
                )}
            >
                <span className={classnames('mr-2', css.upgradeLabel)}>
                    {label}
                </span>
                <img
                    src={upgradeIcon}
                    alt="upgrade-icon"
                    className={classnames(css.upgradeIcon, size && css[size])}
                />
            </Link>
        </Button>
    )
}

export default UpgradeButton
