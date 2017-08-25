import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {Button} from 'reactstrap'
import {Link} from 'react-router'

import * as UsersActions from '../../../state/users/actions'

import Loader from '../../common/components/Loader'
import UserForm from '../common/components/UserForm'
import Timeline from '../../common/components/timeline/Timeline'
import Modal from '../../common/components/Modal'

import {getActiveUser, makeIsLoading} from '../../../state/users/selectors'
import * as usersHelpers from '../../../state/users/helpers'

class UserDetailContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isUserFormOpen: false
        }
    }

    componentWillMount() {
        const {params} = this.props
        this._fetchUser(params.userId)
    }

    componentWillReceiveProps(nextProps) {
        const {params, actions} = this.props

        if (nextProps.params.userId !== params.userId) {
            actions.clearUser()
            this._fetchUser(nextProps.params.userId)
        }
    }

    _fetchUser = (id) => {
        const {actions} = this.props

        actions.fetchUser(id).then(() => actions.fetchUserHistory(id, {
            successCondition(state) {
                // its OK to be based on active user since the history is fetched when the user is already fetched
                return getActiveUser(state).get('id', '').toString() === id.toString()
            }
        }))
    }

    _renderTimeline = () => {
        const {users, usersIsLoading} = this.props

        if (usersIsLoading('history')) {
            return <Loader message="Loading history..." />
        }

        const historyLength = users.getIn(['userHistory', 'tickets'], fromJS([])).size

        if (users.getIn(['userHistory', 'triedLoading'], true) && !historyLength) {
            return <p>The user has no activity recorded</p>
        }

        return (
            <div className="mt-4 mb-4">
                <Timeline
                    isDisplayed
                    userHistory={this.props.users.get('userHistory')}
                    revert
                    displayAll
                />
            </div>
        )
    }

    _openModal = () => {
        this.setState({isUserFormOpen: true})
    }

    _closeModal = () => {
        this.setState({isUserFormOpen: false})
    }

    render() {
        const {activeUser, usersIsLoading} = this.props

        const shouldDisplayLoader = activeUser.isEmpty()
            || usersIsLoading('active')

        if (shouldDisplayLoader) {
            return <Loader message="Loading user..." />
        }

        return (
            <div className="UserDetailContainer">
                <div className="flex-spaced-row">
                    <h1>{usersHelpers.getDisplayName(activeUser)}</h1>

                    <div className="pull-right">
                        <Link
                            className="btn btn-secondary mr-2"
                            to={`/app/ticket/new?requester=${activeUser.get('id')}`}
                        >
                            Create ticket
                        </Link>

                        <Button
                            type="button"
                            color="success"
                            onClick={this._openModal}
                        >
                            Edit user
                        </Button>
                    </div>
                </div>

                {this._renderTimeline()}

                <Modal
                    isOpen={this.state.isUserFormOpen}
                    onClose={this._closeModal}
                    header={`Update user: ${activeUser.get('name')}`}
                >
                    <UserForm
                        user={activeUser}
                        closeModal={this._closeModal}
                    />
                </Modal>
            </div>
        )
    }
}

UserDetailContainer.propTypes = {
    params: PropTypes.shape({
        userId: PropTypes.string
    }).isRequired,

    activeUser: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,

    actions: PropTypes.object.isRequired,
    usersIsLoading: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
    return {
        activeUser: getActiveUser(state),
        users: state.users,
        currentUser: state.currentUser,
        usersIsLoading: makeIsLoading(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(UsersActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserDetailContainer)
