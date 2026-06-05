import React from 'react'

import css from 'domains/reporting/pages/common/components/StatCurrentDate.less'
import { useStatCurrentDate } from 'domains/reporting/pages/common/components/useStatCurrentDate'

export default function StatCurrentDate() {
    const { dateLabel, businessHoursLabel } = useStatCurrentDate()

    return (
        <div className={css.wrapper}>
            <span className={css.date}>{dateLabel}</span>
            {businessHoursLabel && (
                <span className={css.businessHours}>{businessHoursLabel}</span>
            )}
        </div>
    )
}
