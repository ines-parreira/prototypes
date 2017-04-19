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
    PopoverTitle,
    PopoverContent,
} from 'reactstrap'

import * as ViewsActions from '../../../../state/views/actions'
import * as UsersActions from '../../../../state/users/actions'
import UserForm from '../../common/components/UserForm'
import Modal from '../../../common/components/Modal'

class UserListActions extends React.Component {
    state = {
        isUserFormOpen: false,
        askDeleteConfirmation: false,
    }

    _bulkDelete = () => {
        const {actions, view, selectedItemsIds} = this.props
        this.setState({askDeleteConfirmation: false})
        return actions.views.bulkDelete(view, selectedItemsIds)
    }

    _openModal = () => {
        this.setState({isUserFormOpen: true})
    }

    _closeModal = () => {
        this.setState({isUserFormOpen: false})
    }

    _fetchView = () => {
        this.props.actions.views.fetchPage(1)
    }

    _toggleDeleteConfirmation = () => {
        this.setState({askDeleteConfirmation: !this.state.askDeleteConfirmation})
    }

    _renderBulkActions = () => {
        return (
            <div className="d-inline-flex align-items-center">
                <UncontrolledButtonDropdown
                    className="mr-2"
                >
                    <DropdownToggle
                        id="bulk-more-button"
                        color="secondary"
                        caret
                        type="button"
                    >
                        More
                    </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem
                            type="button"
                            className="text-danger"
                            onClick={this._toggleDeleteConfirmation}
                        >
                            Delete users
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
                <Popover
                    placement="bottom"
                    isOpen={this.state.askDeleteConfirmation}
                    target="bulk-more-button"
                    toggle={this._toggleDeleteConfirmation}
                >
                    <PopoverTitle>Are you sure?</PopoverTitle>
                    <PopoverContent>
                        <p>
                            Are you sure you want to delete {this.props.selectedItemsIds.size}{' '}
                            user{this.props.selectedItemsIds.size > 1 && 's'}?
                        </p>
                        <Button
                            color="success"
                            onClick={this._bulkDelete}
                        >
                            Confirm
                        </Button>
                    </PopoverContent>
                </Popover>
            </div>
        )
    }

    render() {
        const areBulkActionsDisplayed = !this.props.selectedItemsIds.isEmpty()

        return (
            <div className="d-inline-flex align-items-center pull-right">
                {areBulkActionsDisplayed && this._renderBulkActions()}

                <Button
                    color="primary"
                    onClick={this._openModal}
                >
                    Add user
                </Button>

                <Modal
                    isOpen={this.state.isUserFormOpen}
                    onClose={this._closeModal}
                    header="Add user"
                >
                    <UserForm
                        closeModal={this._closeModal}
                        onSuccess={this._fetchView}
                    />
                </Modal>
            </div>
        )
    }
}

UserListActions.propTypes = {
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

export default connect(null, mapDispatchToProps)(UserListActions)
