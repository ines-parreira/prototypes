// @flow
import React from 'react'
import {connect} from 'react-redux'
import DocumentTitle from 'react-document-title'
import {Link} from 'react-router'
import {Button} from 'reactstrap'
import decorateComponentWithProps from 'decorate-component-with-props'

import type {Map, List} from 'immutable'

import MacroContainer from '../common/macros/MacroContainer'
import {compactInteger} from '../../../utils'
import {isCreationUrl, isSearchUrl} from '../../common/utils/url'

import * as tagsActions from '../../../state/tags/actions.ts'

import * as ticketsSelectors from '../../../state/tickets/selectors'
import * as viewsSelectors from '../../../state/views/selectors'

import ViewTable from '../../common/components/ViewTable/ViewTable'

import type {reactRouterLocation, reactRouterRoute} from '../../../types'

import TicketListActions from './components/TicketListActions'

import css from './TicketListContainer.less'

type Props = {
    activeView: Map<*, *>,
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
    isUpdate: boolean,
    isMacroModalOpen: boolean,
    actionsComponent: ?Object,
}

class TicketListContainer extends React.Component<Props, State> {
    state = {
        isSearch: false,
        isUpdate: true,
        isMacroModalOpen: false,
        actionsComponent: null,
    }

    _setInitialState = (props) => {
        this.setState({
            isSearch: isSearchUrl(props.location.pathname, 'tickets'),
            isUpdate: !isCreationUrl(props.location.pathname, 'tickets'),
        })
    }

    componentWillMount() {
        this.props.fetchTags()
        this._setInitialState(this.props)
    }

    componentDidMount() {
        this.setState({
            actionsComponent: decorateComponentWithProps(TicketListActions, {
                openMacroModal: this._openMacroModal,
            }),
        })
    }

    componentWillReceiveProps(nextProps) {
        this._setInitialState(nextProps)
    }

    _openMacroModal = () => this.setState({isMacroModalOpen: true})
    _closeMacroModal = () => this.setState({isMacroModalOpen: false})

    render() {
        const {isSearch, isUpdate} = this.state
        const {tickets, urlViewId, activeView, hasActiveView} = this.props
        let title = 'Loading...'

        if (!isUpdate) {
            title = 'New view'
        } else if (hasActiveView) {
            title = activeView.get('name')
            if (activeView.get('count', 0) > 0) {
                title = `(${compactInteger(
                    activeView.get('count', 0)
                )}) ${title}`
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
                        ActionsComponent={this.state.actionsComponent}
                        viewButtons={
                            <div className="d-inline-flex align-items-center">
                                <Button
                                    tag={Link}
                                    color="success"
                                    to="/app/ticket/new"
                                >
                                    Create ticket
                                </Button>
                            </div>
                        }
                    />
                    {this.state.isMacroModalOpen && (
                        <MacroContainer
                            activeView={activeView}
                            disableExternalActions
                            selectedItemsIds={this.props.selectedItemsIds}
                            closeModal={this._closeMacroModal}
                            selectionMode
                        />
                    )}
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
