import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Popover,
    PopoverBody,
    PopoverHeader,
    UncontrolledButtonDropdown,
} from 'reactstrap'
import _isUndefined from 'lodash/isUndefined'
import {List, Map} from 'immutable'

import shortcutManager from 'services/shortcutManager/index'
import {bulkDeleteCustomer} from 'state/customers/actions'
import {
    areAllActiveViewItemsSelected,
    makeGetViewCount,
} from 'state/views/selectors'
import {RootState} from 'state/types'
import Button from 'pages/common/components/button/Button'

import css from './CustomerListActions.less'

type Props = {
    selectedItemsIds: List<any>
    view: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    popoverOpen: string
    displayDeleteConfirmation: boolean
}

class CustomerListActions extends Component<Props, State> {
    state = {
        popoverOpen: '',
        displayDeleteConfirmation: false,
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('CustomerListActions')
    }

    _bindKeys = () => {
        shortcutManager.bind('CustomerListActions', {
            DELETE_CUSTOMER: {
                action: () => {
                    if (!this._hasChecked()) {
                        return
                    }
                    this.toggleDeleteConfirmation()
                },
            },
            HIDE_POPOVER: {
                key: 'esc',
                action: () => {
                    this._togglePopover()
                },
            },
        })
    }

    _hasChecked = () => {
        return !this.props.selectedItemsIds.isEmpty()
    }

    _isPopoverOpen = (popoverOpen: string) => {
        return this.state.popoverOpen === popoverOpen
    }

    _togglePopover = (popoverOpen = '') => {
        return this.setState({popoverOpen})
    }

    _bulkDelete = () => {
        const {bulkDeleteCustomer, selectedItemsIds} = this.props
        this.toggleDeleteConfirmation()
        return bulkDeleteCustomer(selectedItemsIds)
    }

    toggleActionsDropdown = (visible: boolean) => {
        const opens = !_isUndefined(visible)
            ? visible
            : !this._isPopoverOpen('delete')
        this._togglePopover(opens ? 'delete' : '')
        this.toggleDeleteConfirmation()
    }

    toggleDeleteConfirmation = () => {
        this.setState({
            displayDeleteConfirmation: !this.state.displayDeleteConfirmation,
        })
    }

    _renderBulkActions = () => {
        const {allViewItemsSelected, getViewCount, view, selectedItemsIds} =
            this.props

        const areItemsSelected = this._hasChecked()

        const selectedCount = allViewItemsSelected
            ? getViewCount(view.get('id'))
            : selectedItemsIds.size

        return (
            <div className="d-inline-flex align-items-center">
                <UncontrolledButtonDropdown size="sm">
                    <DropdownToggle
                        color="secondary"
                        type="button"
                        caret
                        disabled={!areItemsSelected}
                    >
                        Actions
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem
                            type="button"
                            className="text-danger"
                            onClick={this.toggleActionsDropdown as any}
                        >
                            Delete customers
                        </DropdownItem>
                    </DropdownMenu>
                    <div
                        className={css['delete-popover-target']}
                        id="bulk-more-button"
                    />
                </UncontrolledButtonDropdown>
                <Popover
                    placement="bottom"
                    isOpen={this.state.displayDeleteConfirmation}
                    target="bulk-more-button"
                    toggle={this.toggleDeleteConfirmation}
                    trigger="legacy"
                >
                    <PopoverHeader>Are you sure?</PopoverHeader>
                    <PopoverBody>
                        <p>
                            Are you sure you want to delete {selectedCount}{' '}
                            customer{selectedCount > 1 && 's'}?
                        </p>
                        <Button autoFocus onClick={this._bulkDelete}>
                            Confirm
                        </Button>
                    </PopoverBody>
                </Popover>
            </div>
        )
    }

    render() {
        return (
            <div className="d-none d-md-inline-flex align-items-center">
                {this._renderBulkActions()}
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        allViewItemsSelected: areAllActiveViewItemsSelected(state),
        getViewCount: makeGetViewCount(state),
    }),
    {
        bulkDeleteCustomer,
    }
)

export default connector(CustomerListActions)
