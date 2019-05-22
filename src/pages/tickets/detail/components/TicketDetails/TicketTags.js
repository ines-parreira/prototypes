import classnames from 'classnames'
import {fromJS} from 'immutable'
import _debounce from 'lodash/debounce'
import _isUndefined from 'lodash/isUndefined'
import PropTypes from 'prop-types'
import React from 'react'
import {connect} from 'react-redux'
import {Dropdown, DropdownItem, DropdownToggle, Input} from 'reactstrap'

import shortcutManager from '../../../../../services/shortcutManager'
import {fieldEnumSearch} from '../../../../../state/views/actions'
import TagDropdownMenu from '../../../../common/components/TagDropdownMenu/TagDropdownMenu'
import {TagLabel} from '../../../../common/utils/labels'

import css from './TicketTags.less'


const LIMIT_TAGS_SEARCH = 15


export class TicketTags extends React.Component {
    state = {
        dropdownOpen: false,
        enum: fromJS([]),
        isLoading: false,
        search: '',
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketDetailContainer')
    }

    _bindKeys = () => {
        shortcutManager.bind('TicketDetailContainer', {
            OPEN_TAGS: {
                action: (e) => {
                    // shortcut key gets typed in the search field otherwise
                    e.preventDefault()
                    this._toggle()
                }
            },
            CLOSE_TAGS: {
                key: 'esc',
                action: () => this._toggle(null, false)
            }
        })
    }

    _addTag = (name) => {
        if (!name) {
            return
        }

        this.props.addTags(name)
        this.setState({search: ''})
    }

    _toggle = (e, visible) => {
        const opens = !_isUndefined(visible) ? visible : !this.state.dropdownOpen

        this.setState({
            dropdownOpen: opens,
        })

        if (opens) {
            const search = ''
            this.setState({search})
            this._queryResults(search)
        }
    }

    _search = (search) => {
        this.setState({search})
        this._queryResultsOnSearch(search)
    }

    _queryResults = (search) => {
        this.setState({isLoading: true})

        const field = fromJS({
            filter: {type: 'tag', size: LIMIT_TAGS_SEARCH}
        })

        this.props.fieldEnumSearch(field, search)
            .then((data) => {
                this.setState({
                    enum: data,
                    isLoading: false,
                })
            })
    }

    _queryResultsOnSearch = _debounce(this._queryResults, 300)

    _displayMenu = () => {
        const {ticketTags} = this.props
        const {search} = this.state

        if (this.state.isLoading) {
            return (
                <DropdownItem disabled>
                    <i className="material-icons md-spin mr-2">
                        refresh
                    </i>
                    Loading...
                </DropdownItem>
            )
        }

        const existingTagNames = ticketTags.map((x) => x.get('name'))
        const availableTags = this.state.enum.filter((tag) => !existingTagNames.contains(tag.get('name')))

        let options = availableTags.map((tag, i) => {
            const name = tag.get('name')
            return (
                <DropdownItem
                    key={i}
                    type="button"
                    onClick={() => this._addTag(name)}
                >
                    {name}
                </DropdownItem>
            )
        })

        const isInEnum = !!this.state.enum.find((tag) => tag.get('name') === search)

        if (!isInEnum && search) {
            if (!availableTags.isEmpty()) {
                options = options.push(
                    <DropdownItem
                        key="divider"
                        divider
                    />
                )
            }

            options = options.push(
                <DropdownItem
                    key="create"
                    type="button"
                    onClick={() => this._addTag(search)}
                >
                    <b>Create</b> {search}
                </DropdownItem>
            )
        }

        return options
    }

    render() {
        const {ticketTags, removeTag, transparent} = this.props
        return (
            <div className="d-none d-md-inline-flex align-items-center flex-wrap ml-2 mr-2 mb-1">
                {
                    ticketTags
                        .sort((a, b) => a.get('name').toLowerCase() > b.get('name').toLowerCase())
                        .map((tag, i) => (
                            <TagLabel
                                key={i}
                                decoration={tag.get('decoration')}
                                className={css.tagLabel}
                            >
                                <span>
                                    {tag.get('name')}
                                    <i
                                        className={classnames(css.remove,
                                            'material-icons cursor-pointer ml-1'
                                        )}
                                        onClick={() => removeTag(tag.get('name'))}
                                    >
                                        close
                                    </i>
                                </span>
                            </TagLabel>
                        ))
                }

                <Dropdown
                    className={css.addTags}
                    isOpen={this.state.dropdownOpen}
                    toggle={this._toggle}
                    group={false}
                >
                    <DropdownToggle
                        color="secondary"
                        type="button"
                        size="sm"
                        className={classnames({
                            'btn-transparent': transparent
                        })}
                    >
                        <i className="material-icons md-1 align-middle">
                            add
                        </i>
                        {
                            !ticketTags.size && (
                                <strong className="ml-1 align-middle">add tags</strong>
                            )
                        }
                    </DropdownToggle>
                    <TagDropdownMenu>
                        <DropdownItem
                            header
                        >
                            ADD TAG:
                        </DropdownItem>
                        <DropdownItem
                            header
                            className="dropdown-item-input"
                        >
                            {
                                this.state.dropdownOpen && ( // rebuild input on each opening so "autoFocus" works
                                    <Input
                                        placeholder="Search tags..."
                                        autoFocus
                                        value={this.state.search}
                                        onChange={(e) => this._search(e.target.value)}
                                    />
                                )
                            }
                        </DropdownItem>
                        <DropdownItem divider />
                        {this._displayMenu()}
                    </TagDropdownMenu>
                </Dropdown>
            </div>
        )
    }
}

TicketTags.propTypes = {
    ticketTags: PropTypes.object.isRequired,
    addTags: PropTypes.func.isRequired,
    removeTag: PropTypes.func.isRequired,
    fieldEnumSearch: PropTypes.func.isRequired,
    transparent: PropTypes.bool
}

TicketTags.defaultProps = {
    transparent: false
}

const mapDispatchToProps = {
    fieldEnumSearch,
}

export default connect(null, mapDispatchToProps)(TicketTags)
