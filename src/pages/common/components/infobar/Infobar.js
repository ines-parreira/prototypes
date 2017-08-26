import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {browserHistory, withRouter} from 'react-router'
import {fromJS} from 'immutable'
import {Button, UncontrolledTooltip} from 'reactstrap'

import {areSourcesReady} from './utils'
import {isCurrentlyOnTicket} from '../../../../utils'
import shortcutManager from '../../../../services/shortcutManager'

import * as infobarActions from '../../../../state/infobar/actions'
import * as usersActions from '../../../../state/users/actions'
import * as ticketActions from '../../../../state/ticket/actions'

import * as segmentTracker from '../../../../store/middlewares/segmentTracker'

import Loader from '../Loader'
import ConfirmButton from '../ConfirmButton'
import InfobarLayout from './InfobarLayout'
import InfobarUserInfo from './InfobarUserInfo'
import MergeUsersContainer from './../mergeUsers/MergeUsersContainer'
import InfobarSearchResultsList from './InfobarSearchResultsList'
import Search from '../Search'

import css from './Infobar.less'

@withRouter
@connect(null, {
    fetchUserHistory: usersActions.fetchUserHistory,
    search: infobarActions.search,
    searchSimilarUser: infobarActions.similarUser,
    setRequester: ticketActions.setRequester,
})
export default class Infobar extends React.Component {
    static propTypes = {
        actions: PropTypes.object.isRequired,
        context: PropTypes.string.isRequired,
        fetchUserHistory: PropTypes.func.isRequired,
        identifier: PropTypes.string.isRequired,
        infobar: PropTypes.object.isRequired,
        isRouteEditingWidgets: PropTypes.bool.isRequired,
        search: PropTypes.func.isRequired,
        searchSimilarUser: PropTypes.func.isRequired,
        sources: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired,
        widgets: PropTypes.object.isRequired,
        setRequester: PropTypes.func.isRequired,
        // react-router
        location: PropTypes.object.isRequired,
    }

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

    componentWillMount() {
        this._updateSimilarUser(this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.identifier !== nextProps.identifier) {
            this._resetSearch()
        }

        const isEditingParam = !!nextProps.isRouteEditingWidgets
        const isEditing = nextProps.widgets.getIn(['_internal', 'isEditing'])

        if (isEditingParam && !isEditing) {
            nextProps.actions.widgets.startEditionMode(nextProps.context)
        } else if (!isEditingParam && isEditing) {
            nextProps.actions.widgets.stopEditionMode()
        }

        // if user changed then try to find a suggestion of other user to merge with it
        if (!this.props.user.equals(nextProps.user)) {
            this._updateSimilarUser(nextProps)
        }
    }

