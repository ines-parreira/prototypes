import classNames from 'classnames'

import { TruncateCellContent } from 'domains/reporting/pages/common/components/TruncateCellContent'

import { StepCardTitleIcon } from './StepCardTitleIcon'

import css from './StepCard.less'

type StepCardProps = {
    title: React.ReactNode
    description: React.ReactNode
    icon?: React.ReactNode
    isSelected?: boolean
    errors?: string[]
    warnings?: string[]
    children?: React.ReactNode
}

export function StepCard({
    title,
    description,
    icon,
    isSelected = false,
    errors = [],
    warnings = [],
    children,
}: StepCardProps) {
    const hasErrors = errors.length > 0
    const hasWarnings = warnings.length > 0 && !hasErrors

    return (
        <div
            className={classNames(css.container, {
                [css.selected]: isSelected,
                [css.withErrors]: hasErrors,
                [css.withWarnings]: hasWarnings,
            })}
        >
            {icon && <div className={css.icon}>{icon}</div>}

            <div className={css.textContent}>
                <div className={css.title}>
                    {hasErrors && (
                        <StepCardTitleIcon
                            messages={errors}
                            messageTitle={
                                "This step hasn't been configured yet."
                            }
                        />
                    )}
                    {hasWarnings && (
                        <StepCardTitleIcon
                            messages={warnings}
                            variant="warning"
                        />
                    )}
                    <TruncateCellContent content={title} />
                </div>
                <div className={css.description}>
                    <TruncateCellContent content={description} />
                </div>
            </div>

            {children}
        </div>
    )
}
