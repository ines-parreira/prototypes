import classNames from 'classnames'

import css from './Timeline.less'

type TimelineProps = {
    children: React.ReactNode
    useFullWidth?: boolean
}

export default function Timeline({ children, useFullWidth }: TimelineProps) {
    return (
        <div
            className={classNames(css.container, {
                [css.fullWidth]: useFullWidth,
            })}
        >
            {children}
        </div>
    )
}
