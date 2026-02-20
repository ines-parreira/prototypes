import { Component, createRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'

import { history } from '@repo/routing'
import { isMacOs } from '@repo/utils'
import classnames from 'classnames'
import { Map } from 'immutable'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import closeIcon from 'assets/img/icons/close.svg'
import { getConfigByName } from 'config/views'
import { EntityType, ViewCategory } from 'models/view/types'
import IconButton from 'pages/common/components/button/IconButton'
import EditableTitle from 'pages/common/components/EditableTitle/EditableTitle'
import Search from 'pages/common/components/Search'
import ViewName from 'pages/common/components/ViewName/ViewName'
import EmojiSelect from 'pages/common/components/ViewTable/EmojiSelect/EmojiSelect'
import css from 'pages/common/components/ViewTable/Header.less'
import type { RootState } from 'state/types'
import {
    fetchViewItems,
    removeFieldFilter,
    resetView,
    setViewEditMode,
    updateView,
} from 'state/views/actions'
import { getActiveView, getLastViewId } from 'state/views/selectors'
import { slugify } from 'utils'
import { systemViewIcons } from 'utils/views'

import { ViewTableHeaderToggle } from './ViewTableHeaderToggle'

type OwnProps = {
    isSearch: boolean
    isUpdate: boolean
    type: EntityType
    viewButtons?: ReactNode
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    askDeleteConfirmation: boolean
    searchTerm: string
}

export class HeaderContainer extends Component<Props, State> {
    editableTitleRef = createRef<HTMLInputElement>()

    state = {
        askDeleteConfirmation: false,
        searchTerm: this.props.activeView.get('search') || '',
    }

    componentDidUpdate(prevProps: Props) {
        const searchTerm = this.props.activeView.get('search')
        if (
            searchTerm !== prevProps.activeView.get('search') &&
            searchTerm !== this.state.searchTerm
        ) {
            this.setState({ searchTerm })
        }
    }

    _goBackUrl = () => {
        const { config, lastViewId } = this.props

        let url = `/app/${config.get('routeList') as string}`

        if (lastViewId) {
            url += `/${lastViewId}`
        }

        return url
    }

    handleKeyDown = (event: KeyboardEvent) => {
        const { updateView, activeView, isSearch } = this.props
        const { searchTerm } = this.state

        if (event.key !== 'Enter') {
            return
        }

        if (isSearch && searchTerm !== activeView.get('search')) {
            updateView(
                activeView.merge({
                    search: searchTerm,
                    order_by: undefined,
                    order_dir: undefined,
                }),
                false,
            )
        }
    }

    onSearchChange = (searchTerm: string) => {
        this.setState({ searchTerm })
    }

    _updateViewName = (name: string) => {
        this.props.updateView(
            this.props.activeView.merge({
                name,
                slug: slugify(name),
            }),
        )
    }

    _selectEmoji = (emoji: string) => {
        const { updateView, activeView } = this.props
        updateView(
            activeView.mergeDeep({
                decoration: { emoji },
            }),
        )
    }

    _clearEmoji = () => {
        const { updateView, activeView } = this.props
        if (Map.isMap(activeView.get('decoration'))) {
            updateView(activeView.deleteIn(['decoration', 'emoji']))
        }
    }

    cancelEdit = () => {
        const { isUpdate, resetView, fetchViewItems } = this.props

        if (isUpdate) {
            resetView()
            void fetchViewItems()
        } else {
            history.push(this._goBackUrl())
        }
    }

    render() {
        const { activeView, config, isUpdate, isSearch, viewButtons, type } =
            this.props

        const isEditMode = activeView.get('editMode')
        const emoji = activeView.getIn(['decoration', 'emoji'])
        const category = activeView.get('category') as ViewCategory | null
        const slug = activeView.get('slug') as keyof typeof systemViewIcons
        const shouldDisplaySystemIcon =
            category === ViewCategory.System && !!systemViewIcons[slug]
        const isEditable = ![EntityType.Customer].includes(type)

        return (
            <div className={css.component}>
                <div className="d-flex flex-grow">
                    {!isSearch && (
                        <div
                            className={classnames(
                                'flex-grow mr-2',
                                css.titleWrapper,
                            )}
                        >
                            <ViewTableHeaderToggle />
                            {isEditMode ? (
                                (() => {
                                    const showEmojiPicker = !isSearch
                                    return (
                                        <div className={css.titleWrapper}>
                                            <EditableTitle
                                                ref={this.editableTitleRef}
                                                inputClassName={classnames(
                                                    css.title,
                                                    {
                                                        [css.withMacOSEmojiPicker]:
                                                            showEmojiPicker &&
                                                            isMacOs,
                                                        [css.withWindowsEmojiPicker]:
                                                            showEmojiPicker &&
                                                            !isMacOs,
                                                    },
                                                )}
                                                title={activeView.get(
                                                    'name',
                                                    '',
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
                                                            name,
                                                        )
                                                    }
                                                }}
                                                isRequired
                                                forceEditMode
                                            />
                                            <Tooltip
                                                isOpen={
                                                    activeView.get(
                                                        'name',
                                                        '',
                                                    ) === ''
                                                }
                                                placement="bottom"
                                                target={this.editableTitleRef}
                                            >
                                                Please add a name to your view
                                                before saving it.
                                            </Tooltip>
                                            {showEmojiPicker && (
                                                <EmojiSelect
                                                    className={classnames(
                                                        css.emojiPicker,
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
                                            <img
                                                src={closeIcon}
                                                alt="close-icon"
                                                onClick={this.cancelEdit}
                                                className={css.closeEditIcon}
                                            />
                                        </div>
                                    )
                                })()
                            ) : (
                                <div className={css.title}>
                                    {shouldDisplaySystemIcon && (
                                        <i className="material-icons">
                                            {systemViewIcons[slug]}
                                        </i>
                                    )}
                                    <ViewName
                                        viewName={activeView.get('name')}
                                        emoji={activeView.getIn([
                                            'decoration',
                                            'emoji',
                                        ])}
                                    />
                                    {isEditable && (
                                        <IconButton
                                            className={css.editIcon}
                                            intent="secondary"
                                            fillStyle="ghost"
                                            onClick={() =>
                                                isEditable
                                                    ? this.props.setViewEditMode(
                                                          activeView,
                                                      )
                                                    : undefined
                                            }
                                            title="Edit view"
                                        >
                                            tune
                                        </IconButton>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {(!isEditMode || (isEditMode && isSearch)) && (
                        <div
                            className={classnames('d-flex', {
                                'flex-grow': isSearch,
                            })}
                        >
                            {isSearch && (
                                <Search
                                    autoFocus={isSearch}
                                    onKeyDown={this.handleKeyDown}
                                    placeholder={`Search ${
                                        config.get('plural') as string
                                    }...`}
                                    value={this.state.searchTerm}
                                    onChange={this.onSearchChange}
                                    className={classnames(
                                        css.headerSearch,
                                        'mr-2',
                                        {
                                            [css.isSearching]: isSearch,
                                            'flex-grow': isSearch,
                                        },
                                    )}
                                />
                            )}

                            {isSearch ? (
                                <Link to={this._goBackUrl()}>
                                    <i
                                        className={classnames(
                                            css.closeIcon,
                                            'material-icons d-none d-md-inline-block',
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
                    )}
                </div>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState, ownProps: OwnProps) => ({
        activeView: getActiveView(state),
        config: getConfigByName(ownProps.type),
        lastViewId: getLastViewId(state),
    }),
    {
        fetchViewItems,
        removeFieldFilter,
        resetView,
        setViewEditMode,
        updateView,
    },
)

export default connector(HeaderContainer)
