import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {Button} from 'reactstrap'
import {Link} from 'react-router'

import * as customersActions from '../../../state/customers/actions'

import Loader from '../../common/components/Loader'
import CustomerForm from '../common/components/CustomerForm'
import Timeline from '../../common/components/timeline/Timeline'
import Modal from '../../common/components/Modal'

import {getCustomerHistory, getActiveCustomer, makeIsLoading} from '../../../state/customers/selectors'
import * as usersHelpers from '../../../state/customers/helpers'

class CustomerDetailContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isUserFormOpen: false
        }
    }

    componentWillMount() {
        const {params} = this.props
        this._fetchCustomer(params.customerId)
    }

    componentWillReceiveProps(nextProps) {
        const {params, actions} = this.props

        if (nextProps.params.customerId !== params.customerId) {
            actions.clearCustomer()
            this._fetchCustomer(nextProps.params.customerId)
        }
    }

    componentWillUnmount() {
        this.props.actions.clearCustomer()
    }

    _fetchCustomer = (id) => {
        const {actions} = this.props

        actions.fetchCustomer(id).then(() => actions.fetchCustomerHistory(id, {
            successCondition(state) {
                // its OK to be based on active user since the history is fetched when the user is already fetched
                return getActiveCustomer(state).get('id', '').toString() === id.toString()
            }
        }))
    }

    _renderTimeline = () => {
        const {customerHistory, usersIsLoading} = this.props

        if (usersIsLoading('history')) {
            return <Loader message="Loading history..." />
        }

        const historyLength = customerHistory.get('tickets', fromJS([])).size

        if (customerHistory.get('triedLoading', true) && !historyLength) {
            return <p>This customer has no activity recorded</p>
        }

        return (
            <div className="mt-4 mb-4">
                <Timeline
                    customerHistory={customerHistory}
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

                    <div>
                        <Link
                            className="btn btn-secondary mr-2"
                            to={`/app/ticket/new?customer=${activeUser.get('id')}`}
                        >
                            Create ticket
                        </Link>

                        <Button
                            type="button"
                            color="success"
                            onClick={this._openModal}
                        >
                            Edit customer
                        </Button>
                    </div>
                </div>

                {this._renderTimeline()}

                <Modal
                    isOpen={this.state.isUserFormOpen}
                    onClose={this._closeModal}
                    header={`Update customer: ${activeUser.get('name')}`}
                >
                    <CustomerForm
                        customer={activeUser}
                        closeModal={this._closeModal}
                    />
                </Modal>
            </div>
        )
    }
}

CustomerDetailContainer.propTypes = {
    params: PropTypes.shape({
        customerId: PropTypes.string
    }).isRequired,

    activeUser: PropTypes.object.isRequired,
    customerHistory: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,

    actions: PropTypes.object.isRequired,
    usersIsLoading: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
    return {
        activeUser: getActiveCustomer(state),
        customerHistory: getCustomerHistory(state),
        currentUser: state.currentUser,
        usersIsLoading: makeIsLoading(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(customersActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomerDetailContainer)
