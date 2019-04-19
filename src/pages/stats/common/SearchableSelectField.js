// @flow
import classNames from 'classnames/bind'
import React, {type ComponentType} from 'react'
import {DropdownItem, DropdownMenu, DropdownToggle, Input, Label, UncontrolledDropdown} from 'reactstrap'

import css from './SearchableSelectField.less'

type Item = {
    label?: string,
    value?: string
}

type Props = {
    items: Item[],
    input: {
        value: string[],
        onChange: string[] => void
    },
    plural: string,
    singular: string,
    isDisabled: boolean,
    onSearch?: string => void,
    dropdownMenu: ComponentType<*>
}

type State = {
    search: string
}

class SearchableSelectField extends React.Component<Props, State> {
    static defaultProps = {
        items: [],
        plural: 'items',
        singular: 'item',
        isDisabled: false,
        dropdownMenu: (props) => (
            <DropdownMenu
                {...props}
                className={css.dropdown}
            />
        )
    }

    state = {
        search: ''
    }

    _handleSearchChange = (text: string) => {
        this.setState({
            search: text,
        })

        if (this.props.onSearch) {
            this.props.onSearch(text)
        }
    }

    _handleOptionClick = (value: string) => {
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

    render() {
        const {items, input, plural, singular, isDisabled, dropdownMenu: DropdownMenuComponent} = this.props
        const {search} = this.state

        const hasSelectedItems = !!input.value.length

        // filter items by text search
        const filteredItems = items.filter((item) => {
            return item.label && item.label.toLowerCase().includes(search.toLowerCase())
        })

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
                <DropdownMenuComponent right>
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
                                    const isChecked = item.value ? input.value.includes(item.value) : false

                                    return (
                                        <DropdownItem
                                            key={item.value}
                                            tag={(props) => (
                                                <Label
                                                    {...props}
                                                    check
                                                />
                                            )}
                                            toggle={false}
                                            className={css.dropdownItem}
                                        >
                                            <input
                                                className={classNames('mr-2', css.checkbox)}
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {
                                                    if (item.value) {
                                                        this._handleOptionClick(item.value)
                                                    }
                                                }}
                                            />
                                            {' '}
                                            {item.label}
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
                </DropdownMenuComponent>
            </UncontrolledDropdown>
        )
    }
}

export default SearchableSelectField
