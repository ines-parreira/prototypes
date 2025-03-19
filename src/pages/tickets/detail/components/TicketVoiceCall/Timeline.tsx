import css from './Timeline.less'

type TimelineProps = {
    children: React.ReactNode
}

export default function Timeline({ children }: TimelineProps) {
    return <div className={css.container}>{children}</div>
}
