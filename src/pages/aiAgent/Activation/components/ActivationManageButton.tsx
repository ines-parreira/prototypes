import React from 'react'

import TrackerCircle from 'pages/common/components/ProgressTracker/TrackerCircle'

import css from './ActivationManageButton.less'

const getCaptionText = (activationProgress: number) => {
    if (activationProgress === 0) {
        return 'Activate AI Agent'
    } else if (activationProgress === 1) {
        return 'Fully Activated'
    }
    return 'Partially Activated'
}

type Props = {
    onClick: () => void
    /** Between 0 (not activated) and 1 (fully activated) */
    progress: number
}
export const ActivationManageButton = ({ onClick, progress }: Props) => {
    const captionText = getCaptionText(progress)
    const percentage = Math.round(progress * 100)
    return (
        <button type="button" className={css.button} onClick={onClick}>
            <div className={css.progressStatus}>
                <TrackerCircle
                    className={css.progress}
                    percentage={percentage}
                    color="#C34CED"
                    radius={18}
                    strokeWidth={3}
                    label={`${percentage}%`}
                />
                <div className={css.caption}>{captionText}</div>
            </div>
            <div className={css.separator} />
            <div className={css.label}>
                Manage <i className="material-icons">chevron_right</i>
            </div>
        </button>
    )
}
