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
import BillingHeader from '../common/BillingHeader'

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

        const country: string =
            (countries as {value: string; label: string}[]).find(
                (country) => country.value === address.get('country')
            )?.label ?? address.get('country')

        return (
            <div className={css.wrapper}>
                <BillingHeader icon="person_pin">Billing address</BillingHeader>
                <Card>
                    <CardBody>
                        <Row className={css.row}>
                            <Col sm={8}>
                                <address className={css.address}>
                                    <dt>Billing email:</dt>
                                    <dd>{contact.get('email')}</dd>
                                    <br />
                                    {hasAddress ? (
                                        <>
                                            <dt>Company name:</dt>
                                            <dd>
                                                {shipping.get('name') || '–'}
                                            </dd>
                                            <br />
                                            <dt>Phone number:</dt>
                                            <dd>
                                                {shipping.get('phone') || '–'}
                                            </dd>
                                            <br />
                                            <dt>Address:</dt>
                                            <dd>
                                                {[
                                                    address.get('line1'),
                                                    address.get('line2'),
                                                    address.get('city'),
                                                    address.get('state'),
                                                    address.get('postal_code'),
                                                ]
                                                    .filter((value) => !!value)
                                                    .join(', ')}
                                                {country && ` – ${country}`}
                                            </dd>
                                        </>
                                    ) : (
                                        <dt>No billing address</dt>
                                    )}
                                </address>
                            </Col>
                            <Col sm={4} className={'text-right'}>
                                <Button
                                    tag={Link}
                                    to="/app/settings/billing/update-billing-details"
                                >
                                    {hasAddress
                                        ? 'Change Address'
                                        : 'Add Address'}
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
