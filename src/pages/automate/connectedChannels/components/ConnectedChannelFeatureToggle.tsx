import React, { ReactNode } from 'react'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'
import ToggleInput from 'pages/common/forms/ToggleInput'

import css from './ConnectedChannelFeatureToggle.less'

type Props = {
    name: ReactNode
    description?: string
    value: boolean
    onChange: (value: boolean) => void
    disabled?: boolean
    action?: ReactNode
    tooltipMessage?: string
}

const ConnectedChannelFeatureToggle = ({
    name,
    description,
    value,
    onChange,
    disabled,
    action,
    tooltipMessage,
}: Props) => {
    const toggleInputId = `feature-toggle-${useId()}`
    return (
        <div className={css.feature}>
            <ToggleInput
                className={css.featureToggle}
                isToggled={value}
                isDisabled={disabled}
                onClick={onChange}
                caption={description}
                name={toggleInputId}
            >
                {name}
            </ToggleInput>
            {tooltipMessage && (
                <Tooltip target={`${toggleInputId} + div`}>
                    {tooltipMessage}
                </Tooltip>
            )}
            {action}
        </div>
    )
}

export default ConnectedChannelFeatureToggle
