import React, {ReactNode} from 'react'

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
    return (
        <div className={css.feature}>
            <ToggleInput
                className={css.featureToggle}
                isToggled={value}
                isDisabled={disabled}
                onClick={onChange}
                caption={description}
            >
                {name}
            </ToggleInput>
            {action}
        </div>
    )
}

export default ConnectedChannelFeatureToggle
