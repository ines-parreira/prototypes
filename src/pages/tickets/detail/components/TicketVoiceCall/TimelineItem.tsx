import React from 'react'

import css from './Timeline.less'

type TimelineItemProps = {
    children: React.ReactNode
}

export default function TimelineItem({children}: TimelineItemProps) {
    return (
        <div className={css.timelineItem}>
            <div className={css.separator}>
                <div className={css.dot} />
                <div className={css.line} />
            </div>
            <div>{children}</div>
        </div>
    )
}
