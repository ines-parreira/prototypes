import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import * as viewsConfig from '../../../../../config/views'
import {
    getActiveView,
    makeGetViewCount,
    isDirty,
} from '../../../../../state/views/selectors'
import {RootState} from '../../../../../state/types'

type OwnProps = {
    colSize: number
    selectedCount: number
    viewSelected: boolean
    onSelectViewClick: () => void
}

type Props = OwnProps & ConnectedProps<typeof connector>
export class ViewSelectionContainer extends Component<Props> {
    render() {
        const {
            activeView,
            colSize,
            getViewCount,
            selectedCount,
            onSelectViewClick,
            viewSelected,
            dirtyView,
        } = this.props

        const viewConfig = viewsConfig.getConfigByType(activeView.get('type'))
        const currentViewCount = getViewCount(activeView.get('id'))

        return (
            <tr>
                <td className="view-selection" colSpan={colSize}>
                    {viewSelected ? (
                        <span>
                            All the{' '}
                            <b>
                                {dirtyView || !currentViewCount
                                    ? ''
                                    : `${currentViewCount} `}
                            </b>
                            {viewConfig.get('plural')}
                            {dirtyView ? ' of this custom' : ' of '}
                            <b>
                                {dirtyView
                                    ? ''
                                    : `"${activeView.get('name') as string}"`}
                            </b>{' '}
                            view are selected.
                            <span
                                className="clickable"
                                onClick={onSelectViewClick}
                            >
                                {' '}
                                Select all {viewConfig.get('plural')} of the
                                current page instead
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
                            <span
                                className="clickable"
                                onClick={onSelectViewClick}
                            >
                                {' '}
                                Select all{' '}
                                <b>
                                    {dirtyView || !currentViewCount
                                        ? ''
                                        : `${currentViewCount} `}
                                </b>
                                {viewConfig.get('plural')}
                            </span>{' '}
                            {dirtyView ? 'from the current' : 'of the '}
                            <b>
                                {dirtyView
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
}

const connector = connect((state: RootState) => {
    return {
        activeView: getActiveView(state),
        getViewCount: makeGetViewCount(state),
        dirtyView: isDirty(state),
    }
})

export default connector(ViewSelectionContainer)
