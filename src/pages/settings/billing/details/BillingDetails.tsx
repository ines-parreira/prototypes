import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import {Button, Card, CardBody, Row, Col} from 'reactstrap'
import {Map} from 'immutable'

import {fetchContact} from '../../../../state/billing/actions'
import {getContact} from '../../../../state/billing/selectors'
import Loader from '../../../common/components/Loader/Loader'
import countries from '../../../../config/countries.json'
import {RootState} from '../../../../state/types'

import css from './BillingDetails.less'

type Props = ConnectedProps<typeof connector>

type State = {
    isLoading: boolean
}

export class BillingDetailsContainer extends Component<Props, State> {
    state = {
        isLoading: true,
    }

    componentDidMount() {
        this.props.fetchContact().finally(() => {
            this.setState({isLoading: false})
        })
    }

    render() {
        if (this.state.isLoading) {
            return <Loader />
        }

        if (!this.props.contact) {
            return null
        }

        const {contact} = this.props
        const shipping = contact.get('shipping') as Map<any, any>
        const address = shipping.get('address') as Map<any, any>

        // If all address properties contain an empty string, the contact doesn't have a shipping address.
        const hasAddress = !address.filterNot((value) => value === '').isEmpty()

        let country = (countries as {value: string; label: string}[]).find(
            (country) => country.value === address.get('country')
        )
        country = country ? country.label : address.get('country')

        return (
            <div className="mb-5">
                <h4>
                    <i className="material-icons">notes</i> Billing details
                </h4>
                <p>
                    This information will appear on your next invoice. Invoices
                    are sent to the billing email address below.
                </p>
                <Card>
                    <CardBody>
                        <Row>
                            <Col sm={4}>
                                <address className={css.address}>
                                    <dt>Billing email:</dt>
                                    <dd>{contact.get('email')}</dd>
                                    <br />
                                    <dt>Company:</dt>
                                    <dd>{shipping.get('name') || '-'}</dd>
                                    <br />
                                    <dt>Address:</dt>
                                    {hasAddress ? (
                                        <dd>
                                            <div>{address.get('line1')}</div>
                                            <div>{address.get('line2')}</div>
                                            <div>
                                                {[
                                                    address.get('city'),
                                                    address.get('state'),
                                                    address.get('postal_code'),
                                                ].join(' ')}
                                            </div>
                                            <div>{country}</div>
                                        </dd>
                                    ) : (
                                        <dd>-</dd>
                                    )}
                                    <br />
                                    <dt>Phone:</dt>
                                    <dd>{shipping.get('phone') || '-'}</dd>
                                </address>
                            </Col>
                            <Col
                                sm={{size: 4, offset: 4}}
                                className={'text-right'}
                            >
                                <Button
                                    tag={Link}
                                    to="/app/settings/billing/update-billing-details"
                                >
                                    Update billing details
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        contact: getContact(state),
    }),
    {fetchContact}
)

export default connector(BillingDetailsContainer)
