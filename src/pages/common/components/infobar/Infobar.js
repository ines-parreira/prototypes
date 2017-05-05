import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import {fromJS} from 'immutable'
import {Button, UncontrolledTooltip} from 'reactstrap'
import {areSourcesReady, isCustomerDataValid, isCustomerDataPresent} from './utils'

import * as infobarActions from '../../../../state/infobar/actions'

import {logEvent} from '../../../../store/middlewares/amplitudeTracker'

import {Loader} from '../Loader'
import InfobarLayout from './InfobarLayout'
import InfobarUserInfo from './InfobarUserInfo'
import MergeUsersContainer from './../mergeUsers/MergeUsersContainer'
import InfobarSearchResultsList from './InfobarSearchResultsList'
import Search from '../Search'

import css from './Infobar.less'

@connect(null, {
    search: infobarActions.search,
    searchSimilarUser: infobarActions.similarUser,
})
export default class Infobar extends React.Component {
    static propTypes = {
        identifier: PropTypes.string.isRequired,
        actions: PropTypes.object.isRequired,
        infobar: PropTypes.object.isRequired,
        isRouteEditingWidgets: PropTypes.bool.isRequired,
        user: PropTypes.object.isRequired,
        widgets: PropTypes.object.isRequired,
        sources: PropTypes.object.isRequired,
        context: PropTypes.string.isRequired,
        search: PropTypes.func.isRequired,
        searchSimilarUser: PropTypes.func.isRequired,
    }

    static defaultProps = {
        user: fromJS({})
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
            this.setState({suggestedUser: fromJS({})})

            if (nextProps.user.isEmpty()) {
                return
            }

            const customer = nextProps.user.get('customer') || fromJS({})

            if (!isCustomerDataValid(customer)) {
                return
            }

            this.props.searchSimilarUser(nextProps.user.get('id')).then(({user: suggestion}) => {
                if (!suggestion) {
                    return
                }

                suggestion = fromJS(suggestion)

                if (suggestion.isEmpty()) {
                    return
                }

                const customer = suggestion.get('customer') || fromJS({})

                if (isCustomerDataPresent(customer)) {
                    this.setState({
                        suggestedUser: suggestion,
                    })
                }
            })
        }
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
        const {identifier, context} = this.props

        if (!identifier) {
            return
        }

        if (isEditing) {
            browserHistory.push(`/app/${context}/${identifier}/edit-widgets`)
        } else {
            browserHistory.push(`/app/${context}/${identifier}`)
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

    _onSearch = (query) => {
        if (query) {
            this.setState({isSearching: true})
            this.props.search(query, 'infobar-user').then(({resp}) => {
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

    _resetSearch = () => {
        this.setState({
            displaySearchResults: false,
            searchResults: fromJS([]),
        })
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
                            onClick={() => {
                                this.setState({
                                    displaySelectedUser: false,
                                    selectedUser: fromJS({}),
                                })
                            }}
                        >
                            <i className="fa fa-fw fa-arrow-left mr-2" />
                            Back
                        </Button>
                        {
                            hasDestinationUser
                            && this.state.selectedUser.get('id') !== this.props.user.get('id')
                            && (
                                <Button
                                    className="pull-right"
                                    onClick={() => {
                                        this.setState({showMergeUserModal: true})
                                        logEvent('Clicked "Merge" button on user searched in infobar')
                                    }}
                                >
                                    Merge
                                </Button>
                            )
                        }
                    </div>
                    {this._renderUserInfo(this.state.selectedUser)}
                    <MergeUsersContainer
                        display={this.state.showMergeUserModal}
                        destinationUser={this.props.user}
                        sourceUser={this.state.selectedUser}
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
                        <Button onClick={() => this._resetSearch()}>
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
            && !this.state.suggestedUser.get('customer', fromJS({})).isEmpty()

        return (
            <div>
                {this._renderUserInfo(this.props.user)}
                {
                    displaySuggestedUser && (
                        <div>
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
                                            logEvent('Clicked "Merge" button on suggested user in infobar')
                                            this.setState({showMergeUserModal: true})
                                        }}
                                    >
                                        Merge
                                    </Button>
                                </div>
                                {this._renderUserInfo(this.state.suggestedUser)}
                                <MergeUsersContainer
                                    display={this.state.showMergeUserModal}
                                    destinationUser={this.props.user}
                                    sourceUser={this.state.suggestedUser}
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
            <InfobarLayout>
                <div className="infobar-content">
                    <div className="infobar-search-wrapper d-flex align-items-center justify-content-between">
                        <Search
                            className="mr-2"
                            placeholder="Search users by email, name or phone number..."
                            bindKey
                            onChange={this._onSearch}
                            style={{maxWidth: 'none'}}
                        />

                        <Button
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
