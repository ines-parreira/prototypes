import React, {PropTypes} from 'react'
import {browserHistory} from 'react-router'
import classnames from 'classnames'
import InfobarLayout from './InfobarLayout'
import InfobarUserInfo from './InfobarUserInfo'
import {fromJS} from 'immutable'
import {Loader} from '../Loader'
import {areSourcesReady} from './utils'

import InfobarSearchResultsList from './InfobarSearchResultsList'
import Search from '../Search'

export default class Infobar extends React.Component {
    componentWillReceiveProps(nextProps) {
        if (this.props.identifier !== nextProps.identifier) {
            nextProps.actions.infobar.resetSearch()
        }

        const isEditingParam = !!nextProps.isRouteEditingWidgets
        const isEditing = nextProps.widgets.getIn(['_internal', 'isEditing'])

        if (isEditingParam !== isEditing) {
            this._toggleEditionMode(isEditingParam)
        }
    }

    componentWillUnmount() {
        this.props.actions.infobar.resetSearch()
    }

    /**
     * Populate infobar state from search results
     */
    _search = (query, params, stringQuery) => {
        if (stringQuery) {
            this.props.actions.infobar.search(query, 'user', ['id', 'name', 'email', 'channels'])
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
        const {actions, identifier, context} = this.props

        if (isEditing) {
            actions.widgets.startEditionMode(context)
            browserHistory.push(`/app/${context}/${identifier}/edit-widgets`)
        } else {
            actions.widgets.stopEditionMode()
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
        const customer = user.get('customer', fromJS({}))
        const hasCustomer = customer && !customer.isEmpty()
        const shouldForceSearch = !hasCustomer
            && user.get('name', '')
            && mode === 'default'
        const forcedQuery = shouldForceSearch ? user.get('name', '') : null

        const canEditWidgets = !isLoading
            && hasFetchedWidgets
            && areSourcesReady(sources)
            && mode === 'default'
            && !forcedQuery

        if (isLoading) {
            // loading
            content = <Loader />
        } else if (mode === 'default') {
            // current user info
            content = (
                !hasFetchedWidgets ? (
                    <Loader />
                ) : (
                    <InfobarUserInfo
                        actions={actions.widgets}
                        fetchUserPicture={actions.infobar.fetchUserPicture}
                        infobar={infobar}
                        isEditing={isEditing}
                        sources={sources}
                        user={user}
                        widgets={widgets}
                    />
                )
            )
        } else if (mode === 'search') {
            // list of found users
            content = (
                <InfobarSearchResultsList
                    searchResults={infobar.get('searchResults')}
                    fetchPreviewUser={actions.infobar.fetchPreviewUser}
                />
            )
        } else if (mode === 'preview') {
            // selected user info
            const tweakedUser = infobar.get('displayedUser')

            const tweakedSources = sources
                .setIn(['ticket', 'requester'], tweakedUser)
                .set('user', tweakedUser)

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

                        {/*
                         <div
                         className="ui button right-button disabled"
                         style={{float: 'right'}}
                         >
                         MERGE
                         </div>
                         */}
                    </div>
                    <InfobarUserInfo
                        actions={actions.widgets}
                        fetchUserPicture={actions.infobar.fetchUserPicture}
                        infobar={infobar}
                        isEditing={isEditing}
                        sources={tweakedSources}
                        user={tweakedUser}
                        widgets={widgets}
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
                            placeholder="Search users..."
                            bindKey
                            onChange={this._search}
                            forcedQuery={forcedQuery}
                            location={identifier}
                            queryPath="bool.should.0.multi_match.query"
                            disabled={isEditing}
                            query={{
                                bool: {
                                    should: [
                                        {
                                            multi_match: {
                                                query: '',
                                                type: 'phrase_prefix',
                                                fields: ['name', 'email']
                                            }
                                        }
                                    ]
                                }
                            }}
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
