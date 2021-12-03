import React, {Component, SyntheticEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
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
import {fromJS} from 'immutable'

import {fetchContact, updateContact} from '../../../../state/billing/actions'
import {getContact} from '../../../../state/billing/selectors'
import Loader from '../../../common/components/Loader/Loader'
import PageHeader from '../../../common/components/PageHeader'
import {RootState} from '../../../../state/types'
import BillingAddressInput from '../common/BillingAddressInputs'
import {BillingContact} from '../../../../state/billing/types'
import css from '../../settings.less'

type Props = ConnectedProps<typeof connector>

type State = {
    contactForm: BillingContact
    isLoading: boolean
    isSubmitting: boolean
}

export class BillingDetailsFormContainer extends Component<Props, State> {
    state = {
        isLoading: false,
        isSubmitting: false,
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
                            <BreadcrumbItem>Billing details</BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <Container fluid className={css.pageContainer}>
                    <p>
                        Please enter the billing details you'd like us to use on
                        your next invoice.
                    </p>
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
                                            color="success"
                                            className={classNames({
                                                'btn-loading':
                                                    this.state.isSubmitting,
                                            })}
                                            disabled={this.state.isSubmitting}
                                        >
                                            Update billing details
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
