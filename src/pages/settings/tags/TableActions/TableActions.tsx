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

const TableActions = ({
    onBulkDelete,
    onMerge,
    meta,
    selectedNum,
    tags,
}: Props) => (
    <div className={css.actions}>
        <MergeButton
            key="merge-button"
            disabled={selectedNum < 2}
            onMerge={onMerge}
            meta={meta}
            tags={tags}
            selectedNum={selectedNum}
        />
        <BulkDeleteButton
            key="delete-button"
            disabled={!selectedNum}
            onBulkDelete={onBulkDelete}
        />
    </div>
)

export default TableActions
