import React, { PropTypes } from 'react'


const upperFirstChar = (text) => text.charAt(0).toUpperCase() + text.substr(1)


export default class TopbarFilterGroup extends React.Component {
    onDelete = (clickedValue) => {
        const { name, callee } = this.props.filterSpec
        const newValues = this.props.values.filter((value) => {
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

    getFullObject = (id) => {
        // Get the full object, i.e. the user object from their ID
        const { allValues, getID } = this.props.filterSpec
        return allValues.filter(value => getID(value).toString() === id.toString()).first()
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
        if (this.props.filterSpec.allValues.isEmpty()) {
            return null
        }

        const { columnName } = this.props.filterSpec

        return (
            <div className="ui item">
                <div className="ui labels">
                    <a key="name" className="filter-group-name">{ upperFirstChar(columnName) + ':' }</a>
                    { this.props.values.map(this.renderValue) }
                </div>
            </div>
        )
    }
}

TopbarFilterGroup.propTypes = {
    view: PropTypes.object.isRequired,
    filterSpec: PropTypes.object.isRequired,
    values: PropTypes.array.isRequired,
    submitView: PropTypes.func.isRequired,
    updateFilters: PropTypes.func.isRequired,
    clearFilter: PropTypes.func.isRequired
}
