import React, {Component} from 'react'
import type {KeyboardEvent} from 'react'
import ReactDOM from 'react-dom'

import classnames from 'classnames'
import {fromJS, List} from 'immutable'
import _debounce from 'lodash/debounce'
import _isUndefined from 'lodash/isUndefined'
import {Dropdown, DropdownItem, DropdownToggle, Input} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'

import shortcutManager from '../../../../../services/shortcutManager/index'
import {fieldEnumSearch} from '../../../../../state/views/actions'
import TagDropdownMenu from '../../../../common/components/TagDropdownMenu/TagDropdownMenu'
import {TagLabel} from '../../../../common/utils/labels'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from '../../../../common/utils/withCancellableRequest'
import {hasRole} from '../../../../../utils'
import {UserRole} from '../../../../../config/types/user'
import {RootState} from '../../../../../state/types'

import css from './TicketTags.less'

const LIMIT_TAGS_SEARCH = 15

type OwnProps = {
    ticketTags: List<any>
    addTags: (tag: string) => void
    removeTag: (tag: string) => void
    transparent: boolean
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

    state = {
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
                const node = ReactDOM.findDOMNode(
                    this.searchInputRef.current
                ) as HTMLInputElement
                if (node) {
                    node.focus()
                }
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
    searchInputRef = React.createRef<Input>()

    addTag = (name: string): void => {
        if (!name) {
            return
        }

        this.props.addTags(name)
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
            if (!data) {
                return
            }
            this.setState({
                enum: data,
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
        const {ticketTags, currentUser} = this.props
        const {search} = this.state

        if (this.state.isLoading) {
            return (
                <DropdownItem disabled>
                    <i className="material-icons md-spin mr-2">refresh</i>
                    Loading...
                </DropdownItem>
            )
        }

        const existingTagNames = ticketTags.map(
            (x: Map<any, any>) => x.get('name') as string
        )
        const availableTags = this.state.enum.filter(
            (tag: Map<any, any>) => !existingTagNames.contains(tag.get('name'))
        )

        let options = availableTags
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

        const isInEnum = !!this.state.enum.find(
            (tag: Map<any, any>) => tag.get('name') === search
        )

        if (!isInEnum && search) {
            if (!availableTags.isEmpty()) {
                options = options.push(<DropdownItem key="divider" divider />)
            }

            options = hasRole(currentUser, UserRole.Agent)
                ? options.push(
                      <DropdownItem
                          key="create"
                          ref={
                              availableTags.isEmpty() ? this.tagRef : undefined
                          }
                          type="button"
                          onClick={() => this.addTag(search)}
                      >
                          <b>Create</b> {search}
                      </DropdownItem>
                  )
                : availableTags.isEmpty()
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
        const {ticketTags, removeTag, transparent} = this.props
        return (
            <div className="d-none d-md-inline-flex align-items-center flex-wrap ml-2 mr-2 mb-1">
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
                            </span>
                        </TagLabel>
                    ))}

                <Dropdown
                    className={css.addTags}
                    isOpen={this.state.dropdownOpen}
                    toggle={this.toggle}
                    group={false}
                >
                    <DropdownToggle
                        color="secondary"
                        type="button"
                        size="sm"
                        className={classnames({
                            'btn-transparent': transparent,
                        })}
                    >
                        <i className="material-icons md-1 align-middle">add</i>
                        {!ticketTags.size && (
                            <strong className="ml-1 align-middle">
                                add tags
                            </strong>
                        )}
                    </DropdownToggle>
                    <TagDropdownMenu>
                        <DropdownItem header>ADD TAG:</DropdownItem>
                        <DropdownItem header className="dropdown-item-input">
                            {this.state.dropdownOpen && ( // rebuild input on each opening so "autoFocus" works
                                <Input
                                    ref={this.searchInputRef}
                                    placeholder="Search tags..."
                                    autoFocus
                                    value={this.state.search}
                                    onChange={(e) =>
                                        this.search(e.target.value)
                                    }
                                    onKeyDown={this.handleSearchKeyDown}
                                    role="menuitem"
                                />
                            )}
                        </DropdownItem>
                        <DropdownItem divider />
                        {this.displayMenu()}
                    </TagDropdownMenu>
                </Dropdown>
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
