import React, {PropTypes} from 'react'
import Search from '../../Search'

export default class FilterDropdown extends React.Component {
    onClick = (newValue) => {
        this.props.updateFieldFilter(this.props.field, {
            left: `ticket.${this.props.field.get('name')}`,
            operator: 'contains',
            right: `'${newValue}'`
        })
    }

    onSearch = (query, params) => {
        this.props.updateFieldSearch(this.props.field, {query, params})
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
                    params={{size: 10}}
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
        return (
            field.filter.enum.map(value => (
                <div key={value}
                     className="item"
                     onClick={() => this.onClick(value)}
                >
                    {value}
                </div>
            ))
        )
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
            <div className="FilterDropdown">
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
    field: PropTypes.object.isRequired,
    updateFieldFilter: PropTypes.func.isRequired,
    updateFieldSearch: PropTypes.func.isRequired
}
