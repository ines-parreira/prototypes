import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import {Map} from 'immutable'
import classnames from 'classnames'

import EditableTitle from '../EditableTitle'
import Search from '../Search'
import {slugify} from '../../../../utils'
import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'
import * as viewsConfig from '../../../../config/views'
import shortcutManager from '../../../../services/shortcutManager'
import ViewName from '../ViewName/ViewName'
import Tooltip from '../Tooltip.js'
import {RootState} from '../../../../state/types'
import history from '../../../history'

import EmojiSelect from './EmojiSelect/EmojiSelect'
import css from './Header.less'

type OwnProps = {
    isSearch: boolean
    isUpdate: boolean
    type: string
    viewButtons?: React.ReactNode
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    askDeleteConfirmation: boolean
}

export class HeaderContainer extends React.Component<Props, State> {
    state = {
        askDeleteConfirmation: false,
    }

    componentDidMount() {
        shortcutManager.bind('Search', {
            LEAVE_SEARCH: {
                action: () => {
                    const {isSearch} = this.props
                    if (isSearch) {
                        history.push(this._goBackUrl())
                    }
                },
            },
        })
    }

    _goBackUrl = () => {
        const {config, lastViewId} = this.props

        let url = `/app/${config.get('routeList') as string}`

        if (lastViewId) {
            url += `/${lastViewId}`
        }

        return url
    }

    _search = (searchQuery: string) => {
        const {updateView, activeView} = this.props

        if (searchQuery !== activeView.get('search')) {
            updateView(
                activeView.merge({
                    search: searchQuery,
                }),
                false
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
        const {config, activeView, isSearch} = this.props

        if (!isSearch && !(activeView.get('search') as string)) {
            history.push(`/app/${config.get('routeList') as string}/search?q=`)
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
                                                update={(name: string) => {
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
                            placeholder={`Search ${
                                config.get('plural') as string
                            }...`}
                            searchDebounceTime={400}
                            location={`${
                                (activeView.get('id') as unknown) as string
                            }${isSearch ? '(s)' : ''}`}
                            forcedQuery={activeView.get('search') || ''}
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
                                    //$TsFixMe: remove ignore once Tooltip is properly migrated
                                    //@ts-ignore
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

const connector = connect(
    (state: RootState, ownProps: OwnProps) => ({
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
)

export default connector(HeaderContainer)
