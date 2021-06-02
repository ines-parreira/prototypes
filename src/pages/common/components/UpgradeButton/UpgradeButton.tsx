import React from 'react'
import {Link} from 'react-router-dom'
import {Button} from 'reactstrap'
import classnames from 'classnames'

import upgradeIcon from '../../../../../img/icons/upgrade-icon.svg'

import css from './UpgradeButton.less'

type Size = 'sm'

type Props = {
    className?: string
    hasInvertedColors?: boolean
    label?: string
    size?: Size
    state?: any
}

const UpgradeButton = ({
    className = '',
    hasInvertedColors = false,
    label = 'Upgrade',
    size,
    state = {},
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
