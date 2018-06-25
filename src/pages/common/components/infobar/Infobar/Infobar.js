// @flow
import React from 'react'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {browserHistory, withRouter} from 'react-router'
import {fromJS, Map, List} from 'immutable'
import {Button} from 'reactstrap'
import _noop from 'lodash/noop'

import {areSourcesReady} from '../utils'

import * as infobarActions from '../../../../../state/infobar/actions'
import * as usersActions from '../../../../../state/users/actions'
import * as ticketActions from '../../../../../state/ticket/actions'

import * as segmentTracker from '../../../../../store/middlewares/segmentTracker'

import Loader from '../../Loader/index'
import Tooltip from '../../Tooltip'
import InfobarLayout from '../InfobarLayout'
import InfobarUserInfo from '../InfobarUserInfo'
import MergeUsersContainer from '../../mergeUsers/MergeUsersContainer'
import InfobarSearchResultsList from '../InfobarSearchResultsList'
import Search from '../../Search'

import css from '../Infobar.less'

import type {reactRouterLocation} from '../../../../../types'
import {startEditionMode, stopEditionMode, submitWidgets} from '../../../../../state/widgets/actions'
import InfobarWidgetsEditionTools from './InfobarWidgetsEditionTools'
import InfobarUserActions from './InfobarUserActions'

type Props = {
    actions: {
        widgets: {
            startEditionMode: typeof startEditionMode,
            stopEditionMode: typeof stopEditionMode,
            submitWidgets: typeof submitWidgets
        },
        infobar: {
            fetchPreviewUser: typeof infobarActions.fetchPreviewUser
        }
    },
    context: string,
    identifier: string,
    infobar: Object,
    isRouteEditingWidgets: boolean,
    sources: Map<*, *>,
    user: Map<*, *>,
    widgets: Map<*, *>,
    fetchUserHistory: typeof usersActions.fetchUserHistory,
    search: typeof infobarActions.search,
    searchSimilarUser: typeof infobarActions.similarUser,
    setCustomer: typeof ticketActions.setCustomer,

    // react-router
    location: reactRouterLocation,
}

type State = {
    isSearching: boolean,
    isFetchingUser: boolean,
    displaySearchResults: boolean,
    displaySelectedUser: boolean,
    showMergeUserModal: boolean,
    searchResults: List<*>,
    selectedUser: Map<*, *>,
    suggestedUser: Map<*, *>,
}

export class Infobar extends React.Component<Props, State> {
    static defaultProps = {
        user: fromJS({}),
    }

    state = {
        isSearching: false,
        isFetchingUser: false,
        displaySearchResults: false,
        displaySelectedUser: false,
        showMergeUserModal: false,
        searchResults: fromJS([]),
        selectedUser: fromJS({}),
        suggestedUser: fromJS({}),
    }

    // refs
    search = {
        _reset: _noop
    }

    componentWillMount() {
        this._updateSimilarUser(this.props)
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.identifier !== nextProps.identifier) {
            this._resetSearch()
        }

        const isEditingParam = nextProps.isRouteEditingWidgets
        const isEditing = nextProps.widgets.getIn(['_internal', 'isEditing'])

        if (isEditingParam && !isEditing) {
            nextProps.actions.widgets.startEditionMode(nextProps.context)
        } else if (!isEditingParam && isEditing) {
            nextProps.actions.widgets.stopEditionMode()
        }

