import css from './Subtitle.less'

type Props = {
    children: React.ReactNode
}
export const Subtitle = ({ children }: Props) => {
    return <div className={css.container}>{children}</div>
}
