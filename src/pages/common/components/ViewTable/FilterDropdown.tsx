import {fromJS, List, Map} from 'immutable'
import React, {ComponentType, Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap'

import * as customersHelpers from '../../../../state/customers/helpers'
import * as schemasSelectors from '../../../../state/schemas/selectors'
import {fieldEnumSearch} from '../../../../state/views/actions'
import {
    fieldPath,
    getLanguageDisplayName,
    isImmutable,
    resolveLiteral,
} from '../../../../utils'
import {RenderLabel} from '../../utils/labels'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from '../../utils/withCancellableRequest'
import Search from '../Search'
import {RootState} from '../../../../state/types'

import css from './FilterDropdown.less'

type OwnProps = {
    viewConfig: Map<any, any>
    field: Map<any, any>
    updateFieldFilter: (field: string) => void
    toggleDropdown: () => void
    menu: ComponentType<any>
}

type Props = OwnProps &
    ConnectedProps<typeof connector> &
    CancellableRequestInjectedProps<
        'fieldEnumSearchCancellable',
        'cancelFieldEnumSearchCancellable',
        typeof fieldEnumSearch
    >

type State = {
    isLoading: boolean
    enum: Maybe<List<any>>
}

class FilterDropdown extends Component<Props, State> {
    static defaultProps: Pick<Props, 'menu'> = {
        menu: DropdownMenu,
    }

    constructor(props: Props) {
        super(props)
        this.state = {
            isLoading: false,
            enum: props.field.getIn(['filter', 'enum'], fromJS([])),
        }
    }

    componentDidMount() {
        this.onSearch('')
    }

    _left = () => {
        const viewConfig = this.props.viewConfig
        return `${viewConfig.get('singular') as string}.${fieldPath(
            this.props.field
        )}`
    }

    onClick = (newValue: Record<string, unknown>) => {
        const left = this._left()
        // if value cannot be resolved, we use the `id` attribute of the object given
        // Useful with `ticket.messages.integration_id` field
        // because `newValue` do not have an `integration_id` attribute
        const right = resolveLiteral(newValue, left) || newValue.id
        this.props.updateFieldFilter(right as string)
    }

    _onClickMe = () => {
        this.props.updateFieldFilter('{{current_user.id}}')
    }

    // query search from server and save it in state
    onSearch = (query: string) => {
        const {field, fieldEnumSearchCancellable} = this.props
        // Fields that already have an enum don't need to have a search
        if (field.getIn(['filter', 'enum'])) {
            return
        }

        this.setState({
            isLoading: true,
        })

        fieldEnumSearchCancellable(field, query)
            .then((data) => {
                if (!data) {
                    return
                }
                this.setState({
                    enum: data,
                    isLoading: false,
                })
            })
            .catch(() => {
                this.setState({
                    enum: null,
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
            <DropdownItem key="search" header className="dropdown-item-input">
                <Search
                    autoFocus
                    onChange={this.onSearch}
                    searchDebounceTime={1000}
                />
            </DropdownItem>,
            <DropdownItem key="divider" divider />,
        ]
    }

    renderEnum = () => {
        const field = this.props.field

        if (this.state.isLoading) {
            return (
                <DropdownItem disabled>
                    <i className="material-icons md-spin mr-2">refresh</i>
                    Loading...
                </DropdownItem>
            )
        }

        if (!this.state.enum) {
            return null
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
                renderValue = (value as Map<any, any>).get('name')
            } else if (field.get('name') === 'customer') {
                renderValue = customersHelpers.getDisplayName(
                    value as Map<any, any>
                )
            } else if (field.get('name') === 'language') {
                renderValue = getLanguageDisplayName(value as string)
            } else if (
                typeof value === 'object' ||
                field.get('name') === 'role'
            ) {
                renderValue = <RenderLabel field={field} value={value} />
            }

            const passedValue = isImmutable(value)
                ? (value as Map<any, any>).toJS()
                : value

            return (
                <DropdownItem
                    key={key}
                    type="button"
                    onClick={() => this.onClick(passedValue)}
                    className={css.dropdownItem}
                >
                    {renderValue}
                </DropdownItem>
            )
        }) as List<any>

        // special option added for some columns in the dropdown
        if (field.get('name') === 'assignee') {
            options = options.unshift(
                <DropdownItem key="me" type="button" onClick={this._onClickMe}>
                    Me (current user)
                </DropdownItem>,
                <DropdownItem key="unassigned-divider" divider />
            )
        }

        return options
    }

    render() {
        const {field, menu: Menu} = this.props

        if (!(field.get('filter') || this.state.enum)) {
            return null
        }

        const canSearch = !!field.getIn(['filter', 'type'])
        const width = field.getIn(['dropdown', 'width'], '230px')

        const style = {
            width: canSearch && width,
        }

        if (field.get('name') === 'language') {
            Object.assign(style, {height: '230px', overflow: 'scroll'})
        }

        return (
            <Dropdown isOpen toggle={this.props.toggleDropdown}>
                <DropdownToggle tag="span" />
                <Menu style={style}>
                    {this.renderSearch()}
                    {this.renderEnum()}
                </Menu>
            </Dropdown>
        )
    }
}

const connector = connect((state: RootState) => ({
    schemas: schemasSelectors.getSchemas(state),
}))

export default withCancellableRequest<
    'fieldEnumSearchCancellable',
    'cancelFieldEnumSearchCancellable',
    typeof fieldEnumSearch
>(
    'fieldEnumSearchCancellable',
    fieldEnumSearch
)(connector(FilterDropdown))
