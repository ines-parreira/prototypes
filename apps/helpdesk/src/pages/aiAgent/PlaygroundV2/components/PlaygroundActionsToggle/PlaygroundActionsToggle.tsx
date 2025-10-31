import React from 'react'

import { ToggleField, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import warningIcon from 'assets/img/icons/warning.svg'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'

import { getActionsToggleTooltipContent } from '../../utils/playground.utils'
import PlaygroundActionsModal from '../PlaygroundActionsModal/PlaygroundActionsModal'

import css from './PlaygroundActionsToggle.less'

type PlaygroundActionsToggleProps = {
    value: boolean
    onChange: (value: boolean) => void
}

const EnabledState = () => {
    const warningIconRef = React.useRef<HTMLImageElement>(null)
    const tooltipContent = getActionsToggleTooltipContent(true)

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
    const tooltipContent = getActionsToggleTooltipContent(props.value)

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
