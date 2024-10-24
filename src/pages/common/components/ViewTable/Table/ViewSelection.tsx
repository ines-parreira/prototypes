import React from 'react'

import {getConfigByType} from 'config/views'
import useAppSelector from 'hooks/useAppSelector'
import css from 'pages/common/components/ViewTable/Table.less'
import {
    getActiveView,
    makeGetViewCount,
    isDirty as getIsDirty,
} from 'state/views/selectors'

type Props = {
    colSize: number
    selectedCount: number
    viewSelected: boolean
    onSelectViewClick: () => void
}

const ViewSelection = ({
    colSize,
    selectedCount,
    onSelectViewClick,
    viewSelected,
}: Props) => {
    const activeView = useAppSelector(getActiveView)
    const getViewCount = useAppSelector(makeGetViewCount)
    const currentViewCount = getViewCount(activeView.get('id'))
    const isViewDirty = useAppSelector(getIsDirty)
    const viewConfig = getConfigByType(activeView.get('type'))

    return (
        <tr>
            <td className={css.banner} colSpan={colSize}>
                {viewSelected ? (
                    <span>
                        All the{' '}
                        <b>
                            {isViewDirty || !currentViewCount
                                ? ''
                                : `${currentViewCount} `}
                        </b>
                        {viewConfig.get('plural')}
                        {isViewDirty ? ' of this custom' : ' of '}
                        <b>
                            {isViewDirty
                                ? ''
                                : `"${activeView.get('name') as string}"`}
                        </b>{' '}
                        view are selected.
                        <span className="clickable" onClick={onSelectViewClick}>
                            {' '}
                            Select all {viewConfig.get('plural')} of the current
                            page instead
                        </span>
                    </span>
                ) : (
                    <span>
                        <b>{selectedCount}</b>{' '}
                        {viewConfig.get(
                            selectedCount === 1 ? 'singular' : 'plural'
                        )}{' '}
                        on this page {selectedCount === 1 ? 'is' : 'are'}{' '}
                        selected.
                        <span className="clickable" onClick={onSelectViewClick}>
                            {' '}
                            Select all{' '}
                            <b>
                                {isViewDirty || !currentViewCount
                                    ? ''
                                    : `${currentViewCount} `}
                            </b>
                            {viewConfig.get('plural')}
                        </span>{' '}
                        {isViewDirty ? 'from the current' : 'of the '}
                        <b>
                            {isViewDirty
                                ? ''
                                : `"${activeView.get('name') as string}"`}
                        </b>{' '}
                        view
                    </span>
                )}
            </td>
        </tr>
    )
}

export default ViewSelection
