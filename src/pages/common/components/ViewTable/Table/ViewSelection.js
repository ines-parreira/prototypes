import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

import * as viewsConfig from '../../../../../config/views'
import {
    getActiveView,
    makeGetViewCount,
    isDirty,
} from '../../../../../state/views/selectors'

class ViewSelection extends React.Component {
    static propTypes = {
        colSize: PropTypes.number.isRequired,
        selectedCount: PropTypes.number.isRequired,
        viewSelected: PropTypes.bool.isRequired,
        onSelectViewClick: PropTypes.func.isRequired,

        activeView: PropTypes.object.isRequired,
        getViewCount: PropTypes.func.isRequired,
        dirtyView: PropTypes.bool.isRequired,
    }

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
                                    : currentViewCount + ' '}
                            </b>
                            {viewConfig.get('plural')}
                            {dirtyView ? ' of this custom' : ' of '}
                            <b>
                                {dirtyView
                                    ? ''
                                    : '"' + activeView.get('name') + '"'}
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
                                        : currentViewCount + ' '}
                                </b>
                                {viewConfig.get('plural')}
                            </span>{' '}
                            {dirtyView ? 'from the current' : 'of the '}
                            <b>
                                {dirtyView
                                    ? ''
                                    : '"' + activeView.get('name') + '"'}
                            </b>{' '}
                            view
                        </span>
                    )}
                </td>
            </tr>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        activeView: getActiveView(state),
        getViewCount: makeGetViewCount(state),
        dirtyView: isDirty(state),
    }
}

export default connect(mapStateToProps)(ViewSelection)
