import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {
    Dropdown,
    DropdownMenu,
    DropdownItem,
    DropdownToggle,
} from 'reactstrap'

import Search from '../Search'
import {RenderLabel} from '../../utils/labels'
import {resolveLiteral, isImmutable, fieldPath, getLanguageDisplayName} from '../../../../utils'
import {fieldEnumSearch} from '../../../../state/views/actions'

import * as schemasSelectors from '../../../../state/schemas/selectors'
import * as customersHelpers from '../../../../state/customers/helpers'

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

    _left = () => {
        const viewConfig = this.props.viewConfig
        return `${viewConfig.get('singular')}.${fieldPath(this.props.field)}`
    }

    onClick = (newValue) => {
        const left = this._left()
        // if value cannot be resolved, we use the `id` attribute of the object given
        // Useful with `ticket.messages.integration_id` field
        // because `newValue` do not have an `integration_id` attribute
        const right = resolveLiteral(newValue, left) || newValue.id
        this.props.updateFieldFilter(right)
    }

    _onClickUnassigned = () => {
        this.props.updateFieldFilterOperator('isEmpty')
    }

    _onClickMe = () => {
        this.props.updateFieldFilter('{{current_user.id}}')
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
                    autoFocus
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

        let options = this.state.enum.map((value, key) => {
            let renderValue = value

            // special displays for some columns in the dropdown
            if (field.get('name') === 'tags') {
                // display tags as tags
                renderValue = value.get('name')
            } else if (field.get('name') === 'customer') {
                renderValue = customersHelpers.getDisplayName(value)
            } else if (field.get('name') === 'language') {
                renderValue = getLanguageDisplayName(value)
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

        // special option added for some columns in the dropdown
        if (field.get('name') === 'assignee') {
            options = options.unshift(
                <DropdownItem
                    key="unassigned"
                    type="button"
                    onClick={this._onClickUnassigned}
                >
                    Unassigned
                </DropdownItem>,
                <DropdownItem
                    key="me"
                    type="button"
                    onClick={this._onClickMe}
                >
                    Me (current user)
                </DropdownItem>,
                <DropdownItem
                    key="unassigned-divider"
                    divider
                />
            )
        }

        return options
    }

    render() {
        const field = this.props.field

        if (!(field.get('filter') || this.state.enum)) {
            return null
        }

        const canSearch = !!field.getIn(['filter', 'type'])
        const width = field.getIn(['dropdown', 'width'], '230px')

        const style = {
            width: canSearch && width
        }

        if (field.get('name') === 'language') {
            Object.assign(style, {height: '230px', overflow: 'scroll'})
        }

        return (
            <Dropdown
                isOpen
                toggle={this.props.toggleDropdown}
            >
                <DropdownToggle tag="span"></DropdownToggle>
                <DropdownMenu
                    style={style}
                >
                    {this.renderSearch()}
                    {this.renderEnum()}
                </DropdownMenu>
            </Dropdown>
        )
    }
}

FilterDropdown.propTypes = {
    viewConfig: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    updateFieldFilter: PropTypes.func.isRequired,
    updateFieldFilterOperator: PropTypes.func.isRequired,
    fieldEnumSearch: PropTypes.func.isRequired,
    toggleDropdown: PropTypes.func.isRequired,
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
