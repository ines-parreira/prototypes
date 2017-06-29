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

class UserListActions extends React.Component {
    state = {
        askDeleteConfirmation: false,
    }

    _bulkDelete = () => {
        const {actions, view, selectedItemsIds} = this.props
        this.setState({askDeleteConfirmation: false})
        return actions.views.bulkDelete(view, selectedItemsIds)
    }

    _toggleDeleteConfirmation = () => {
        this.setState({askDeleteConfirmation: !this.state.askDeleteConfirmation})
    }

    _renderBulkActions = () => {
        const areItemsSelected = !this.props.selectedItemsIds.isEmpty()

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
                            type="submit"
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
        return (
            <div className="d-inline-flex align-items-center">
                {this._renderBulkActions()}
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
