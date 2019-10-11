import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'
import {Link, browserHistory, withRouter} from 'react-router'
import {fromJS} from 'immutable'
import _get from 'lodash/get'
import classnames from 'classnames'

import EditableTitle from '../EditableTitle'
import Search from '../Search'
import {slugify} from '../../../../utils'

import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'

import * as viewsConfig from '../../../../config/views'

import css from './Header.less'

@withRouter
@connect((state, ownProps) => {
    return {
        activeView: viewsSelectors.getActiveView(state),
        config: viewsConfig.getConfigByName(ownProps.type),
        lastViewId: viewsSelectors.getLastViewId(state),
    }
}, {
    deleteView: viewsActions.deleteView,
    removeFieldFilter: viewsActions.removeFieldFilter,
    toggleSelection: viewsActions.toggleSelection,
    updateView: viewsActions.updateView,
})
export default class Header extends React.Component {
    static propTypes = {
        activeView: ImmutablePropTypes.map.isRequired,
        config: ImmutablePropTypes.map.isRequired,
        deleteView: PropTypes.func.isRequired,
        isSearch: PropTypes.bool.isRequired,
        isUpdate: PropTypes.bool.isRequired,
        item: ImmutablePropTypes.map.isRequired,
        lastViewId: PropTypes.number,
        type: PropTypes.string.isRequired,
        updateView: PropTypes.func.isRequired,
        viewButtons: PropTypes.node,
    }

    static defaultProps = {
        item: fromJS({}),
    }

    state = {
        askDeleteConfirmation: false,
    }

    _goBackUrl = () => {
        const {config, lastViewId} = this.props

        let url = `/app/${config.get('routeList')}`

        if (lastViewId) {
            url += `/${lastViewId}`
        }

        return url
    }

    _searchQuery = () => {
        return _get(this.props, 'location.query.q', '')
    }

    _search = (searchQuery) => {
        const {config} = this.props

        if (searchQuery) {
            // only if searchquery changed.
            // Search triggers a change event on mount, because of forcedQuery,
            // removing other querystrings from the url (eg. &page=1).
            if (this._searchQuery() !== searchQuery) {
                // add search to view and ask page of view (will return search result)
                browserHistory.push(`/app/${config.get('routeList')}/search?q=${encodeURIComponent(searchQuery)}`)
            }
        } else {
            // set the previous view back
            browserHistory.push(this._goBackUrl())
        }
    }

    _updateViewName = (name) => {
        this.props.updateView(this.props.activeView.merge({
            name,
            slug: slugify(name),
        }))
    }

    _toggleDeleteConfirmation = () => {
        this.setState({askDeleteConfirmation: !this.state.askDeleteConfirmation})
    }

    render() {
        const {
            activeView,
            config,
            isSearch,
            isUpdate,
            viewButtons,
        } = this.props

        const isEditMode = activeView.get('editMode')

        return (
            <div className={css.component}>
                <div className="d-flex flex-grow">
                    <div className="d-flex flex-grow mr-2">
                        {
                            isSearch && (
                                <Link
                                    className="btn btn-secondary mr-2"
                                    to={this._goBackUrl()}
                                >
                                    <i className="material-icons mr-2">
                                        arrow_back
                                    </i>
                                    Back
                                </Link>
                            )
                        }

                        {(isEditMode || isSearch) ? (
                            <EditableTitle
                                className={classnames(css.title, 'flex-grow')}
                                title={activeView.get('name', '')}
                                placeholder="View name"
                                disabled={isSearch}
                                select={!isUpdate}
                                update={(name) => {
                                    if (name !== activeView.get('name')) {
                                        this._updateViewName(name)
                                    }
                                }}
                                forceEditMode
                            />
                        ) : (
                            <div
                                id="settings-view-button"
                                className={classnames(css.title, 'mr-2 h-100 cursor-pointer')}
                                color="transparent"
                                onClick={() => this.props.updateView(activeView)}
                            >
                                {activeView.get('name')}
                                <i className="material-icons">
                                    keyboard_arrow_down
                                </i>
                            </div>
                        )}
                    </div>

                    <div className="d-flex">
                        <Search
                            bindKey
                            onChange={this._search}
                            placeholder={`Search ${config.get('plural')}...`}
                            searchDebounceTime={400}
                            location={`${activeView.get('id')}${!!isSearch && '(s)'}`}
                            forcedQuery={this._searchQuery()}
                            className="mr-2"
                        />

                        {viewButtons}
                    </div>
                </div>
            </div>
        )
    }
}
