import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Button,
    Popover,
    PopoverHeader,
    PopoverBody,
} from 'reactstrap'
import _isUndefined from 'lodash/isUndefined'

import shortcutManager from '../../../../services/shortcutManager/index.ts'

import * as customersActions from '../../../../state/customers/actions.ts'
import * as viewsSelectors from '../../../../state/views/selectors.ts'

import css from './CustomerListActions.less'

class CustomerListActions extends React.Component {
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
        const {actions, selectedItemsIds} = this.props
        this.toggleDeleteConfirmation(false)
        return actions.customers.bulkDeleteCustomer(selectedItemsIds)
    }

    toggleActionsDropdown = (visible) => {
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
        const {
            allViewItemsSelected,
            getViewCount,
            view,
            selectedItemsIds,
        } = this.props

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
                            onClick={this.toggleActionsDropdown}
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
                        <Button
                            type="submit"
                            color="success"
                            onClick={this._bulkDelete}
                            autoFocus
                        >
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

CustomerListActions.propTypes = {
    view: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired, // tickets actions
    selectedItemsIds: PropTypes.object.isRequired, // list of ids of selected tickets
    allViewItemsSelected: PropTypes.bool.isRequired,
    getViewCount: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
    return {
        allViewItemsSelected: viewsSelectors.areAllActiveViewItemsSelected(
            state
        ),
        getViewCount: viewsSelectors.makeGetViewCount(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            customers: bindActionCreators(customersActions, dispatch),
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomerListActions)
