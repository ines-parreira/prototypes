// @flow
import React, {type Node} from 'react'
import {connect} from 'react-redux'
import {browserHistory, Link, withRouter} from 'react-router'
import {fromJS, Map} from 'immutable'
import _get from 'lodash/get'
import classnames from 'classnames'

import EditableTitle from '../EditableTitle'
import Search from '../Search'
import {slugify} from '../../../../utils'
import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'
import * as viewsConfig from '../../../../config/views'
import shortcutManager from '../../../../services/shortcutManager'
import ViewName from '../ViewName'
import Tooltip from '../Tooltip'

import EmojiSelect from './EmojiSelect'
import css from './Header.less'

type Props = {
    activeView: Map<*, *>,
    config: Map<*, *>,
    deleteView: (Map<*, *>) => Promise<void>,
    isSearch: boolean,
    isUpdate: boolean,
    item: Map<*, *>,
    lastViewId: number,
    type: string,
    updateView: (Map<*, *>) => void,
    setViewEditMode: (Map<*, *>) => void,
    viewButtons: Node,
}

type State = {
    askDeleteConfirmation: boolean,
}

class Header extends React.Component<Props, State> {
    static defaultProps = {
        item: fromJS({}),
    }

    state = {
        askDeleteConfirmation: false,
    }

    componentDidMount() {
        shortcutManager.bind('Search', {
            LEAVE_SEARCH: {
                action: () => {
                    const {isSearch} = this.props
                    if (isSearch) {
                        browserHistory.push(this._goBackUrl())
                    }
                },
            },
        })
    }

    _goBackUrl = () => {
        const {config, lastViewId} = this.props

        let url = `/app/${config.get('routeList')}`

        if (lastViewId) {
            url += `/${lastViewId}`
        }

        return url
    }

    _searchQuery = (): string => {
        return _get(this.props, 'location.query.q', '')
    }

    _search = (searchQuery: string) => {
        const {config} = this.props

        // only if searchquery changed.
        // Search triggers a change event on mount, because of forcedQuery,
        // removing other querystrings from the url (eg. &page=1).
        if (this._searchQuery() !== searchQuery) {
            // add search to view and ask page of view (will return search result)
            browserHistory.push(
                `/app/${config.get('routeList')}/search?q=${encodeURIComponent(
                    searchQuery
                )}`
            )
        }
    }

    _updateViewName = (name: string) => {
        this.props.updateView(
            this.props.activeView.merge({
                name,
                slug: slugify(name),
            })
        )
    }

    _toggleDeleteConfirmation = () => {
        this.setState({
            askDeleteConfirmation: !this.state.askDeleteConfirmation,
        })
    }

    _selectEmoji = (emoji: string) => {
        const {updateView, activeView} = this.props
        updateView(
            activeView.mergeDeep({
                decoration: {emoji},
            })
        )
    }

    _clearEmoji = () => {
        const {updateView, activeView} = this.props
        if (Map.isMap(activeView.get('decoration'))) {
            updateView(activeView.deleteIn(['decoration', 'emoji']))
        }
    }

    handleFocus = () => {
        const {config} = this.props

        if (!this._searchQuery()) {
            browserHistory.push(`/app/${config.get('routeList')}/search?q=`)
        }
    }

    render() {
        const {activeView, config, isSearch, isUpdate, viewButtons} = this.props

        const isEditMode = activeView.get('editMode')
        const emoji = activeView.getIn(['decoration', 'emoji'])

        return (
            <div className={css.component}>
                <div className="d-flex flex-grow">
                    {!isSearch && (
                        <div
                            className={classnames(
                                'd-flex flex-grow mr-2',
                                css.titleWrapper
                            )}
                        >
                            {isEditMode ? (
                                (() => {
                                    const showEmojiPicker = !isSearch
                                    return (
                                        <div className={css.titleWrapper}>
                                            {showEmojiPicker && (
                                                <EmojiSelect
                                                    className={classnames(
                                                        css.emojiPicker
                                                    )}
                                                    emoji={
                                                        typeof emoji ===
                                                        'string'
                                                            ? emoji
                                                            : null
                                                    }
                                                    onEmojiSelect={
                                                        this._selectEmoji
                                                    }
                                                    onEmojiClear={
                                                        this._clearEmoji
                                                    }
                                                />
                                            )}
                                            <EditableTitle
                                                className={classnames(
                                                    css.title,
                                                    {
                                                        [css.withEmojiPicker]: showEmojiPicker,
                                                    }
                                                )}
                                                title={activeView.get(
                                                    'name',
                                                    ''
                                                )}
                                                placeholder="View name"
                                                disabled={isSearch}
                                                select={!isUpdate}
                                                update={(name) => {
                                                    if (
                                                        name !==
                                                        activeView.get('name')
                                                    ) {
                                                        this._updateViewName(
                                                            name
                                                        )
                                                    }
                                                }}
                                                forceEditMode
                                            />
                                        </div>
                                    )
                                })()
                            ) : (
                                <div
                                    id="settings-view-button"
                                    className={classnames(
                                        css.title,
                                        'mr-2 h-100 cursor-pointer'
                                    )}
                                    color="transparent"
                                    onClick={() =>
                                        this.props.setViewEditMode(activeView)
                                    }
                                >
                                    <ViewName view={activeView} />
                                    <i className="material-icons">
                                        keyboard_arrow_down
                                    </i>
                                </div>
                            )}
                        </div>
                    )}

                    <div
                        className={classnames('d-flex', {
                            'flex-grow': isSearch,
                        })}
                    >
                        <Search
                            bindKey
                            onChange={this._search}
                            placeholder={`Search ${config.get('plural')}...`}
                            searchDebounceTime={400}
                            location={`${(activeView.get('id'): any)}${
                                !!isSearch ? '(s)' : ''
                            }`}
                            forcedQuery={this._searchQuery()}
                            className={classnames(css.headerSearch, 'mr-2', {
                                [css.isSearching]: isSearch,
                                'flex-grow': isSearch,
                            })}
                            onFocus={this.handleFocus}
                        />

                        {isSearch ? (
                            <Link to={this._goBackUrl()}>
                                <i
                                    className={classnames(
                                        css.closeIcon,
                                        'material-icons d-none d-md-inline-block'
                                    )}
                                    id="leave-search-mode"
                                >
                                    close
                                </i>
                                <Tooltip
                                    placement="top"
                                    target="leave-search-mode"
                                >
                                    <b>Esc</b> Leave search mode
                                </Tooltip>
                            </Link>
                        ) : (
                            viewButtons
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(
    connect(
        (state, ownProps) => ({
            activeView: viewsSelectors.getActiveView(state),
            config: viewsConfig.getConfigByName(ownProps.type),
            lastViewId: viewsSelectors.getLastViewId(state),
        }),
        {
            deleteView: viewsActions.deleteView,
            removeFieldFilter: viewsActions.removeFieldFilter,
            updateView: viewsActions.updateView,
            setViewEditMode: viewsActions.setViewEditMode,
        }
    )(Header)
)
