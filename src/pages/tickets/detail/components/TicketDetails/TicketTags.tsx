import React, {Component} from 'react'
import type {KeyboardEvent} from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import {fromJS, List} from 'immutable'
import _debounce from 'lodash/debounce'
import _isUndefined from 'lodash/isUndefined'
import {Dropdown, DropdownItem, DropdownToggle} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'

import {RootState} from 'state/types'
import {hasRole} from 'utils'
import {UserRole} from 'config/types/user'
import {fieldEnumSearch} from 'state/views/actions'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from 'pages/common/utils/withCancellableRequest'
import shortcutManager from 'services/shortcutManager'
import {TagLabel} from 'pages/common/utils/labels'
import TagDropdownMenu from 'pages/common/components/TagDropdownMenu/TagDropdownMenu'
import TextInput from 'pages/common/forms/input/TextInput'

import css from './TicketTags.less'

const LIMIT_TAGS_SEARCH = 15

type OwnProps = {
    ticketTags: List<any>
    addTag: (tag: string) => void
    removeTag: (tag: string) => void
    transparent: boolean
    right?: boolean
    dropdownContainer?: HTMLElement
    disabled?: boolean
}

type Props = OwnProps &
    CancellableRequestInjectedProps<
        'fieldEnumSearchCancellable',
        'cancelFieldEnumSearchCancellable',
        typeof fieldEnumSearch
    > &
    ConnectedProps<typeof connector>

type State = {
    dropdownOpen: boolean
    enum: List<any>
    isLoading: boolean
    search: string
}

export class TicketTags extends Component<Props, State> {
    static defaultProps: Pick<Props, 'transparent'> = {
        transparent: false,
    }

    state: State = {
        dropdownOpen: false,
        enum: fromJS([]) as List<any>,
        isLoading: false,
        search: '',
    }

    componentDidMount() {
        this.bindKeys()
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.state.dropdownOpen && this.searchInputRef.current) {
            const prevExistingTagNames = prevProps.ticketTags
                .sortBy((x: Map<any, any>) => x.get('name') as string)
                .map((x: Map<any, any>) => x.get('name') as string)
            const existingTagNames = this.props.ticketTags
                .sortBy((x: Map<any, any>) => x.get('name') as string)
                .map((x: Map<any, any>) => x.get('name') as string)

            if (!prevExistingTagNames.equals(existingTagNames)) {
                this.searchInputRef.current.focus()
            }
        }

