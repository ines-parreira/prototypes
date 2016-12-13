import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import * as ViewsActions from '../../../../state/views/actions'
import * as UsersActions from '../../../../state/users/actions'
import UserForm from '../../common/components/UserForm'
import Modal from '../../../common/components/Modal'

class UserListActions extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isUserFormOpen: false
        }
    }

    componentDidUpdate(prevProps) {
        const prevAreBulkActionsDisplayed = prevProps.selectedItemsIds.size > 0
        const areBulkActionsDisplayed = this.props.selectedItemsIds.size > 0

        if (!prevAreBulkActionsDisplayed && areBulkActionsDisplayed) {
            $(this.refs.bulkMoreDropdown).dropdown({
                hoverable: true,
                on: 'click',
                action: (text, value) => {
                    switch (value) {
                        case 'delete':
                            this._bulkDelete()
                            break
                        default:
                            break
                    }

                    $(this.refs.bulkMoreDropdown).dropdown('hide')
                }
            })
        }
    }

    _bulkDelete() {
        const {actions, view, selectedItemsIds} = this.props
        const message = `Are you sure you want to delete ${selectedItemsIds.size} users ?`
        if (window.confirm(message)) {
            actions.views.bulkDelete(view, selectedItemsIds)
        }
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

    renderBulkActions() {
        return (
            <div className="flex-spaced-row">
                <div className="BulkAction ui tiny buttons">
                    <div
                        ref="bulkMoreDropdown"
                        className="ui basic grey button floating dropdown"
                    >
                        More <i className="dropdown icon" />
                        <div className="menu">
                            <div
                                className="red text item"
                                data-value="delete"
                            >
                                Delete users
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const {hasBulkActions} = this.props
        const areBulkActionsDisplayed = this.props.selectedItemsIds.size > 0

        if (!hasBulkActions) {
            return null
        }

        return (
            <div className="flex-spaced-row bulk-actions">
                <ReactCSSTransitionGroup
                    transitionName="fade"
                    transitionAppear
                    transitionAppearTimeout={200}
                    transitionEnterTimeout={200}
                    transitionLeaveTimeout={200}
                >
                    {areBulkActionsDisplayed && this.renderBulkActions()}
                </ReactCSSTransitionGroup>

                <button
                    className="ui tiny green button"
                    onClick={this._openModal}
                >
                    Add user
                </button>

                <Modal
                    isOpen={this.state.isUserFormOpen}
                    onRequestClose={this._closeModal}
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
    hasBulkActions: PropTypes.bool.isRequired
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
