import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS} from 'immutable'
import Search from '../Search'
import {RenderLabel} from '../../utils/labels'
import {equalityOperator, resolveLiteral, isImmutable, fieldPath} from '../../../../utils'
import {fieldEnumSearch} from '../../../../state/views/actions'
import _isUndefined from 'lodash/isUndefined'

class FilterDropdown extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            enum: props.field.getIn(['filter', 'enum'], fromJS([]))
        }
    }

    componentDidMount() {
        // trigger search on component load
        this.onSearch()
    }

    onClick = (newValue) => {
        const viewConfig = this.props.viewConfig

        const left = `${viewConfig.singular}.${fieldPath(this.props.field)}`
        this.props.addFieldFilter(this.props.field.toJS(), {
            left,
            operator: equalityOperator(left, this.props.schemas),
            right: resolveLiteral(newValue, left)
        })
    }

    // query search from server and save it in state
    onSearch = (query = this.props.field.getIn(['filter', 'query']), value) => {
        // no query object = no search (enum is hardcoded)
        if (_isUndefined(query)) {
            return
        }

        // if there is no value and that the query is an object, we don't send query so we retrieve every results
        if (!value && query.delete) {
            query = query.delete('query')
        }

        this.props.fieldEnumSearch(this.props.field, query)
            .then((data) => {
                this.setState({
                    enum: data
                })
            })
    }

    // render a search input if the field is searchable
    renderSearch = () => {
        const field = this.props.field

        if (!field.getIn(['filter', 'query'])) {
            return
        }

        return (
            <div className="ui icon search input">
                <Search
                    autofocus
                    className="medium"
                    onChange={this.onSearch}
                    queryPath={field.getIn(['filter', 'queryPath'])}
                    query={field.getIn(['filter', 'query']).toJS()}
                    searchDebounceTime={300}
                />
            </div>
        )
    }

    // if we have enum values render them
    renderEnum = () => {
        const field = this.props.field

        if (!this.state.enum) {
            return null
        }

        return this.state.enum.map((value, key) => {
            let renderValue = value

            // special displays for some properties in the dropdown
            if (field.get('name') === 'tags') {
                // display tags as tags
                renderValue = (
                    <RenderLabel
                        field={field}
                        value={value.get('name')}
                    />
                )
            } else if (typeof value === 'object' || field.get('name') === 'roles') {
                renderValue = (
                    <RenderLabel
                        field={field}
                        value={value}
                    />
                )
            }

            return (
                <div
                    key={key}
                    className="item"
                    onClick={() => this.onClick(isImmutable(value) ? value.toJS() : value)}
                >
                    {renderValue}
                </div>
            )
        })
    }

    render() {
        const field = this.props.field

        if (!(field.getIn(['filter', 'query']) || this.state.enum)) {
            return
        }

        return (
            <div className="filter-dropdown">
                <div ref="uicomponent" className="ui simple dropdown active visible">
                    <div className="ui vertical menu visible">
                        {this.renderSearch()}
                        {this.renderEnum()}
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
    fieldEnumSearch: PropTypes.func.isRequired,
}

const mapDispatchToProps = (dispatch) => ({
    fieldEnumSearch: bindActionCreators(fieldEnumSearch, dispatch)
})

export default connect(null, mapDispatchToProps)(FilterDropdown)
