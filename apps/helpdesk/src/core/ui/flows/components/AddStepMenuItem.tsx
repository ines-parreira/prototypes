import css from './AddStepMenuItem.less'

export type AddButtonMenuItemProps = {
    label: React.ReactNode
    icon?: React.ReactNode
    onClick: () => void
}

export function AddStepMenuItem({
    icon,
    label,
    onClick,
}: AddButtonMenuItemProps) {
    return (
        <div className={css.item} onClick={onClick}>
            {icon}
            {label}
        </div>
    )
}
