// @flow
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Container,
    Form,
    Row,
    Col,
} from 'reactstrap'
import classNames from 'classnames'

import {fetchContact, updateContact} from '../../../../state/billing/actions.ts'
import {getContact} from '../../../../state/billing/selectors.ts'
import Loader from '../../../common/components/Loader'
import PageHeader from '../../../common/components/PageHeader'
import InputField from '../../../common/forms/InputField'

import countries from '../../../../config/countries.json'

import {type billingContactType} from '../../../../state/billing/types'

type Props = {
    contact: billingContactType | null,
    fetchContact: () => Promise<billingContactType>,
    updateContact: (billingContactType) => Promise<billingContactType>,
}

type State = {
    contact: billingContactType | null,
    isLoading: boolean,
    isSubmitting: boolean,
}

export class BillingDetailsForm extends Component<Props, State> {
    state = {
        isLoading: false,
        isSubmitting: false,
        contact: null,
    }

    constructor(props: Props) {
        super(props)
        // A `null` contact value means we have never tried to fetch it before (it's not in the initial state),
        // so we need to do it now!
        if (props.contact === null) {
            this.state.isLoading = true
        }
    }

    componentDidMount() {
        if (this.props.contact === null) {
            this.setState({isLoading: true})
            // $FlowFixMe
            this.props.fetchContact().finally(() => {
                this.setState({isLoading: false})
            })
        } else {
            this.setState({contact: this.props.contact})
        }
    }

    static getDerivedStateFromProps(props: Props, state: State) {
        if (!state.contact && props.contact) {
            return {contact: props.contact}
        }
        return null
    }

    _submit = (event: SyntheticEvent<*>) => {
        event.preventDefault()
        this.setState({
            isSubmitting: true,
        })

        // $FlowFixMe
        return this.props.updateContact(this.state.contact).finally(() => {
            this.setState({isSubmitting: false})
        })
    }

    _getInputProps = (contact: billingContactType, path: Array<string>) => ({
        value: contact.getIn(path, ''),
        onChange: (value: mixed) =>
            this.setState({
                contact: contact.setIn(path, value),
            }),
    })

    render() {
        const addressPath = ['shipping', 'address']
        const {contact, isLoading} = this.state

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link
                                    className="section"
                                    to="/app/settings/billing/"
                                >
                                    Billing & Usage
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>Billing details</BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <Container fluid className="page-container">
                    <p>
                        Please enter the billing details you'd like us to use on
                        your next invoice.
                    </p>
                    <Row>
                        <Col lg={6}>
                            {isLoading ? (
                                <Loader />
                            ) : (
                                contact && (
                                    <Form onSubmit={this._submit}>
                                        <InputField
                                            type="email"
                                            name="email"
                                            label="Billing email"
                                            help="Invoices are sent to this email address."
                                            required
                                            {...this._getInputProps(contact, [
                                                'email',
                                            ])}
                                        />
                                        <InputField
                                            type="text"
                                            name="name"
                                            label="Company name"
                                            placeholder="My Company"
                                            {...this._getInputProps(contact, [
                                                'shipping',
                                                'name',
                                            ])}
                                        />
                                        <InputField
                                            type="text"
                                            name="phone"
                                            label="Phone number"
                                            placeholder="415 859 3010"
                                            {...this._getInputProps(contact, [
                                                'shipping',
                                                'phone',
                                            ])}
                                        />
                                        <InputField
                                            type="text"
                                            name="line1"
                                            label="Address (line 1)"
                                            placeholder="123 Post St"
                                            {...this._getInputProps(contact, [
                                                ...addressPath,
                                                'line1',
                                            ])}
                                        />
                                        <InputField
                                            type="text"
                                            name="line2"
                                            label="Address (line 2)"
                                            placeholder="2nd floor"
                                            {...this._getInputProps(contact, [
                                                ...addressPath,
                                                'line2',
                                            ])}
                                        />
                                        <Row>
                                            <Col lg={6}>
                                                <InputField
                                                    type="text"
                                                    name="city"
                                                    label="City"
                                                    placeholder="San Francisco"
                                                    {...this._getInputProps(
                                                        contact,
                                                        [...addressPath, 'city']
                                                    )}
                                                />
                                            </Col>
                                            <Col lg={3}>
                                                <InputField
                                                    type="text"
                                                    name="state"
                                                    label="State"
                                                    placeholder="CA"
                                                    {...this._getInputProps(
                                                        contact,
                                                        [
                                                            ...addressPath,
                                                            'state',
                                                        ]
                                                    )}
                                                />
                                            </Col>
                                            <Col lg={3}>
                                                <InputField
                                                    type="text"
                                                    name="postalCode"
                                                    label="Postal code"
                                                    placeholder="94103"
                                                    {...this._getInputProps(
                                                        contact,
                                                        [
                                                            ...addressPath,
                                                            'postal_code',
                                                        ]
                                                    )}
                                                />
                                            </Col>
                                        </Row>
                                        <InputField
                                            type="select"
                                            name="country"
                                            label="Country"
                                            {...this._getInputProps(contact, [
                                                ...addressPath,
                                                'country',
                                            ])}
                                        >
                                            <option value={''}>-</option>
                                            {countries.map((country) => (
                                                <option
                                                    value={country.value}
                                                    key={country.value}
                                                >
                                                    {country.label}
                                                </option>
                                            ))}
                                        </InputField>
                                        <div>
                                            <Button
                                                color="success"
                                                className={classNames({
                                                    'btn-loading': this.state
                                                        .isSubmitting,
                                                })}
                                                disabled={
                                                    this.state.isSubmitting
                                                }
                                            >
                                                Update billing details
                                            </Button>
                                        </div>
                                    </Form>
                                )
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default connect(
    (state) => ({
        contact: getContact(state),
    }),
    {fetchContact, updateContact}
)(BillingDetailsForm)
