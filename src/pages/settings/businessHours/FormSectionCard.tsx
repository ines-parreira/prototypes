import css from './FormSectionCard.less'

type Props = {
    children: React.ReactNode
}

export default function FormSectionCard({ children }: Props) {
    return <div className={css.container}>{children}</div>
}
