import React, {useMemo} from 'react'
import classnames from 'classnames'
import {UncontrolledTooltip} from 'reactstrap'

import {MAX_TICKET_COUNT_PER_VIEW} from 'config/views'
import {compactInteger} from 'utils'

import css from './ViewCount.less'

type OwnProps = {
    viewId: number
    isDeactivated: boolean
    viewCount: number | undefined
}

type Props = OwnProps

export function ViewCount({viewId, isDeactivated, viewCount}: Props) {
    const title = useMemo(
        () =>
            viewCount && viewCount > 999
                ? `${viewCount.toString()} tickets`
                : undefined,
        [viewCount]
    )

    if (isDeactivated) {
        const id = `deactivated-view-${viewId}`

        return (
            <>
                <span id={id}>
                    <i
                        className={classnames(
                            'material-icons text-danger',
                            css.deactivated
                        )}
                    >
                        error
                    </i>
                </span>
                <UncontrolledTooltip placement="top" target={id}>
                    This view is deactivated.
                </UncontrolledTooltip>
            </>
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
