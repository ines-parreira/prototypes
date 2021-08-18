import React from 'react'
import {List, Map} from 'immutable'

import MergeButton from './MergeButton'
import BulkDeleteButton from './BulkDeleteButton'
import css from './TableActions.less'

type Props = {
    selectedNum: number
    tags: List<any>
    meta: Map<any, any>
    onMerge: () => void
    onBulkDelete: () => void
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
