import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { ToggleField } from '@gorgias/axiom'

import warningIcon from 'assets/img/icons/warning.svg'
import { useFlag } from 'core/flags'
import PlaygroundActionsModal from 'pages/aiAgent/Playground/components/PlaygroundActionsModal/PlaygroundActionsModal'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'

import css from './PlaygroundActionsToggle.less'

interface PlaygroundActionsToggleProps {
    value: boolean
    onChange: (value: boolean) => void
}

const PlaygroundActionsToggle: React.FC<PlaygroundActionsToggleProps> = (
    props,
) => {
    const isFFEnabled = useFlag(
        FeatureFlagKey.EnableActionsOnPlaygroundForMerchants,
    )
    const [isModalOpen, setIsModalOpen] = React.useState(false)

    const onModalConfirm = () => {
        props.onChange(true)
        setIsModalOpen(false)
    }

    const tooltipText = props.value
        ? 'Actions triggered on existing tickets or customers will change live data. These changes are permanent and cannot be undone. Proceed with caution.'
        : 'Any Actions used by AI Agent in test conversations will not actually be performed and will not impact real customer or order data.'

    return isFFEnabled ? (
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
            {props.value ? (
                <span className={css.enabledContainer}>
                    <img
                        className={css.warningIcon}
                        alt="warning"
                        src={warningIcon}
                    />
                    <span className={css.warningText}>
                        Actions enabled - changes will affect live data
                    </span>
                </span>
            ) : (
                <>
                    <span className={css.warningText}>
                        Actions disabled - no changes will be made to live data
                    </span>
                </>
            )}
            <IconTooltip className={css.infoIcon} interactive>
                {tooltipText}
            </IconTooltip>
        </div>
    ) : (
        <></>
    )
}

export default PlaygroundActionsToggle
