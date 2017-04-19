import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'
import onClickOutside from 'react-onclickoutside'
import {
    UncontrolledDropdown,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'

import Search from '../Search'
import {RenderLabel} from '../../utils/labels'
import {equalityOperator, resolveLiteral, isImmutable, fieldPath} from '../../../../utils'
import {fieldEnumSearch} from '../../../../state/views/actions'

import * as schemasSelectors from '../../../../state/schemas/selectors'

@onClickOutside
class FilterDropdown extends React.Component {
    state = {
        isLoading: false,
    }

    constructor(props) {
        super(props)
        this.state = {
            enum: props.field.getIn(['filter', 'enum'], fromJS([]))
        }
    }

    componentDidMount() {
        this.onSearch()
    }

    // used by onClickOutside HOC
    handleClickOutside = () => {
        this.props.onClose()
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

        this.setState({
            isLoading: true,
        })

        this.props.fieldEnumSearch(this.props.field, query)
            .then((data) => {
                this.setState({
                    enum: data,
                    isLoading: false,
                })
            })
    }

    renderSearch = () => {
        const field = this.props.field

        if (!field.getIn(['filter', 'type'])) {
            return null
        }

        return [
            <DropdownItem
                key="search"
                header
                className="dropdown-item-input"
            >
                <Search
                    autofocus
                    onChange={this.onSearch}
                    searchDebounceTime={300}
                />
            </DropdownItem>,
            <DropdownItem
                key="divider"
                divider
            />
        ]
    }

    renderEnum = () => {
        const field = this.props.field

        if (!this.state.enum) {
            return null
        }

        if (this.state.isLoading) {
            return (
                <DropdownItem disabled>
                    <i className="fa fa-fw fa-circle-o-notch fa-spin mr-2" />
                    Loading...
                </DropdownItem>
            )
        }

        if (this.state.enum.isEmpty()) {
            return (
                <DropdownItem header>
                    Could not find anything like this
                </DropdownItem>
            )
        }

        return this.state.enum.map((value, key) => {
            let renderValue = value

            // special displays for some properties in the dropdown
            if (field.get('name') === 'tags') {
                // display tags as tags
                renderValue = value.get('name')
            } else if (typeof value === 'object' || field.get('name') === 'roles') {
                renderValue = (
                    <RenderLabel
                        field={field}
                        value={value}
                    />
                )
            }

            const passedValue = isImmutable(value) ? value.toJS() : value

            return (
                <DropdownItem
                    key={key}
                    type="button"
                    onClick={() => this.onClick(passedValue)}
                >
                    {renderValue}
                </DropdownItem>
            )
        })
    }

    render() {
        const field = this.props.field

        if (!(field.get('filter') || this.state.enum)) {
            return null
        }

        const canSearch = !!field.getIn(['filter', 'type'])

        return (
            <UncontrolledDropdown isOpen>
                <DropdownMenu
                    style={{
                        width: canSearch && '230px',
                    }}
                >
                    {this.renderSearch()}
                    {this.renderEnum()}
                </DropdownMenu>
            </UncontrolledDropdown>
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
