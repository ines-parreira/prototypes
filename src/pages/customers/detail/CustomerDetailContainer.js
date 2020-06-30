import React from 'react'
import PropTypes from 'prop-types'
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

import {
    getCustomerHistory,
    getActiveCustomer,
    makeIsLoading,
} from '../../../state/customers/selectors'
import * as customersHelpers from '../../../state/customers/helpers'

class CustomerDetailContainer extends React.Component {
    state = {
        isCustomerFormOpen: false,
    }

    componentWillMount() {
        const {params} = this.props
        this._fetchCustomer(params.customerId)
    }

    componentWillReceiveProps(nextProps) {
        const {params} = this.props

        if (nextProps.params.customerId !== params.customerId) {
            this._fetchCustomer(nextProps.params.customerId)
        }
    }

    _fetchCustomer = (id) => {
        const {actions} = this.props

        actions.fetchCustomer(id).then(() =>
            actions.fetchCustomerHistory(id, {
                successCondition(state) {
                    // its OK to be based on active customer since the history is fetched when the customer is already fetched
                    return (
                        getActiveCustomer(state).get('id', '').toString() ===
                        id.toString()
                    )
                },
            })
        )
    }

    _renderTimeline = () => {
        const {customerHistory, customersIsLoading} = this.props

        if (customersIsLoading('history')) {
            return <Loader message="Loading history..." />
        }

        const historyLength = customerHistory.get('tickets', fromJS([])).size

        if (customerHistory.get('triedLoading', true) && !historyLength) {
            return <p>This customer has no activity recorded</p>
        }

        return (
            <div className="my-4">
                <Timeline customerHistory={customerHistory} displayAll revert />
            </div>
        )
    }

    _openModal = () => {
        this.setState({isCustomerFormOpen: true})
    }

    _closeModal = () => {
        this.setState({isCustomerFormOpen: false})
    }

    render() {
        const {activeCustomer, customersIsLoading} = this.props

        const shouldDisplayLoader =
            activeCustomer.isEmpty() || customersIsLoading('active')

        if (shouldDisplayLoader) {
            return <Loader message="Loading customer..." />
        }

        return (
            <div className="CustomerDetailContainer">
                <div className="flex-spaced-row">
                    <h1>{customersHelpers.getDisplayName(activeCustomer)}</h1>

                    <div>
                        <Link
                            className="btn btn-secondary mr-2"
                            to={`/app/ticket/new?customer=${activeCustomer.get(
                                'id'
                            )}`}
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
                    isOpen={this.state.isCustomerFormOpen}
                    onClose={this._closeModal}
                    header={`Update customer: ${activeCustomer.get('name')}`}
                >
                    <CustomerForm
                        customer={activeCustomer}
                        closeModal={this._closeModal}
                    />
                </Modal>
            </div>
        )
    }
}

CustomerDetailContainer.propTypes = {
    params: PropTypes.shape({
        customerId: PropTypes.string,
    }).isRequired,

    activeCustomer: PropTypes.object.isRequired,
    customerHistory: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,

    actions: PropTypes.object.isRequired,
    customersIsLoading: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
    return {
        activeCustomer: getActiveCustomer(state),
        customerHistory: getCustomerHistory(state),
        currentUser: state.currentUser,
        customersIsLoading: makeIsLoading(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(customersActions, dispatch),
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CustomerDetailContainer)
