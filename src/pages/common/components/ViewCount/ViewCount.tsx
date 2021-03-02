import React from 'react'
import {Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {UncontrolledTooltip} from 'reactstrap'

import {MAX_TICKET_COUNT_PER_VIEW} from '../../../../config/views'
import {compactInteger} from '../../../../utils'
import {makeGetViewCount} from '../../../../state/views/selectors'
import {RootState} from '../../../../state/types'

import css from './ViewCount.less'

type OwnProps = {
    view: Map<any, any>
}

type Props = OwnProps & ConnectedProps<typeof connector>

export function ViewCountContainer({view, getViewCount}: Props) {
    if (!!view.get('deactivated_datetime')) {
        const id = `deactivated-view-${view.get('id') as number}`

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

    const viewCount = getViewCount(view.get('id'))
    if (viewCount === null) {
        return null
    }

    const isMoreThanMaxCount = viewCount >= MAX_TICKET_COUNT_PER_VIEW
    const compactCount = compactInteger(viewCount, 1)

    return (
        <>
            {isMoreThanMaxCount
                ? `${compactInteger(MAX_TICKET_COUNT_PER_VIEW)}+`
                : compactCount}
        </>
    )
}

const connector = connect((state: RootState) => ({
    getViewCount: makeGetViewCount(state),
}))

export default connector(ViewCountContainer)
