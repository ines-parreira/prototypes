import css from './ActionLabel.less'

type ActionLabelProps = {
    label: string
    icon?: React.ReactNode
}

export function ActionLabel({ label, icon }: ActionLabelProps): JSX.Element {
    return (
        <div className={css.container}>
            {icon}
            <span>{label}</span>
        </div>
    )
}
