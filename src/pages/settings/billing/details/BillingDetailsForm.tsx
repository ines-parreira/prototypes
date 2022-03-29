import React, {Component, SyntheticEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container, Form, Row, Col} from 'reactstrap'
import {fromJS} from 'immutable'

import {fetchContact, updateContact} from 'state/billing/actions'
import {getContact} from 'state/billing/selectors'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import {RootState} from 'state/types'
import {BillingContact} from 'state/billing/types'
import Button from 'pages/common/components/button/Button'

import BillingAddressInput from '../common/BillingAddressInputs'

import css from './BillingDetailsForm.less'

type Props = ConnectedProps<typeof connector>

type State = {
    contactForm: BillingContact
    isLoading: boolean
    isSubmitting: boolean
}

export class BillingDetailsFormContainer extends Component<Props, State> {
    state: State = {
        contactForm: {
            email: '',
            shipping: {
                name: '',
                phone: '',
                address: {
                    line1: '',
                    line2: '',
                    country: '',
                    postal_code: '',
                    city: '',
                    state: '',
                },
            },
        },
        isLoading: false,
        isSubmitting: false,
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
        const {contact} = this.props
        if (contact == null) {
            this.setState({isLoading: true})
            this.props.fetchContact().finally(() => {
                this.setState({isLoading: false})
            })
        } else {
            this.setState({contactForm: contact.toJS()})
        }
    }

    componentDidUpdate({contact: prevContact}: Props) {
        const {contact} = this.props

        if (prevContact !== contact && contact) {
            this.setState({
                contactForm: contact.toJS(),
            })
        }
    }

    _submit = (event: SyntheticEvent) => {
        event.preventDefault()
        this.setState({
            isSubmitting: true,
        })

        return this.props
            .updateContact(fromJS(this.state.contactForm))
            .finally(() => {
                this.setState({isSubmitting: false})
            })
    }

    render() {
        const {contactForm, isLoading} = this.state

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
                            <BreadcrumbItem>
                                Change billing address
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <Container fluid className={css.pageContainer}>
                    <h3>Billing information</h3>
                    <Row>
                        <Col lg={6}>
                            {isLoading ? (
                                <Loader />
                            ) : (
                                <Form onSubmit={this._submit}>
                                    <BillingAddressInput
                                        onChange={(contactForm) => {
                                            this.setState({
                                                contactForm,
                                            })
                                        }}
                                        value={contactForm}
                                    />
                                    <div>
                                        <Button
                                            type="submit"
                                            className={css.submitButton}
                                            isLoading={this.state.isSubmitting}
                                        >
                                            Update Address
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        contact: getContact(state),
    }),
    {fetchContact, updateContact}
)

export default connector(BillingDetailsFormContainer)
