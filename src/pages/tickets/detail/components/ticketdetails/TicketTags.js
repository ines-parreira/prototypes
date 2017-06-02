import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import {ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Input} from 'reactstrap'
import _debounce from 'lodash/debounce'

import {TagLabel} from '../../../../common/utils/labels'
import {fieldEnumSearch} from '../../../../../state/views/actions'

export class TicketTags extends React.Component {
    state = {
        dropdownOpen: false,
        enum: fromJS([]),
        isLoading: false,
        search: '',
    }

    componentDidMount() {
        this._search()
    }

    _addTag = (name) => {
        if (!name) {
            return
        }

        this.props.addTags(name)
        this.setState({search: ''})
    }

    _toggle = () => {
        const opens = !this.state.dropdownOpen

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
            filter: {type: 'tag'}
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
                    <i className="fa fa-fw fa-circle-o-notch fa-spin mr-2" />
                    Loading...
                </DropdownItem>
            )
        }

        const existingTagNames = ticketTags.map(x => x.get('name'))
        const availableTags = this.state.enum.filter(tag => !existingTagNames.contains(tag.get('name')))

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

        const isInEnum = !!this.state.enum.find(tag => tag.get('name') === search)

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
        const {ticketTags, removeTag} = this.props

        return (
            <div className="d-inline-flex align-items-center flex-wrap hidden-sm-down">
                {
                    ticketTags
                        .sort((a, b) => a.get('name').toLowerCase() > b.get('name').toLowerCase() ? 1 : -1)
                        .map((tag, i) => (
                            <TagLabel
                                key={i}
                                decoration={tag.get('decoration')}
                            >
                                <span>
                                    {tag.get('name')}
                                    <i
                                        className="fa fa-fw fa-close cursor-pointer ml-1"
                                        onClick={() => removeTag(tag.get('name'))}
                                    />
                                </span>
                            </TagLabel>
                        ))
                }

                <ButtonDropdown
                    className={classnames({
                        'ml-1': !ticketTags.isEmpty(),
                    })}
                    isOpen={this.state.dropdownOpen}
                    toggle={this._toggle}
                >
                    <DropdownToggle
                        className="d-inline-flex align-items-center"
                        color="link"
                        type="button"
                        style={{padding: 0}}
                    >
                        <i className="fa fa-fw fa-plus" />
                        {
                            !ticketTags.size && (
                                <span className="ml-1">Add tag</span>
                            )
                        }
                    </DropdownToggle>
                    <DropdownMenu style={{width: '230px'}}>
                        <DropdownItem
                            header
                            className="dropdown-item-input"
                        >
                            <div className="mb-2">Add tag:</div>
                            {
                                this.state.dropdownOpen && ( // rebuild input on each opening so "autoFocus" works
                                    <Input
                                        placeholder="Search tags..."
                                        autoFocus
                                        value={this.state.search}
                                        onChange={e => this._search(e.target.value)}
                                    />
                                )
                            }
                        </DropdownItem>
                        <DropdownItem divider />
                        {this._displayMenu()}
                    </DropdownMenu>
                </ButtonDropdown>
            </div>
        )
    }
}

TicketTags.propTypes = {
    ticketTags: PropTypes.object.isRequired,
    addTags: PropTypes.func.isRequired,
    removeTag: PropTypes.func.isRequired,
    fieldEnumSearch: PropTypes.func.isRequired,
}

const mapDispatchToProps = {
    fieldEnumSearch,
}

export default connect(null, mapDispatchToProps)(TicketTags)