        if (prevState.search !== this.state.search) {
            this.setState({isLoading: true})
            this.queryResultsOnSearch(this.state.search)
        }
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketDetailContainer')
    }

    bindKeys = () => {
        shortcutManager.bind('TicketDetailContainer', {
            OPEN_TAGS: {
                action: (e) => {
                    // shortcut key gets typed in the search field otherwise
                    e.preventDefault()
                    this.toggle()
                },
            },
            CLOSE_TAGS: {
                key: 'esc',
                action: () => this.toggle(undefined, false),
            },
        })
    }

    tagRef = React.createRef<DropdownItem>()
    searchInputRef = React.createRef<HTMLInputElement>()

    addTag = (name: string): void => {
        if (!name) {
            return
        }

        this.props.addTag(name)
        const search = ''
        this.setState({search})
        this.queryResults(search)
    }

    toggle = (e?: KeyboardEvent, visible?: boolean) => {
        const opens = !_isUndefined(visible)
            ? visible
            : !this.state.dropdownOpen

        this.setState({
            dropdownOpen: opens,
        })

        if (opens) {
            const search = ''
            this.setState({search})
            this.queryResults(search)
        }
    }

    search = (search: string): void => {
        this.setState({search})
    }

    queryResults = (search: string): void => {
        const {fieldEnumSearchCancellable} = this.props
        this.setState({isLoading: true})

        const field = fromJS({
            filter: {type: 'tag', size: LIMIT_TAGS_SEARCH},
        })

        void fieldEnumSearchCancellable(field, search).then((data) => {
            if (!data) return

            const existingTagNames = this.props.ticketTags.map(
                (x: Map<any, any>) => x.get('name') as string
            )
            const options = data.filter(
                (tag: Map<any, any>) =>
                    !existingTagNames.contains(tag.get('name'))
            ) as List<any>

            this.setState({
                enum: options,
                isLoading: false,
            })
        })
    }

    queryResultsOnSearch = _debounce(this.queryResults, 1000)

    handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'ArrowDown' && this.tagRef.current) {
            const node = ReactDOM.findDOMNode(
                this.tagRef.current
            ) as HTMLElement
            node && node.focus()
        }
    }

    displayMenu = () => {
        const {currentUser} = this.props
        const {search, enum: tags} = this.state

        if (this.state.isLoading) {
            return (
                <DropdownItem disabled>
                    <i className="material-icons md-spin mr-2">refresh</i>
                    Loading...
                </DropdownItem>
            )
        }

        let options = tags
            .map((tag: Map<any, any>, i) => {
                const name = tag.get('name') as string
                return (
                    <DropdownItem
                        key={i}
                        ref={i === 0 ? this.tagRef : undefined}
                        type="button"
                        toggle={false}
                        onClick={() => this.addTag(name)}
                    >
                        {name}
                    </DropdownItem>
                )
            })
            .toList()

        const isInEnum = !!tags.find(
            (tag: Map<any, any>) => tag.get('name') === search
        )

        if (!isInEnum && search) {
            if (!tags.isEmpty() && hasRole(currentUser, UserRole.Agent)) {
                options = options.push(<DropdownItem key="divider" divider />)
            }

            options = hasRole(currentUser, UserRole.Agent)
                ? options.push(
                      <DropdownItem
                          key="create"
                          ref={tags.isEmpty() ? this.tagRef : undefined}
                          type="button"
                          onClick={() => this.addTag(search)}
                      >
                          <b>Create</b> {search}
                      </DropdownItem>
                  )
                : tags.isEmpty()
                ? options.push(
                      <DropdownItem key="not_found" disabled>
                          Couldn't find the tag: {search}
                      </DropdownItem>
                  )
                : options
        }

        return options
    }

    render() {
        const {ticketTags, removeTag, transparent, right, dropdownContainer} =
            this.props
        return (
            <div
                className={`d-none d-md-inline-flex align-items-center flex-wrap mr-2 mb-1${
                    right ? ' justify-content-end' : ''
                }`}
            >
                {ticketTags
                    .sort((a: Map<any, any>, b: Map<any, any>) => {
                        const first = (a.get('name') as string).toLowerCase()
                        const second = (b.get('name') as string).toLowerCase()

                        return first > second ? 1 : second > first ? -1 : 0
                    })
                    .map((tag: Map<any, any>, i) => (
                        <TagLabel
                            key={i}
                            decoration={tag.get('decoration')}
                            className={css.tagLabel}
                        >
                            <span>
                                {tag.get('name')}
                                {!this.props.disabled && (
                                    <i
                                        className={classnames(
                                            css.remove,
                                            'material-icons cursor-pointer ml-1'
                                        )}
                                        onClick={() =>
                                            removeTag(tag.get('name') as string)
                                        }
                                    >
                                        close
                                    </i>
                                )}
                            </span>
                        </TagLabel>
                    ))}

                {!this.props.disabled && (
                    <Dropdown
                        className={css.addTags}
                        isOpen={this.state.dropdownOpen}
                        toggle={this.toggle}
                        group={false}
                        key={+this.state.isLoading} //Force re-render so dropdown position is correct
                    >
                        <DropdownToggle
                            color="secondary"
                            type="button"
                            size="sm"
                            className={classnames({
                                'btn-transparent': transparent,
                            })}
                        >
                            <i className="material-icons md-1 align-middle">
                                add
                            </i>
                            {!ticketTags.size && (
                                <strong className="ml-1 align-middle">
                                    Add tags
                                </strong>
                            )}
                        </DropdownToggle>
                        <TagDropdownMenu
                            right={!!right}
                            style={{padding: '0.5rem 4px'}}
                            container={dropdownContainer}
                            modifiers={{
                                preventOverflow: {
                                    boundariesElement: 'viewport',
                                },
                            }}
                        >
                            <DropdownItem header>ADD TAG:</DropdownItem>
                            <DropdownItem
                                header
                                className="dropdown-item-input"
                            >
                                <TextInput
                                    ref={this.searchInputRef}
                                    placeholder="Search tags..."
                                    autoFocus
                                    value={this.state.search}
                                    onChange={this.search}
                                    onKeyDown={this.handleSearchKeyDown}
                                    role="menuitem"
                                />
                            </DropdownItem>
                            <DropdownItem divider />
                            {this.displayMenu()}
                        </TagDropdownMenu>
                    </Dropdown>
                )}
            </div>
        )
    }
}

const connector = connect((state: RootState) => ({
    currentUser: state.currentUser,
}))

export default withCancellableRequest<
    'fieldEnumSearchCancellable',
    'cancelFieldEnumSearchCancellable',
    typeof fieldEnumSearch
>(
    'fieldEnumSearchCancellable',
    fieldEnumSearch
)(connector(TicketTags))
