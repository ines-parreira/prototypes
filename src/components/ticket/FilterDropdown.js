import React, {PropTypes} from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import { List } from 'immutable'

const upperFirstChar = (text) => text.charAt(0).toUpperCase() + text.substr(1)


export default class FilterDropdown extends React.Component {
    getCurrentValues = () => {
        // Get the current values or an empty list
        const { groupedFilters, filterSpec } = this.props
        const { name, callee} = filterSpec
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
                <div className="ui teal empty circular label"></div>
                {upperFirstChar(getRepr(value))}
            </div>
        )
    }

    onClick = (newValue) => {
        const { name, callee, getRepr } = this.props.filterSpec
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
            "ui",
            "dropdown",
            "active",
            "visible",
            {multiple: this.props.multiple},
        )
        const currentValues = this.getCurrentValues()
        const { allValues, getID } = this.props.filterSpec

        // We do not list currently selected values in the drop-down as per Semantic's implementation
        const values = allValues.filter((value) =>
            !currentValues.includes(getID(value))
        )

        return (
            <div className="FilterDropdown">
                <div ref="uicomponent" className={className}>
                    <input type="hidden" name="filters" />
                    <div className="menu visible" style={{display: "block !important" }}>
                        <div className="ui icon search input">
                            <i className="search icon"></i>
                            <input type="text" placeholder={this.props.placeholder} />
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
    placeholder: PropTypes.string.isRequired,
}
