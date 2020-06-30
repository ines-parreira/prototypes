// @flow

import React from 'react'
import {Map} from 'immutable'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {UncontrolledTooltip} from 'reactstrap'

import {MAX_TICKET_COUNT_PER_VIEW} from '../../../../config/views'
import {compactInteger} from '../../../../utils'
import {makeGetViewCount} from '../../../../state/views/selectors'

import css from './ViewCount.less'

type Props = {
    view: Map<*, *>,
    getViewCount: (viewId: number) => number | null,
}

function ViewCount({view, getViewCount}: Props) {
    if (!!view.get('deactivated_datetime')) {
        const id = `deactivated-view-${view.get('id')}`

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

    return isMoreThanMaxCount
        ? `${compactInteger(MAX_TICKET_COUNT_PER_VIEW)}+`
        : compactCount
}

export default connect((state) => ({
    getViewCount: makeGetViewCount(state),
}))(ViewCount)
