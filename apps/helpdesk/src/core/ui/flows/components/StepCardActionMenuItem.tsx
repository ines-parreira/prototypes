import classNames from 'classnames'

import css from './StepCardActionMenu.less'

export type StepCardActionMenuItemProps = {
    label: string
    icon?: React.ReactNode
    onClick: () => void
    className?: string
}

export function StepCardActionMenuItem({
    label,
    icon,
    onClick,
    className,
}: StepCardActionMenuItemProps) {
    return (
        <div
            className={classNames(css.menuOptionContent, className)}
            onClick={onClick}
        >
            {icon}
            {label}
        </div>
    )
}
