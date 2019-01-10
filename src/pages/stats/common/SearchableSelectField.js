import React from 'react'
import PropTypes from 'prop-types'
import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Label,
    Input,
} from 'reactstrap'

import css from './SearchableSelectField.less'

class SearchableSelectField extends React.Component {
    state = {
        search: ''
    }

    _handleSearchChange = (text) => {
        this.setState({
            search: text,
        })

        if (this.props.onSearch) {
            this.props.onSearch(text)
        }
    }

    _handleOptionClick = (value) => {
        const input = this.props.input

        if (this.props.isDisabled) {
            return
        }

        const newValue = input.value

        if (newValue.includes(value)) {
            // if value already present, remove it
            newValue.splice(newValue.indexOf(value), 1)
        } else {
            // otherwise add it
            newValue.push(value)
        }

        input.onChange(newValue)
    }

    _deselectAll = () => {
        if (this.props.isDisabled) {
            return
        }

        this.props.input.onChange([])
    }

    // items = [{label: 'Label', value: 2}]
    render() {
        const {items, input, plural, singular, isDisabled} = this.props
        const {search} = this.state

        const hasSelectedItems = !!input.value.length

        // filter items by text search
        const filteredItems = items.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))

        return (
            <UncontrolledDropdown
                disabled={isDisabled}
                className={css.component}
            >
                <DropdownToggle
                    caret
                    className="mr-2"
                    color="secondary"
                    type="button"
                    disabled={isDisabled}
                >
                    {
                        hasSelectedItems ? (
                            <span>
                                    {input.value.length} {input.value.length > 1 ? plural : singular}
                                </span>
                        ) : (
                            <span>
                                    All {plural}
                                </span>
                        )
                    }
                </DropdownToggle>
                <DropdownMenu
                    right
                    className={css.dropdown}
                >
                    <DropdownItem
                        header
                        className="dropdown-item-input"
                    >
                        <Input
                            className="mb-2"
                            placeholder={`Search ${plural}...`}
                            autoFocus
                            value={search}
                            onChange={(e) => this._handleSearchChange(e.target.value)}
                        />
                    </DropdownItem>
                    <div className={css.content}>
                        {
                            filteredItems.length === 0 ? (
                                <DropdownItem header>
                                    Could not find any {singular}
                                </DropdownItem>
                            ) : (
                                filteredItems.map((item) => {
                                    const isChecked = input.value.includes(item.value)

                                    return (
                                        <DropdownItem
                                            key={item.value}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                this._handleOptionClick(item.value)
                                            }}
                                            toggle={false}
                                        >
                                            <Label check>
                                                <input
                                                    className="mr-2"
                                                    type="checkbox"
                                                    checked={isChecked}
                                                />
                                                {' '}
                                                {item.label}
                                            </Label>
                                        </DropdownItem>
                                    )
                                })
                            )
                        }
                    </div>
                    {
                        hasSelectedItems && [
                            <DropdownItem
                                key="divider"
                                divider
                            />,
                            <DropdownItem
                                key="deselect"
                                type="button"
                                onClick={this._deselectAll}
                            >
                                <span className="text-warning">Deselect all</span>
                            </DropdownItem>
                        ]
                    }
                </DropdownMenu>
            </UncontrolledDropdown>
        )
    }
}

SearchableSelectField.propTypes = {
    items: PropTypes.array.isRequired,
    input: PropTypes.object.isRequired,
    plural: PropTypes.string.isRequired,
    singular: PropTypes.string.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    onSearch: PropTypes.func,
}

SearchableSelectField.defaultProps = {
    items: [],
    plural: 'items',
    singular: 'item',
    isDisabled: false,
}

export default SearchableSelectField
