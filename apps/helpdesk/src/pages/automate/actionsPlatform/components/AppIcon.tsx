import css from './AppIcon.less'

type Props = {
    icon?: string
    name?: string
    className?: string
}

const AppIcon = ({ icon, name, className }: Props) => {
    return (
        <img
            src={icon}
            alt={name}
            className={className ?? css.container}
            title={name}
        />
    )
}

export { AppIcon }
