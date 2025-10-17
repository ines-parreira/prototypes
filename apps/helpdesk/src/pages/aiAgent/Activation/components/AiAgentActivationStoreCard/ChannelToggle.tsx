import React, { useMemo } from 'react'

import { useId } from '@repo/hooks'
import classNames from 'classnames'

import { Label, Tooltip } from '@gorgias/axiom'

import warningIcon from 'assets/img/icons/warning.svg'
import css from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCard.less'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import { NewToggleButton } from 'pages/common/forms/NewToggleButton'

type ChannelToggleProps = {
    label: string | React.ReactNode
    checked: boolean
    disabled: boolean
    onChange: (value: boolean) => void
    warnings: {
        visible: boolean
        hint: string
        action: React.ReactNode
    }[]
    tooltip: {
        visible: boolean
        content: React.ReactNode
    }
    color?: string
    className?: string
}
export const ChannelToggle = ({
    className,
    label,
    checked,
    disabled,
    onChange,
    warnings,
    tooltip,
    color,
}: ChannelToggleProps) => {
    const id = useId()
    const warningId = `channel_${id}_warning_icon`
    const firstWarning = useMemo(() => {
        return warnings.find((warning) => warning.visible)
    }, [warnings])

    return (
        <div className={classNames(css.channel, className)}>
            <div className={css.channelToggle}>
                <Label
                    className={classNames(css.label, {
                        [css.disabled]: disabled,
                    })}
                >
                    <NewToggleButton
                        isDisabled={disabled}
                        checked={checked}
                        onChange={onChange}
                        stopPropagation
                        color={color}
                    />
                    {label}
                </Label>
                {!firstWarning?.visible && tooltip.visible && (
                    <IconTooltip
                        className={css.icon}
                        tooltipProps={{
                            placement: 'top-start',
                        }}
                    >
                        {tooltip.content}
                    </IconTooltip>
                )}
                {!!firstWarning?.visible && (
                    <>
                        <img
                            id={warningId}
                            className={css.warningIcon}
                            alt="warning"
                            src={warningIcon}
                        />
                        <Tooltip target={warningId}>
                            {firstWarning.hint}
                        </Tooltip>
                    </>
                )}
            </div>
            <div className={css.channelCaption}>
                {!!firstWarning?.visible && firstWarning?.action}
            </div>
        </div>
    )
}
