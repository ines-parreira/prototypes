import React, {useMemo} from 'react'

import {MAX_TICKET_COUNT_PER_VIEW} from 'config/views'
import {compactInteger} from 'utils'

import DeactivatedViewIcon from '../DeactivatedViewIcon'

type OwnProps = {
    isDeactivated: boolean
    objectName?: string
    viewCount: number | undefined
    viewId: number
}

type Props = OwnProps

export function ViewCount({
    isDeactivated,
    objectName = 'tickets',
    viewCount,
    viewId,
}: Props) {
    const title = useMemo(
        () =>
            viewCount && viewCount > 999
                ? `${viewCount.toString()} ${objectName}`
                : undefined,
        [objectName, viewCount]
    )

    if (isDeactivated) {
        return (
            <DeactivatedViewIcon
                id={`deactivated-view-${viewId}`}
                tooltipText="This view is deactivated"
            />
        )
    }

    if (viewCount === undefined) {
        return null
    }

    const isMoreThanMaxCount = viewCount >= MAX_TICKET_COUNT_PER_VIEW
    const compactCount = compactInteger(viewCount, 1)

    return (
        <span title={title}>
            {isMoreThanMaxCount
                ? `${compactInteger(MAX_TICKET_COUNT_PER_VIEW)}+`
                : compactCount}
        </span>
    )
}

export default React.memo(ViewCount)
