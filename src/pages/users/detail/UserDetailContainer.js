import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'

import * as UsersActions from '../../../state/users/actions'

import {Loader} from '../../common/components/Loader'
import UserForm from '../common/components/UserForm'
import Timeline from '../../common/components/timeline/Timeline'
import Modal from '../../common/components/Modal'

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
                return state.users.getIn(['active', 'id'], '').toString() === id.toString()
            }
        }))
    }

    _renderTimeline = () => {
        const {users} = this.props

        if (users.getIn(['_internal', 'loading', 'history'], false)) {
            return <Loader message="Loading history..." />
        }

        if (users.getIn(['userHistory', 'triedLoading'], true) && !users.getIn(['userHistory', 'hasHistory'], false)) {
            return <p>The user has no activity recorded</p>
        }
        return (
            <Timeline
                isDisplayed
                userHistory={this.props.users.get('userHistory')}
            />
        )
    }

    _openModal = () => {
        this.setState({isUserFormOpen: true})
    }

    _closeModal = () => {
        this.setState({isUserFormOpen: false})
    }

    render() {
        const {users, activeUser} = this.props

        const shouldDisplayLoader = activeUser.isEmpty()
            || users.getIn(['_internal', 'loading', 'active'], false)

        if (shouldDisplayLoader) {
            return <Loader message="Loading user..." />
        }

        return (
            <div className="UserDetailContainer">
                <div className="flex-spaced-row">
                    <h1>{activeUser.get('name')}</h1>
                    {/*
                     <div className="ui buttons">
                     <button className="ui button green">
                     Create ticket
                     </button>
                     </div>
                     */}
                    <button
                        className="ui tiny green button"
                        onClick={this._openModal}
                    >
                        Edit user
                    </button>
                </div>

                {this._renderTimeline()}

                <Modal
                    isOpen={this.state.isUserFormOpen}
                    onRequestClose={this._closeModal}
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
}

function mapStateToProps(state) {
    return {
        activeUser: state.users.get('active', fromJS({})),
        users: state.users,
        currentUser: state.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(UsersActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserDetailContainer)
