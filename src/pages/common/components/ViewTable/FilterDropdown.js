import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import Search from '../Search'
import {RenderLabel} from '../../utils/labels'
import {equalityOperator, resolveLiteral, isImmutable, fieldPath} from '../../../../utils'
import {fieldEnumSearch} from '../../../../state/views/actions'
import _noop from 'lodash/noop'

import * as schemasSelectors from '../../../../state/schemas/selectors'

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
        // wait for React to be ready before we bind anything (hence the setTimeout)
        setTimeout(() => window.addEventListener('click', this._closeOnClickOutside), 1)
    }

    componentWillUnmount() {
        window.removeEventListener('click', this._closeOnClickOutside)
    }

    onClick = (newValue) => {
        const viewConfig = this.props.viewConfig

        const left = `${viewConfig.get('singular')}.${fieldPath(this.props.field)}`

        this.props.addFieldFilter(this.props.field.toJS(), {
            left,
            operator: equalityOperator(left, this.props.schemas),
            right: resolveLiteral(newValue, left)
        })

        // trigger add callback
        this.props.onAdd()

        // trigger close callback
        this.props.onClose()
    }

    // query search from server and save it in state
    onSearch = (query) => {
        // Fields that already have an enum don't need to have a search
        if (this.props.field.getIn(['filter', 'enum'])) {
            return
        }

        this.props.fieldEnumSearch(this.props.field, query)
            .then((data) => {
                this.setState({
                    enum: data
                })
            })
    }

    _closeOnClickOutside = (e) => {
        const hasClickedInComponent = this.refs.filterDropdown && $(this.refs.filterDropdown)[0].contains(e.target)

        if (!hasClickedInComponent) {
            this.props.onClose()
        }
    }

    // render a search input if the field is searchable
    renderSearch = () => {
        const field = this.props.field

        if (!field.getIn(['filter', 'type'])) {
            return
        }

        return (
            <div className="ui icon search input">
                <Search
                    autofocus
                    className="medium"
                    onChange={this.onSearch}
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

        if (!(field.get('filter') || this.state.enum)) {
            return
        }

        return (
            <div
                ref="filterDropdown"
                className="filter-dropdown"
            >
                <div className="ui simple dropdown active visible">
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
    onClose: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
}

FilterDropdown.defaultProps = {
    onClose: _noop,
    onAdd: _noop,
}

const mapStateToProps = (state) => {
    return {
        schemas: schemasSelectors.getSchemas(state),
    }
}

const mapDispatchToProps = {
    fieldEnumSearch,
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterDropdown)
