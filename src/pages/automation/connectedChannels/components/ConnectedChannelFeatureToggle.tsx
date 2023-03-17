import React, {ReactNode} from 'react'
import classnames from 'classnames'

import ToggleInput from 'pages/common/forms/ToggleInput'

import css from './ConnectedChannelFeatureToggle.less'

type Props = {
    name: string
    description?: string
    value: boolean
    onChange: (value: boolean) => void
    disabled?: boolean
    action?: ReactNode
}

const ConnectedChannelFeatureToggle = ({
    name,
    description,
    value,
    onChange,
    disabled,
    action,
}: Props) => {
    const toggle = () => !disabled && onChange(!value)

    return (
        <div className={css.feature}>
            <ToggleInput
                isToggled={value}
                isDisabled={disabled}
                onClick={toggle}
            />
            <div className={css.featureText}>
                <div
                    className={classnames(
                        css.featureName,
                        disabled && css.featureDisabled
                    )}
                >
                    {name}
                </div>
                {description && (
                    <div className={css.featureHint}>{description}</div>
                )}
            </div>
            <div className={css.action}>{action}</div>
        </div>
    )
}

export default ConnectedChannelFeatureToggle
