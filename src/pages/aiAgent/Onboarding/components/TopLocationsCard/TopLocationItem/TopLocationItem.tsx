import React from 'react'

import {Location} from 'pages/aiAgent/Onboarding/components/TopLocationsCard/types'

import css from './TopLocationItem.less'

type Props = {
    location: Location
}

const TopLocationItem = ({location}: Props) => {
    const percentage = location.percentage ?? 0
    let percentageWidth = '1px'

    if (percentage > 0) {
        percentageWidth = percentage > 100 ? '100%' : `${percentage}%`
    }

    return (
        <div className={css.item}>
            <div className={css.title}>{location.title}</div>
            <div className={css.progress}>
                <div style={{width: percentageWidth}} className={css.bar}></div>
                <div className={css.percentage}>{percentage}%</div>
            </div>
        </div>
    )
}

export default TopLocationItem
