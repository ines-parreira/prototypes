import cn from 'classnames'

import { ActivationProgress } from 'pages/aiAgent/Activation/components/ActivationProgress/ActivationProgress'

import css from './ActivationManageButton.less'

const getCaptionText = (activationProgress: number) => {
    if (activationProgress === 0) {
        return 'Activate AI Agent'
    } else if (activationProgress === 100) {
        return 'Fully activated'
    }
    return 'Partially activated'
}

type Props = {
    onClick: () => void
    progress: number
    variant?: 'flat' | 'bordered'
}
export const ActivationManageButton = ({
    onClick,
    progress,
    variant = 'bordered',
}: Props) => {
    const captionText = getCaptionText(progress)
    return (
        <button
            type="button"
            className={cn(css.button, css[variant])}
            onClick={onClick}
        >
            <div className={css.progressStatus}>
                <ActivationProgress
                    className={css.progress}
                    percentage={progress}
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
