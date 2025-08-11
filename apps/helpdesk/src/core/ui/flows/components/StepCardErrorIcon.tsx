import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'

import css from './StepCardErrorIcon.less'

export type StepCardErrorTooltipProps = {
    errorTitle?: string
    errors: string[]
}

export function StepCardErrorIcon({
    errorTitle,
    errors,
}: StepCardErrorTooltipProps) {
    return (
        <IconTooltip icon={'warning_amber'} className={css.errorIcon}>
            <div className={css.tooltipMessage}>
                {errorTitle ? (
                    <span className={css.errorTitle}>{errorTitle}</span>
                ) : null}
                {errors.map((error, index) => {
                    return (
                        <span className={css.errorMessage} key={index}>
                            {error}
                        </span>
                    )
                })}
            </div>
        </IconTooltip>
    )
}
