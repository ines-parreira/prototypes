import React, {PropTypes} from 'react'
import _ from 'lodash'
import { List } from 'immutable'


const upperFirstChar = (text) => text.charAt(0).toUpperCase() + text.substr(1)


export default class TopbarFilterGroup extends React.Component {
    onDelete = (clickedValue) => {
        const { name, callee } = this.props.filterSpec
        const newValues = this.getCurrentValues().filter((value) => {
            return value !== clickedValue
        })

        if (_.isEmpty(newValues)) {
            // If the list is empty remove the filter
            return this.props.clearFilter(name)
        }

        return this.props.updateFilters({
            [name]: {
                [callee]: newValues
            }
        })
    }

    getCurrentValues = () => {
        // Get the current values or an empty list
        const { name, callee } = this.props.filterSpec
        return this.props.groupedFilters.getIn([name], List())[callee]
    }

    getFullObject = (id) => {
        // Get the full object, i.e. the user object from their ID
        const { allValues, getID } = this.props.filterSpec
        return _.first(allValues.filter((value) => getID(value).toString() === id.toString()))
    }

    renderValue = (id) => {
        const { getRepr } = this.props.filterSpec
        const value = this.getFullObject(id)
        return (
            <a key={id} className="ui basic light blue ticket-tag label">
                {getRepr(value)}
                <i
                    className="icon close"
                    onClick={() => this.onDelete(id)}
                />
            </a>
        )
    }

    render = () => {
        if (_.isEmpty(this.props.filterSpec.allValues)) {
            return null
        }

        const { columnName } = this.props.filterSpec
        return (
            <div className="ui item">
                <div className="ui labels">
                    <a key="name" className="filter-group-name">{ upperFirstChar(columnName) + ':' }</a>
                    { this.getCurrentValues().map(this.renderValue) }
                </div>
            </div>
        )
    }
}

TopbarFilterGroup.propTypes = {
    view: PropTypes.object.isRequired,
    filterSpec: PropTypes.object.isRequired,
    groupedFilters: PropTypes.object.isRequired,
    submitView: PropTypes.func.isRequired,
    updateFilters: PropTypes.func.isRequired,
    clearFilter: PropTypes.func.isRequired
}
