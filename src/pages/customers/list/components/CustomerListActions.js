import React, {PropTypes} from 'react'
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

import shortcutManager from '../../../../services/shortcutManager'

import * as ViewsActions from '../../../../state/views/actions'
import * as UsersActions from '../../../../state/customers/actions'

class CustomerListActions extends React.Component {
    state = {
        popoverOpen: ''
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
                    this._toggleDeleteConfirmation()
                }
            },
            HIDE_POPOVER: {
                key: 'esc',
                action: () => {
                    this._togglePopover()
                }
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
        const {actions, view, selectedItemsIds} = this.props
        this._toggleDeleteConfirmation(false)
        return actions.views.bulkDelete(view, selectedItemsIds)
    }

    _toggleDeleteConfirmation = (visible) => {
        const opens = !_isUndefined(visible) ? visible : !this._isPopoverOpen('delete')
        this._togglePopover(opens ? 'delete' : '')
    }

    _renderBulkActions = () => {
        const areItemsSelected = this._hasChecked()

        return (
            <div className="d-inline-flex align-items-center">
                <UncontrolledButtonDropdown
                    size="sm"
                >
                    <DropdownToggle
                        id="bulk-more-button"
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
                            onClick={this._toggleDeleteConfirmation}
                        >
                            Delete customers
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
                <Popover
                    placement="bottom"
                    isOpen={this._isPopoverOpen('delete')}
                    target="bulk-more-button"
                    toggle={this._toggleDeleteConfirmation}
                >
                    <PopoverHeader>Are you sure?</PopoverHeader>
                    <PopoverBody>
                        <p>
                            Are you sure you want to delete {this.props.selectedItemsIds.size}{' '}
                            customer{this.props.selectedItemsIds.size > 1 && 's'}?
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
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            views: bindActionCreators(ViewsActions, dispatch),
            users: bindActionCreators(UsersActions, dispatch),
        }
    }
}

export default connect(null, mapDispatchToProps)(CustomerListActions)
