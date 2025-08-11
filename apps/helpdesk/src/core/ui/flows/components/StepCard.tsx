import classNames from 'classnames'

import { TruncateCellContent } from 'domains/reporting/pages/common/components/TruncateCellContent'

import { StepCardErrorIcon } from './StepCardErrorIcon'

import css from './StepCard.less'

type StepCardProps = {
    title: React.ReactNode
    description: React.ReactNode
    icon?: React.ReactNode
    isSelected?: boolean
    errors?: string[]
    children?: React.ReactNode
}

export function StepCard({
    title,
    description,
    icon,
    isSelected = false,
    errors = [],
    children,
}: StepCardProps) {
    const hasErrors = errors.length > 0

    return (
        <div
            className={classNames(css.container, {
                [css.selected]: isSelected,
                [css.withErrors]: hasErrors,
            })}
        >
            {icon && <div className={css.icon}>{icon}</div>}

            <div className={css.textContent}>
                <div className={css.title}>
                    {hasErrors && (
                        <StepCardErrorIcon
                            errors={errors}
                            errorTitle={"This step hasn't been configured yet."}
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
