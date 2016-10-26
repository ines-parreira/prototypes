import React, {PropTypes} from 'react'
import Search from '../Search'
import {RenderLabel} from '../../utils/labels'
import {equalityOperator, resolveLiteral} from '../../../../utils'

export default class FilterDropdown extends React.Component {
    onClick = (newValue) => {
        const viewConfig = this.props.viewConfig

        const left = `${viewConfig.singular}.${this.props.field.get('name')}`
        this.props.addFieldFilter(this.props.field, {
            left,
            operator: equalityOperator(left, this.props.schemas),
            right: resolveLiteral(newValue, left)
        })
    }

    onSearch = (query) => {
        this.props.updateFieldEnumSearch(this.props.field, query)
    }

    // render a search input if the field is searchable
    renderSearch = (field) => {
        if (!field.filter.query) {
            return null
        }

        return (
            <div className="ui icon search input">
                <Search
                    autofocus
                    className="medium"
                    onChange={this.onSearch}
                    queryPath={field.filter.queryPath}
                    query={field.filter.query}
                    searchDebounceTime={300}
                />
            </div>
        )
    }

    // if we have enum values render them
    renderEnum = (field) => {
        if (!field.filter.enum) {
            return null
        }

        return field.filter.enum.map((value, key) => {
            let renderValue = value

            if (field.type === 'tags') {
                // Special treat for tags, because we don't want the TagLabels in the Dropdown options
                renderValue = value.name
            } else if (typeof value === 'object') {
                renderValue = RenderLabel(field, value, this.props.timezone)
            }

            return (
                <div
                    key={key}
                    className="item"
                    onClick={() => this.onClick(value)}
                >
                    {renderValue}
                </div>
            )
        })
    }

    render() {
        /*
         * This is the markup for Semantic UI's dropdown with some visible/active CSS classes
         * manually added
         */
        const field = this.props.field.toJS()

        if (!(field.filter.query || field.filter.enum)) {
            return null
        }

        return (
            <div className="filter-dropdown">
                <div ref="uicomponent" className="ui simple dropdown active visible">
                    <div className="ui vertical menu visible">
                        {this.renderSearch(field)}
                        {this.renderEnum(field)}
                    </div>
                </div>
            </div>
        )
    }
}

FilterDropdown.propTypes = {
    viewConfig: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    addFieldFilter: PropTypes.func.isRequired,
    updateFieldEnumSearch: PropTypes.func.isRequired,
    timezone: PropTypes.string
}
