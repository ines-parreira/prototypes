import type { ReactNode } from 'react'

import { useId } from '@repo/hooks'

import {
    LegacyToggleField as ToggleField,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

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
            <ToggleField
                className={css.featureToggle}
                value={value}
                isDisabled={disabled}
                onChange={onChange}
                caption={description}
                name={toggleInputId}
                label={name}
            />
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
