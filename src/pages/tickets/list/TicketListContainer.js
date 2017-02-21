import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import DocumentTitle from 'react-document-title'
import MacroContainer from '../common/macros/MacroContainer'
import {compactInteger} from '../../../utils'
import {isCreationUrl} from '../../common/utils/url'

import * as tagsActions from '../../../state/tags/actions'
import * as viewsActions from '../../../state/views/actions'

import * as ticketsSelectors from '../../../state/tickets/selectors'
import * as viewsSelectors from '../../../state/views/selectors'

import TicketListActions from './components/TicketListActions'
import ViewTable from '../../common/components/ViewTable/Page'

class TicketListContainer extends React.Component {
    state = {
        isUpdate: true
    }

    componentWillMount() {
        this.props.fetchTags()
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isUpdate: !isCreationUrl(nextProps.location.pathname, 'tickets')
        })
    }

    render() {
        const {isUpdate} = this.state
        const {tickets, urlViewId, activeView, hasActiveView} = this.props
        let title = 'Loading...'

        if (!isUpdate) {
            title = 'New view'
        } else if (hasActiveView) {
            title = activeView.get('name')
            if (activeView.get('count', 0) > 0) {
                title = `(${compactInteger(activeView.get('count', 0))}) ${title}`
            }
        } else {
            title = 'Wrong view'
        }

        return (
            <DocumentTitle title={title}>
                <div style={{height: '100%'}}>
                    <ViewTable
                        key="table"
                        type="ticket"
                        items={tickets}
                        view={activeView}
                        isUpdate={isUpdate}
                        urlViewId={urlViewId}
                        ActionsComponent={TicketListActions}
                    />
                    <MacroContainer
                        key="macros"
                        activeView={activeView}
                        disableExternalActions
                        selectionMode
                        selectedItemsIds={this.props.selectedItemsIds}
                    />
                </div>
            </DocumentTitle>
        )
    }
}

TicketListContainer.propTypes = {
    activeView: ImmutablePropTypes.map.isRequired,
    hasActiveView: PropTypes.bool.isRequired,
    fetchTags: PropTypes.func.isRequired,
    location: PropTypes.object,
    params: PropTypes.object,
    selectedItemsIds: ImmutablePropTypes.list.isRequired,
    tickets: PropTypes.object.isRequired,
    urlViewId: PropTypes.string,
    views: PropTypes.object.isRequired,
}

function mapStateToProps(state, ownProps) {
    const urlViewId = ownProps.params.viewId

    return {
        activeView: viewsSelectors.getActiveView(state),
        getViewIdToDisplay: viewsSelectors.makeGetViewIdToDisplay(state),
        hasActiveView: viewsSelectors.hasActiveView(state),
        selectedItemsIds: viewsSelectors.getSelectedItemsIds(state),
        tickets: ticketsSelectors.getTickets(state),
        urlViewId,
        views: state.views,
    }
}

const mapDispatchToProps = {
    fetchTags: tagsActions.fetchTags,
    fetchPage: viewsActions.fetchPage,
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketListContainer)
