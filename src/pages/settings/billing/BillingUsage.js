import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
import {Card, CardGroup, Row, Col} from 'reactstrap'
import * as billingSelectors from '../../../state/billing/selectors'
import Loader from '../../common/components/Loader'
import {fetchCurrentUsage} from '../../../state/billing/actions'
import {openChat} from '../../../utils'

export class BillingUsage extends Component {
    static propTypes = {
        fetchCurrentUsage: PropTypes.func.isRequired,
        currentUsage: PropTypes.object.isRequired,
    }

    state = {
        isLoading: false,
    }

    componentWillMount() {
        this.setState({isLoading: true})
        this.props.fetchCurrentUsage().then(() => {
            this.setState({isLoading: false})
        })
    }

    render() {
        const {currentUsage} = this.props
        if (this.state.isLoading) {
            return <Loader/>
        }

        return (
            <div className="mb-4">
                <h4>
                    Extra tickets cost:{' '}
                    <small className="text-faded">
                        {moment(currentUsage.getIn(['meta', 'start_datetime'])).format('MMM DD')}
                        {' - '}
                        {moment(currentUsage.getIn(['meta', 'end_datetime'])).format('MMM DD')}
                    </small>
                </h4>

                <Row className="mb-2">
                    <Col sm="4">
                        <CardGroup>
                            <Card block className="text-center">
                                <h3>
                                    {currentUsage.getIn(['data', 'extra_tickets'])}
                                </h3>
                                <div>
                                    tickets
                                </div>
                            </Card>
                            <Card block className="text-center">
                                <h3>
                                    ${currentUsage.getIn(['data', 'cost'])}
                                </h3>
                                <div>
                                    cost
                                </div>
                            </Card>
                        </CardGroup>
                    </Col>
                </Row>

                <p>
                    If you have any questions or if you want to unsubscribe, please
                    contact us at <a href="mailto:support@gorgias.io">support@gorgias.io</a> or
                    {' '}
                    <a href="" onClick={openChat}>Live Chat</a>.
                </p>
            </div>
        )
    }
}

export default connect((state) => {
    return {
        currentUsage: billingSelectors.currentUsage(state),
    }
}, {fetchCurrentUsage})(BillingUsage)
