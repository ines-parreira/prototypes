import React from 'react'

import cn from 'classnames'

export const NotificationIcon = React.memo<{ className?: string }>(
    ({ className }) => (
        <i className={cn('material-icons', className)} aria-hidden="true">
            notifications_none
        </i>
    ),
)

export const GMVIcon = React.memo<{ className?: string }>(({ className }) => (
    <i className={cn('material-icons', className)} aria-hidden="true">
        insights
    </i>
))