        // if user changed then try to find a suggestion of other user to merge with it
        // $FlowFixMe
        if (!this.props.user.equals(nextProps.user)) {
            this._updateSimilarUser(nextProps)
        }
    }

    _updateSimilarUser = (props: Props) => {
        this.setState({suggestedUser: fromJS({})})

        if (props.user.isEmpty() || !props.user.get('id')) {
            return
        }

        this.props.searchSimilarUser(props.user.get('id')).then(({user: suggestion}) => {
            if (!suggestion) {
                return
            }

            suggestion = fromJS(suggestion)

            if (suggestion.isEmpty()) {
                return
            }

            this.setState({
                suggestedUser: suggestion,
            })
        })
    }

    _mode = (state : State = this.state) => {
        // the following succession of conditions is in a particular order
        // which is important for the good display of each of those
        // /!\ do not mix it without testing it carefully

        if (state.isSearching) {
            return 'loading'
        }

        if (state.isFetchingUser) {
            return 'loading'
        }

        if (state.displaySelectedUser) {
            return 'selected'
        }

        if (state.displaySearchResults) {
            return 'results'
        }

        return 'default'
    }

    _isEditing = () => {
        return this.props.widgets.getIn(['_internal', 'isEditing']) && this.props.isRouteEditingWidgets
    }

    _toggleEditionMode = (isEditing: boolean) => {
        const {identifier, context, location} = this.props

        if (!identifier) {
            return
        }

        if (isEditing) {
            browserHistory.push(`/app/${context}/${identifier}/edit-widgets${location.search}`)
        } else {
            browserHistory.push(`/app/${context}/${identifier}${location.search}`)
        }
    }

    _onSearch = (query: string) => {
        if (query) {
            this.setState({isSearching: true})
            this.props.search(query).then(({resp}) => {
                this.setState({
                    displaySelectedUser: false,
                    displaySearchResults: true,
                    isSearching: false,
                    searchResults: fromJS(resp.data.slice(0, 8)),
                })
            })
        } else {
            this._resetSearch()
        }
    }

    _fetchUserHistory = () => {
        if (this.props.user.isEmpty()) {
            return
        }

        const askedUserId = this.props.user.get('id')

        // wait 1.5s before fetching user history after merge (merge can take some time and is async)
        setTimeout(() => {
            this.props.fetchUserHistory(askedUserId, {
                successCondition: () => {
                    return this.props.user.get('id').toString() === askedUserId.toString()
                }
            })
        }, 1500)
    }

    _resetSearch = () => {
        this.setState({
            displaySearchResults: false,
            searchResults: fromJS([]),
        })
    }

    _resetSelected = () => {
        this.setState({
            displaySelectedUser: false,
            selectedUser: fromJS({}),
        })
    }

    // reset search and display current user
    _returnToCurrentUserProfile = () => {
        this._resetSearch()
        this._resetSelected()
        if (this.search) {
            this.search._reset()
        }
    }

    _setCustomer = () => {
        return this.props.setCustomer(this.state.selectedUser)
            .then(this._returnToCurrentUserProfile)
    }

    _renderUserInfo = (user: Map<*,*>) => {
        const isEditing = this._isEditing()

        const sources = this.props.sources
            .setIn(['ticket', 'customer'], user)
            .set('user', user)

        return (
            <InfobarUserInfo
                actions={this.props.actions.widgets}
                infobar={this.props.infobar}
                isEditing={isEditing}
                sources={sources}
                user={user}
                widgets={this.props.widgets}
            />
        )
    }

    _renderContent = () => {
        const {
            actions,
            sources,
            user
        } = this.props

        const mode = this._mode()

        if (mode === 'loading') {
            return <Loader/>
        }

        if (mode === 'selected') {
            return (
                <div>
                    <div className="mb-3">
                        <Button
                            type="button"
                            onClick={() => this._resetSelected()}
                        >
                            <i className="fa fa-fw fa-arrow-left mr-2"/>
                            Back
                        </Button>
                        <InfobarUserActions
                            user={user}
                            sources={sources}
                            selectedUser={this.state.selectedUser}
                            toggleMergeUserModal={(showMergeUserModal: boolean) => this.setState({showMergeUserModal})}
                            setCustomer={this._setCustomer}
                        />
                    </div>
                    {this._renderUserInfo(this.state.selectedUser)}
                    <MergeUsersContainer
                        isTicketContext={!sources.get('ticket', fromJS({})).isEmpty()}
                        display={this.state.showMergeUserModal}
                        destinationUser={user}
                        sourceUser={this.state.selectedUser}
                        onSuccess={() => {
                            this._fetchUserHistory()
                            this._returnToCurrentUserProfile()
                        }}
                        onClose={() => {
                            this.setState({showMergeUserModal: false})
                        }}
                    />
                </div>
            )
        }

        if (mode === 'results') {
            const defaultUserId = sources.getIn(['ticket', 'customer', 'id']) || sources.getIn(['user', 'id'])

            return (
                <div>
                    <div className="mb-3">
                        <Button
                            type="button"
                            onClick={() => this._resetSearch()}
                        >
                            <i className="material-icons md-2 mr-2">
                                arrow_back
                            </i>
                            Back
                        </Button>
                    </div>
                    <InfobarSearchResultsList
                        searchResults={this.state.searchResults}
                        defaultUserId={defaultUserId}
                        onUserClick={(user) => {
                            this.setState({isFetchingUser: true})
                            return actions.infobar.fetchPreviewUser(user.get('id')).then(({resp}) => {
                                this.setState({
                                    displaySelectedUser: true,
                                    isFetchingUser: false,
                                    selectedUser: fromJS(resp),
                                })
                            })
                        }}
                    />
                </div>
            )
        }

        if (!this.props.identifier) {
            return null
        }

        const displaySuggestedUser = !this.state.suggestedUser.isEmpty()
            && !this.props.widgets.getIn(['_internal', 'isEditing'])

        return (
            <div>
                {this._renderUserInfo(user)}
                {
                    displaySuggestedUser && (
                        <div className="d-none d-md-block">
                            <div className="infobar-section-separator"/>
                            <div className={classnames(css.suggestedUser)}>
                                <h4>Is this the same person?</h4>
                                <p>
                                    'We have found someone similar to the customer of this ticket. If it is the same
                                    person, merge them together to get a unified view of this user.
                                </p>
                                <div style={{marginBottom: '30px'}}>
                                    <Button
                                        className="mr-2"
                                        type="button"
                                        color="primary"
                                        onClick={() => {
                                            segmentTracker.logEvent(segmentTracker.EVENTS.USER_MERGE_CLICK, {
                                                location: 'suggested user in infobar',
                                            })
                                            this.setState({showMergeUserModal: true})
                                        }}
                                    >

                                        <i className="material-icons mr-1">call_merge</i>Merge
                                    </Button>
                                </div>
                                {this._renderUserInfo(this.state.suggestedUser)}
                                <MergeUsersContainer
                                    isTicketContext={!sources.get('ticket', fromJS({})).isEmpty()}
                                    display={this.state.showMergeUserModal}
                                    destinationUser={user}
                                    sourceUser={this.state.suggestedUser}
                                    onSuccess={this._fetchUserHistory}
                                    onClose={() => {
                                        this.setState({showMergeUserModal: false})
                                    }}
                                />
                            </div>
                        </div>
                    )
                }
            </div>
        )
    }

    render() {
        const {
            widgets,
            sources,
        } = this.props

        const isEditing = this._isEditing()
        const hasFetchedWidgets = widgets.getIn(['_internal', 'hasFetchedWidgets'])

        const context = widgets.get('currentContext', '')

        const canEditWidgets = hasFetchedWidgets
            && areSourcesReady(sources, context)
            && !this.state.displaySelectedUser

        return (
            <InfobarLayout className={classnames({
                [css.editing]: isEditing
            })}>
                <div className="infobar-content">
                    <div className="infobar-search-wrapper d-flex align-items-center justify-content-between">
                        <Search
                            tabIndex="10"
                            placeholder="Search for users by email, order number, etc."
                            bindKey
                            onChange={this._onSearch}
                            style={{maxWidth: 'none'}}
                            searchDebounceTime={200}
                            ref={(search) => {
                                this.search = search
                            }}
                        />

                        <Button
                            className={classnames(css.toggleWidgets, 'd-none d-md-inline-block ml-2 btn-transparent')}
                            type="button"
                            id="toggle-widgets-edition-button"
                            color="secondary"
                            active={isEditing}
                            disabled={!canEditWidgets}
                            onClick={() => {
                                this._toggleEditionMode(!isEditing)
                            }}
                        >
                            <i className="material-icons md-2">
                                settings
                            </i>
                        </Button>
                        <Tooltip
                            placement="left"
                            target="toggle-widgets-edition-button"
                        >
                            {isEditing ? 'Leave widgets edition' : 'Edit widgets'}
                        </Tooltip>
                    </div>
                    <div className={css.content}>
                        {this._renderContent()}
                    </div>
                </div>
                {isEditing && (
                    <InfobarWidgetsEditionTools
                        actions={this.props.actions.widgets}
                        widgets={widgets}
                        context={context}
                    />
                )}
            </InfobarLayout>
        )
    }
}

export default withRouter(connect(null, {
    fetchUserHistory: usersActions.fetchUserHistory,
    search: infobarActions.search,
    searchSimilarUser: infobarActions.similarUser,
    setCustomer: ticketActions.setCustomer,
})(Infobar))
