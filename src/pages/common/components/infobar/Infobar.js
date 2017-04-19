import React, {PropTypes} from 'react'
import {browserHistory} from 'react-router'
import classnames from 'classnames'
import {fromJS} from 'immutable'

import InfobarLayout from './InfobarLayout'
import InfobarUserInfo from './InfobarUserInfo'
import MergeUsersContainer from './../mergeUsers/MergeUsersContainer'
import {Loader} from '../Loader'
import {areSourcesReady} from './utils'

import InfobarSearchResultsList from './InfobarSearchResultsList'
import Search from '../Search'

class Infobar extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            data: fromJS({
                shouldForceSearch: false,
                shouldResetSearch: false,
                isInitialized: false
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        let newState = this.state

        if (this.props.identifier !== nextProps.identifier) {
            nextProps.actions.infobar.resetSearch()
            newState = {data: newState.data.set('isInitialized', false)}
        }

        const isEditingParam = !!nextProps.isRouteEditingWidgets
        const isEditing = nextProps.widgets.getIn(['_internal', 'isEditing'])

        if (isEditingParam && !isEditing) {
            nextProps.actions.widgets.startEditionMode(nextProps.context)
        } else if (!isEditingParam && isEditing) {
            nextProps.actions.widgets.stopEditionMode()
        }

        const wasMerging = this.props.infobar.getIn(['_internal', 'mergeUsersModal', 'display'])
        const isMerging = nextProps.infobar.getIn(['_internal', 'mergeUsersModal', 'display'])
        const modeIsDefault = nextProps.infobar.getIn(['_internal', 'mode']) === 'default'

        // e.g. if we just succeeded a merging
        newState = {data: newState.data.set('shouldResetSearch', wasMerging && !isMerging && modeIsDefault)}

        // todo(@jebarjonet): redo this component
        // Initialization (force search if there's no customer data, auto-open result if there's just one)
        // if (!this.state.data.get('isInitialized') && !nextProps.user.isEmpty()) {
        //     const customer = nextProps.user.get('customer', fromJS({}))
        //     const hasCustomer = isCustomerDataValid(customer)
        //
        //     const shouldForceSearch = !hasCustomer && nextProps.user.get('name', '')
        //
        //     const results = nextProps.infobar.get('searchResults')
        //
        //     if (shouldForceSearch) {
        //         newState = {data: newState.data.set('shouldForceSearch', true)}
        //     } else {
        //         newState = {data: newState.data.set('isInitialized', true)}
        //     }
        //
        //     if (results.size >= 1) {
        //         if (results.size === 1) {
        //             nextProps.actions.infobar.setInfobarMode('default')
        //             newState = {
        //                 data: newState.data.merge({
        //                     shouldForceSearch: false,
        //                     shouldResetSearch: true
        //                 })
        //             }
        //         }
        //
        //         newState = {data: newState.data.set('isInitialized', true)}
        //     }
        // }

        this.setState(newState)
    }

    componentWillUnmount() {
        this.props.actions.infobar.resetSearch()
    }

    /**
     * Populate infobar state from search results
     */
    _search = (query) => {
        if (query) {
            this.props.actions.infobar.search(query, 'infobar-user')
        } else {
            this.props.actions.infobar.resetSearch()
        }
    }

    /**
     * Save edited widgets to database
     */
    _saveWidgets = () => {
        const {actions, widgets} = this.props

        const editedItems = widgets.getIn(['_internal', 'editedItems'], fromJS([])).toJS()

        actions.widgets.submitWidgets(editedItems)
    }

    /**
     * Cancel widgets edition modifications
     */
    _cancelWidgetsUpdates = () => {
        const {actions, context} = this.props
        actions.widgets.startEditionMode(context)
    }

    /**
     * Set the edition mode to passed one
     */
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

    /**
     * Render edition options such as save or cancel
     */
    _renderWidgetsEditionTools = () => {
        const {widgets} = this.props

        const isDirty = widgets.getIn(['_internal', 'isDirty'])
        const isSavingWidgets = widgets.getIn(['_internal', 'loading', 'saving'])

        return (
            <div className="infobar-footer">
                <div>
                    <button
                        className={classnames('ui green small button', {
                            loading: isSavingWidgets
                        })}
                        disabled={isSavingWidgets || !isDirty}
                        onClick={this._saveWidgets}
                    >
                        Save changes
                    </button>
                    <button
                        className="ui small button"
                        disabled={isSavingWidgets || !isDirty}
                        onClick={this._cancelWidgetsUpdates}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )
    }

    render() {
        const {
            actions,
            user,
            widgets,
            infobar,
            identifier,
            sources
        } = this.props

        let content = <Loader />

        const mode = infobar.getIn(['_internal', 'mode'], 'default')

        const isLoading = infobar
            .getIn(['_internal', 'loading'], fromJS({}))
            .some((loading, key) => {
                // only match loading.search or loading.displayedUser
                return ['search', 'displayedUser'].includes(key) ? loading : false
            })

        const isEditing = widgets.getIn(['_internal', 'isEditing']) && this.props.isRouteEditingWidgets
        const hasFetchedWidgets = widgets.getIn(['_internal', 'hasFetchedWidgets'])

        // if there is no complete user to display, search the user name
        const shouldForceSearch = this.state.data.get('shouldForceSearch') && !this.state.data.get('isInitialized')
        const forcedQuery = shouldForceSearch ? user.get('name', '') : null

        const context = widgets.get('currentContext', '')

        const canEditWidgets = !isLoading
            && hasFetchedWidgets
            && areSourcesReady(sources, context)
            && mode === 'default'
            && !forcedQuery

        const defaultUserId = sources.getIn(['ticket', 'requester', 'id'], null) || sources.getIn(['user', 'id'], null)

        if (isLoading) {
            // loading
            content = <Loader />
        } else if (mode === 'default') {
            // current user info
            content = (
                !hasFetchedWidgets
                    ? <Loader />
                    : <InfobarUserInfo
                        actions={actions.widgets}
                        fetchUserPicture={actions.infobar.fetchUserPicture}
                        infobar={infobar}
                        isEditing={isEditing}
                        sources={sources}
                        user={user}
                        widgets={widgets}
                    />
            )
        } else if (mode === 'search') {
            // list of found users
            content = (
                <div>
                    <div className="preview-buttons-wrapper">
                        <div
                            className="ui button left-button"
                            onClick={() => actions.infobar.resetSearch()}
                        >
                            <i className="ui arrow left icon" />
                            BACK
                        </div>
                    </div>
                    <InfobarSearchResultsList
                        searchResults={infobar.get('searchResults')}
                        defaultUserId={defaultUserId}
                        fetchPreviewUser={actions.infobar.fetchPreviewUser}
                    />
                </div>
            )
        } else if (mode === 'preview') {
            // selected user info
            const tweakedUser = infobar.get('displayedUser')
            const isDefaultUser = tweakedUser.get('id') === defaultUserId

            const mergeClassName = classnames('ui button right-button', {
                disabled: isDefaultUser
            })

            const tweakedSources = sources
                .setIn(['ticket', 'requester'], tweakedUser)
                .set('user', tweakedUser)

            const hasDestinationUser = !user.isEmpty()

            content = (
                <div>
                    <div className="preview-buttons-wrapper">
                        <div
                            className="ui button left-button"
                            onClick={() => actions.infobar.setInfobarMode('search')}
                        >
                            <i className="ui arrow left icon" />
                            BACK
                        </div>
                        {
                            hasDestinationUser
                            && (
                                <div
                                    className={mergeClassName}
                                    onClick={() => actions.infobar.toggleMergeUsersModal()}
                                >
                                    MERGE
                                </div>
                            )
                        }
                    </div>
                    <InfobarUserInfo
                        actions={actions.widgets}
                        fetchUserPicture={actions.infobar.fetchUserPicture}
                        infobar={infobar}
                        isEditing={isEditing}
                        sources={tweakedSources}
                        user={tweakedUser}
                        widgets={widgets}
                        isDefaultUser={isDefaultUser}
                    />
                    <MergeUsersContainer
                        display={infobar.getIn(['_internal', 'mergeUsersModal', 'display'])}
                        destinationUser={user}
                        sourceUser={tweakedUser}
                    />
                </div>
            )
        } else if (!identifier) {
            // if new ticket for example
            content = null
        }

        return (
            <InfobarLayout>
                <div className="infobar-content">
                    <div className="infobar-search-wrapper">
                        <Search
                            placeholder="Search users by email, name or phone number..."
                            bindKey
                            shouldResetInput={this.state.data.get('shouldResetSearch')}
                            onChange={this._search}
                            forcedQuery={forcedQuery}
                            location={identifier}
                            disabled={isEditing}
                            style={{maxWidth: 'none'}}
                        />

                        <button
                            className={classnames('ui icon button icon-edit-mode', {
                                active: isEditing,
                                disabled: !canEditWidgets
                            })}
                            onClick={() => {
                                if (canEditWidgets) {
                                    this._toggleEditionMode(!isEditing)
                                }
                            }}
                            title="Manage widgets"
                        >
                            <i className="setting icon" />
                        </button>
                    </div>
                    <div className="infobar-box">
                        {content}
                    </div>
                </div>
                {
                    isEditing && this._renderWidgetsEditionTools()
                }
            </InfobarLayout>
        )
    }
}

Infobar.propTypes = {
    identifier: PropTypes.string.isRequired,
    actions: PropTypes.object.isRequired,
    infobar: PropTypes.object.isRequired,
    isRouteEditingWidgets: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    sources: PropTypes.object.isRequired,
    context: PropTypes.string.isRequired,
}

Infobar.defaultProps = {
    user: fromJS({})
}

export default Infobar
