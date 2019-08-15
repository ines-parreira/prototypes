// @flow
import React from 'react'
import type {List, Map} from 'immutable'

import MergeButton from './MergeButton'
import BulkDeleteButton from './BulkDeleteButton'
import css from './TableActions.less'

type Props = {
    selectedNum: number,
    tags: List<*>,
    meta: Map<*, *>,
    onMerge: () => any,
    onBulkDelete: () => any
}

const TableActions = (props: Props) => {
    const {selectedNum} = props
    return (
        <div className={css.actions}>
            <MergeButton
                key="merge-button"
                disabled={selectedNum < 2}
                {...props}
            />
            <BulkDeleteButton
                key="delete-button"
                disabled={!selectedNum}
                {...props}
            />
        </div>
    )
}

export default TableActions
