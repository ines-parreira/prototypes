import React from 'react'

import { ToggleField, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import warningIcon from 'assets/img/icons/warning.svg'
import PlaygroundActionsModal from 'pages/aiAgent/Playground/components/PlaygroundActionsModal/PlaygroundActionsModal'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'

import css from './PlaygroundActionsToggle.less'

interface PlaygroundActionsToggleProps {
    value: boolean
    onChange: (value: boolean) => void
}

const getTooltipContent = (isEnabled: boolean) => {
    return isEnabled
        ? 'Actions triggered on existing tickets or customers will change live data. These changes are permanent and cannot be undone. Proceed with caution.'
        : 'Any Actions used by AI Agent in test conversations will not actually be performed and will not impact real customer or order data.'
}

const EnabledState = () => {
    const warningIconRef = React.useRef<HTMLImageElement>(null)
    const tooltipContent = getTooltipContent(true)

    return (
        <span className={css.enabledContainer}>
            <img
                ref={warningIconRef}
                className={css.warningIcon}
                alt="warning"
                src={warningIcon}
            />
            <Tooltip target={warningIconRef}>{tooltipContent}</Tooltip>
            <span className={css.warningText}>
                Actions enabled - changes will affect live data
            </span>
        </span>
    )
}

const DisabledState = () => (
    <span className={css.warningText}>
        Actions disabled - no changes will be made to live data
    </span>
)

const PlaygroundActionsToggle: React.FC<PlaygroundActionsToggleProps> = (
    props,
) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const tooltipContent = getTooltipContent(props.value)

    const onModalConfirm = () => {
        props.onChange(true)
        setIsModalOpen(false)
    }

    return (
        <div className={css.playgroundActionsToggle}>
            <PlaygroundActionsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={onModalConfirm}
            />
            <ToggleField
                value={props.value}
                onChange={() =>
                    props.value ? props.onChange(false) : setIsModalOpen(true)
                }
            />
            {props.value ? <EnabledState /> : <DisabledState />}
            <IconTooltip className={css.infoIcon} interactive>
                {tooltipContent}
            </IconTooltip>
        </div>
    )
}

export default PlaygroundActionsToggle
