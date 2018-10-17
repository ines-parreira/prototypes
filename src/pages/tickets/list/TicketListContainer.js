// @flow
import React from 'react'
import {connect} from 'react-redux'
import DocumentTitle from 'react-document-title'
import {Link} from 'react-router'
import {Button} from 'reactstrap'

import MacroContainer from '../common/macros/MacroContainer'
import {compactInteger} from '../../../utils'
import {isCreationUrl, isSearchUrl} from '../../common/utils/url'

import * as tagsActions from '../../../state/tags/actions'

import * as ticketsSelectors from '../../../state/tickets/selectors'
import * as viewsSelectors from '../../../state/views/selectors'

import TicketListActions from './components/TicketListActions'
import ViewTable from '../../common/components/ViewTable/ViewTable'

import type {Map, List} from 'immutable'
import type {reactRouterLocation, reactRouterRoute} from '../../../types'

import css from './TicketListContainer.less'

type Props = {
    activeView: Map<*,*>,
    hasActiveView: boolean,
    fetchTags: typeof tagsActions.fetchTags,
    selectedItemsIds: List<*>,
    views: {},
    tickets: {},

    route: reactRouterRoute,
    location: reactRouterLocation,
    params?: {},
    urlViewId?: string,
}

type State = {
    isSearch: boolean,
    isUpdate: boolean
}

class TicketListContainer extends React.Component<Props, State> {
    state = {
        isSearch: false,
        isUpdate: true,
    }

    componentWillMount() {
        this.props.fetchTags()
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            isSearch: isSearchUrl(nextProps.location.pathname, 'tickets'),
            isUpdate: !isCreationUrl(nextProps.location.pathname, 'tickets'),
        })
    }

    render() {
        const {isSearch, isUpdate} = this.state
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

        if (isSearch) {
            title = 'Search'
        }

        return (
            <DocumentTitle title={title}>
                <div
                    className="d-flex flex-column"
                    style={{
                        width: '100%',
                    }}
                >
                    <ViewTable
                        className={css.table}
                        type="ticket"
                        items={tickets}
                        isUpdate={isUpdate}
                        isSearch={isSearch}
                        urlViewId={urlViewId}
                        ActionsComponent={TicketListActions}
                        viewButtons={(
                            <div className="d-inline-flex align-items-center">
                                <Button
                                    tag={Link}
                                    color="success"
                                    to="/app/ticket/new"
                                >
                                    Create ticket
                                </Button>
                            </div>
                        )}
                    />
                    <MacroContainer
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

function mapStateToProps(state, ownProps) {
    const urlViewId = ownProps.params.viewId

    return {
        activeView: viewsSelectors.getActiveView(state),
        hasActiveView: viewsSelectors.hasActiveView(state),
        selectedItemsIds: viewsSelectors.getSelectedItemsIds(state),
        tickets: ticketsSelectors.getTickets(state),
        urlViewId,
        views: state.views,
    }
}

const mapDispatchToProps = {
    fetchTags: tagsActions.fetchTags,
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketListContainer)
