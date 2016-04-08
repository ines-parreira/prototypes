import React, {PropTypes} from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import { List } from 'immutable'
import SearchInput, { createFilter } from 'react-search-input'

const upperFirstChar = (text) => text.charAt(0).toUpperCase() + text.substr(1)


export default class FilterDropdown extends React.Component {
    constructor() {
        super()
        this.state = { searchTerm: '' }
    }

    searchUpdated = (term) => {
        this.setState({ searchTerm: term }) // Necessary for re-render
    }

    getCurrentValues = () => {
        // Get the current values or an empty list
        const { groupedFilters, filterSpec } = this.props
        const { name, callee } = filterSpec
        return groupedFilters.getIn([name, callee], List()).toJS()
    }

    renderValue = (value) => {
        const { getID, getRepr } = this.props.filterSpec

        return (
            <div
                key={getID(value)}
                className="item"
                onClick={() => this.onClick(getID(value))}
            >
                <div className="ui blue empty circular label"></div>
                {upperFirstChar(getRepr(value))}
            </div>
        )
    }

    onClick = (newValue) => {
        const { name, callee } = this.props.filterSpec
        const multiple = callee === 'contains'
        const existing = multiple ? this.getCurrentValues() : []

        this.props.updateFilters({
            [name]: {
                [callee]: _.concat(existing, newValue)
            }
        })
    }

    render() {
        /*
        * This is the markup for Semantic UI's dropdown with some visible/active CSS classes
        * manually added
        */
        const className = classNames(
            'ui',
            'dropdown',
            'active',
            'visible',
        )
        const currentValues = this.getCurrentValues()
        const { allValues, getID, search } = this.props.filterSpec
        // TODO: This only searches .name on any object
        const filters = ['name']
        let values = allValues

        if (this.refs.search) {
            values = values.filter(this.refs.search.filter(filters))
        }

        // We do not list currently selected values in the drop-down as per Semantic's implementation
        values = values.filter((value) =>
            !currentValues.includes(getID(value))
        )

        return (
            <div className="FilterDropdown">
                <div ref="uicomponent" className={className}>
                    <input type="hidden" name="filters" />
                    <div className="menu visible" style={{ display: 'block !important' }}>
                        <div className={`ui icon search input ${search ? '' : 'hidden'}`}>
                            <i className="search icon"/>
                            <SearchInput
                                ref="search"
                                onChange={this.searchUpdated}
                                placeholder="Search..."
                            />
                        </div>
                        <div className="scrolling menu">
                            {values.map(this.renderValue)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

FilterDropdown.propTypes = {
    filterSpec: PropTypes.object.isRequired,
    groupedFilters: PropTypes.object.isRequired,
    updateFilters: PropTypes.func.isRequired,
}