    _updateSimilarUser = (props) => {
        this.setState({suggestedUser: fromJS({})})

        if (props.user.isEmpty()) {
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

    _mode = (state = this.state) => {
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

    _toggleEditionMode = (isEditing) => {
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

    _saveWidgets = () => {
        const {actions, widgets} = this.props
        const editedItems = widgets.getIn(['_internal', 'editedItems'], fromJS([])).toJS()
        actions.widgets.submitWidgets(editedItems)
    }

    _cancelWidgetsUpdates = () => {
        const {actions, context} = this.props
        actions.widgets.startEditionMode(context)
    }

    _renderWidgetsEditionTools = () => {
        const {widgets} = this.props

        const isDirty = widgets.getIn(['_internal', 'isDirty'])
        const isSavingWidgets = widgets.getIn(['_internal', 'loading', 'saving'])

        return (
            <div className="infobar-footer">
                <div>
                    <Button
                        type="button"
                        color="primary"
                        className={classnames('mr-2', {
                            'btn-loading': isSavingWidgets,
                        })}
                        disabled={isSavingWidgets || !isDirty}
                        onClick={this._saveWidgets}
                    >
                        Save changes
                    </Button>
                    <Button
                        type="button"
                        color="secondary"
                        className={classnames({
                            'btn-loading': isSavingWidgets,
                        })}
                        disabled={isSavingWidgets || !isDirty}
                        onClick={this._cancelWidgetsUpdates}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        )
    }

    _renderUserActions = () => {
        const ticketId = this.props.sources.getIn(['ticket', 'id'])
        const requester = this.props.sources.getIn(['ticket', 'requester', 'name'])
        const newRequester = this.state.selectedUser.get('name')

        return (
            <div className="pull-right hidden-sm-down">
                {
                    isCurrentlyOnTicket(ticketId) && ( // do not display on user profile
                        <ConfirmButton
                            className="mr-2"
                            placement="left"
                            title="Change ticket requester"
                            content={`Are you use you want to set ${newRequester} as the requester instead of ${requester}?`}
                            confirm={this._setRequester}
                        >
                            Set as requester
                        </ConfirmButton>
                    )
                }

                <Button
                    type="submit"
                    onClick={() => {
                        this.setState({showMergeUserModal: true})
                        segmentTracker.logEvent(segmentTracker.EVENTS.USER_MERGE_CLICK, {
                            location: 'user searched in infobar',
                        })
                    }}
                >
                    Merge
                </Button>
            </div>
        )
    }

    _onSearch = (query) => {
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

    _setRequester = () => {
        return this.props.setRequester(this.state.selectedUser)
            .then(this._returnToCurrentUserProfile)
    }

    _renderUserInfo = (user) => {
        const isEditing = this._isEditing()

        const sources = this.props.sources
            .setIn(['ticket', 'requester'], user)
            .set('user', user)

        return (
            <InfobarUserInfo
                actions={this.props.actions.widgets}
                fetchUserPicture={this.props.actions.infobar.fetchUserPicture}
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
        } = this.props

        const mode = this._mode()

        if (mode === 'loading') {
            return <Loader />
        }

        if (mode === 'selected') {
            const hasDestinationUser = !this.props.user.isEmpty()

            return (
                <div>
                    <div className="mb-3">
                        <Button
                            type="button"
                            onClick={() => this._resetSelected()}
                        >
                            <i className="fa fa-fw fa-arrow-left mr-2" />
                            Back
                        </Button>
                        {
                            hasDestinationUser
                            && this.state.selectedUser.get('id') !== this.props.user.get('id')
                            && this._renderUserActions()
                        }
                    </div>
                    {this._renderUserInfo(this.state.selectedUser)}
                    <MergeUsersContainer
                        isTicketContext={!sources.get('ticket', fromJS({})).isEmpty()}
                        display={this.state.showMergeUserModal}
                        destinationUser={this.props.user}
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
            const defaultUserId = sources.getIn(['ticket', 'requester', 'id']) || sources.getIn(['user', 'id'])

            return (
                <div>
                    <div className="mb-3">
                        <Button
                            type="button"
                            onClick={() => this._resetSearch()}
                        >
                            <i className="fa fa-fw fa-arrow-left mr-2" />
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
                {this._renderUserInfo(this.props.user)}
                {
                    displaySuggestedUser && (
                        <div className="hidden-sm-down">
                            <div className="infobar-section-separator" />
                            <div className={classnames(css['suggested-user'])}>
                                <h4>Is this the same user?</h4>
                                <p>
                                    We have found someone similar to the requester of this ticket. If it is the same
                                    person,
                                    merge them together to get a unified view of this user.
                                </p>
                                <div style={{marginBottom: '30px'}}>
                                    <Button
                                        className="mr-2"
                                        type="button"
                                        color="secondary"
                                        onClick={() => {
                                            segmentTracker.logEvent(segmentTracker.EVENTS.USER_MERGE_CLICK, {
                                                location: 'suggested user in infobar',
                                            })
                                            this.setState({showMergeUserModal: true})
                                        }}
                                    >
                                        Merge
                                    </Button>
                                </div>
                                {this._renderUserInfo(this.state.suggestedUser)}
                                <MergeUsersContainer
                                    isTicketContext={!sources.get('ticket', fromJS({})).isEmpty()}
                                    display={this.state.showMergeUserModal}
                                    destinationUser={this.props.user}
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

    _onSearchKeyDown = (e) => {
        if (e.key === 'Escape') {
            shortcutManager.triggerAction('TicketDetailContainer', 'BLUR_EVERYTHING')
        }
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
            <InfobarLayout>
                <div className="infobar-content">
                    <div className="infobar-search-wrapper d-flex align-items-center justify-content-between">
                        <Search
                            tabIndex="10"
                            placeholder="Search for users by email, order number, etc."
                            bindKey
                            onChange={this._onSearch}
                            onKeyDown={this._onSearchKeyDown}
                            style={{maxWidth: 'none'}}
                            ref={(search) => {
                                this.search = search
                            }}
                        />

                        <Button
                            className="hidden-sm-down ml-2"
                            type="button"
                            id="toggle-widgets-edition-button"
                            color="secondary"
                            active={isEditing}
                            disabled={!canEditWidgets}
                            onClick={() => {
                                this._toggleEditionMode(!isEditing)
                            }}
                        >
                            <i className="fa fa-fw fa-cog" />
                        </Button>
                        <UncontrolledTooltip
                            placement="left"
                            target="toggle-widgets-edition-button"
                        >
                            {isEditing ? 'Leave widgets edition' : 'Edit widgets'}
                        </UncontrolledTooltip>
                    </div>
                    <div className="infobar-box">
                        {this._renderContent()}
                    </div>
                </div>
                {isEditing && this._renderWidgetsEditionTools()}
            </InfobarLayout>
        )
    }
}
