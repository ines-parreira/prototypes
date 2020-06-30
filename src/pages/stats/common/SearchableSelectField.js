// @flow
import _capitalize from 'lodash/capitalize'
import classnames from 'classnames'
import React, {type ComponentType} from 'react'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    Label,
    UncontrolledDropdown,
} from 'reactstrap'

import css from './SearchableSelectField.less'

type Item = {
    label?: string,
    value?: string,
}

type Props = {
    items: Item[],
    input: {
        value: string[],
        onChange: (string[]) => void,
    },
    plural: string,
    singular: string,
    isDisabled: boolean,
    onSearch?: (string) => void,
    dropdownMenu: ComponentType<*>,
    multiple: boolean,
    required: boolean,
}

type State = {
    search: string,
}

class SearchableSelectField extends React.Component<Props, State> {
    static defaultProps = {
        items: [],
        plural: 'items',
        singular: 'item',
        isDisabled: false,
        dropdownMenu: (props: any) => (
            <DropdownMenu {...props} className={css.dropdown} />
        ),
        multiple: true,
        required: false,
    }

    state = {
        search: '',
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
        const {input, isDisabled, multiple, required} = this.props

        if (isDisabled) {
            return
        }

        const isRemoving = !!input.value.includes(value)
        let newValue

        if (isRemoving && (!required || input.value.length > 1)) {
            newValue = input.value.filter((item) => item !== value)
        } else if (!isRemoving && multiple) {
            newValue = input.value.concat([value])
        } else if (!isRemoving) {
            newValue = [value]
        }

        if (newValue) {
            input.onChange(newValue)
        }
    }

    _deselectAll = () => {
        if (this.props.isDisabled || this.props.required) {
            return
        }

        this.props.input.onChange([])
    }

    render() {
        const {
            items,
            input,
            plural,
            singular,
            isDisabled,
            dropdownMenu: DropdownMenuComponent,
            multiple,
            required,
        } = this.props
        const {search} = this.state

        const hasSelectedItems = !!input.value.length

        // filter items by text search
        const filteredItems = items.filter((item) => {
            return (
                item.label &&
                item.label.toLowerCase().includes(search.toLowerCase())
            )
        })

        let dropdownLabel = ''
        if (multiple && hasSelectedItems) {
            dropdownLabel =
                input.value.length +
                ' ' +
                (input.value.length > 1 ? plural : singular)
        } else if (multiple && !hasSelectedItems) {
            dropdownLabel = 'All ' + plural
        } else if (!multiple && input.value.length === 1) {
            const selectedItem = items.find(
                (item) => item.value === input.value[0]
            )
            if (selectedItem) {
                dropdownLabel = selectedItem.label
            }
        } else if (!multiple) {
            dropdownLabel = _capitalize(singular)
        }

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
                    <span>{dropdownLabel}</span>
                </DropdownToggle>
                <DropdownMenuComponent right>
                    <DropdownItem header className="dropdown-item-input">
                        <Input
                            className="mb-2"
                            placeholder={`Search ${plural}...`}
                            autoFocus
                            value={search}
                            onChange={(e) =>
                                this._handleSearchChange(e.target.value)
                            }
                        />
                    </DropdownItem>
                    <div className={css.content}>
                        {filteredItems.length === 0 ? (
                            <DropdownItem header>
                                Could not find any {singular}
                            </DropdownItem>
                        ) : (
                            filteredItems.map((item) => {
                                const isChecked = item.value
                                    ? input.value.includes(item.value)
                                    : false

                                return (
                                    <DropdownItem
                                        key={item.value}
                                        tag={(props) => (
                                            <Label {...props} check />
                                        )}
                                        toggle={false}
                                        className={css.dropdownItem}
                                    >
                                        <input
                                            className={classnames(
                                                'mr-2',
                                                css.checkbox
                                            )}
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                                if (item.value) {
                                                    this._handleOptionClick(
                                                        item.value
                                                    )
                                                }
                                            }}
                                        />{' '}
                                        {item.label}
                                    </DropdownItem>
                                )
                            })
                        )}
                    </div>
                    {hasSelectedItems &&
                        !required && [
                            <DropdownItem key="divider" divider />,
                            <DropdownItem
                                key="deselect"
                                type="button"
                                onClick={this._deselectAll}
                            >
                                <span className="text-warning">
                                    {input.value.length === 1
                                        ? 'Deselect'
                                        : 'Deselect all'}
                                </span>
                            </DropdownItem>,
                        ]}
                </DropdownMenuComponent>
            </UncontrolledDropdown>
        )
    }
}

export default SearchableSelectField
