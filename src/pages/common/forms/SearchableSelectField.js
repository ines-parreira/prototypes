import React, {PropTypes} from 'react'
import classnames from 'classnames'

/**
 * Accepts a list of values to search and bulk select
 * Field value is an array of items values
 * ex: used in stats to select filters
 */
class SearchableSelectField extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            search: ''
        }
    }

    _handleSearchChange = (e) => {
        const text = e.target.value

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
        const filteredItems = items.filter(item => item.label.toLowerCase().includes(search.toLowerCase()))

        return (
            <div className={classnames('ui field searchable-select', {
                disabled: isDisabled
            })}>
                <div className="ui compact menu">
                    <div
                        ref="select"
                        className="ui simple inline dropdown item"
                    >
                        {
                            hasSelectedItems
                                ? `${input.value.length} ${input.value.length > 1 ? plural : singular}`
                                : `All ${plural}`
                        }
                        <i className="dropdown icon" />
                        <div className="menu">
                            <div className="ui icon input">
                                <input
                                    type="text"
                                    placeholder={`Search ${plural}`}
                                    value={search}
                                    onChange={this._handleSearchChange}
                                />
                                <i className="search icon" />
                            </div>
                            {
                                filteredItems.map((item) => (
                                    <div
                                        className="item"
                                        key={item.value}
                                        onClick={() => this._handleOptionClick(item.value)}
                                    >
                                        <div className="ui checkbox">
                                            <input
                                                type="checkbox"
                                                checked={input.value.includes(item.value)}
                                                autoFocus
                                                onClick={() => {
                                                    // we need this function here to satisfy React telling us that we
                                                    // need an onClick hook on a controlled input,
                                                    // even if actually we do not need it
                                                }}
                                            />
                                            <label>{item.label}</label>
                                        </div>
                                    </div>
                                ))
                            }
                            {
                                hasSelectedItems && (
                                    <div className="item item-button">
                                        <button
                                            className="ui orange button"
                                            onClick={this._deselectAll}
                                        >
                                            Deselect all
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
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
