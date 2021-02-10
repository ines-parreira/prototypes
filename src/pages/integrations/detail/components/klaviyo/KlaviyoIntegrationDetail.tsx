import React from 'react'

import {
    Alert,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Form,
    FormGroup,
    FormText,
    Label,
    Row,
} from 'reactstrap'
import {Link} from 'react-router-dom'

import classNames from 'classnames'

import type {Map} from 'immutable'

import {AxiosPromise} from 'axios'

import PageHeader from '../../../../common/components/PageHeader'
import InputField from '../../../../common/forms/InputField.js'
import BooleanField from '../../../../common/forms/BooleanField.js'
import ConfirmButton from '../../../../common/components/ConfirmButton'
import {KLAVIYO_INTEGRATION_TYPE} from '../../../../../constants/integration'

interface IActions {
    updateOrCreateIntegration: (
        data: Map<string, unknown> | unknown
    ) => AxiosPromise
    deleteIntegration: (integration: Map<string, unknown>) => AxiosPromise
}

type Props = {
    integration: Map<string, string>
    actions: IActions
    loading: Map<string, string>
    isUpdate: boolean
}

export default class KlaviyoIntegrationDetail extends React.Component<Props> {
    state = {
        isSubmitting: false,
        isActivating: false,
        isDeleting: false,
        name: '',
        apiPublicKey: '',
        apiPrivateKey: '',
        ticketCreated: true,
        ticketClosed: true,
        csatSent: true,
        csatResponded: true,
        enableCustomerSync: true,
        customerDefaultList: '',
        klaviyoLists: [],
    }

    isInitialized = false

    _deleteIntegration = () => {
        const {actions, integration} = this.props
        this.setState({isDeleting: true})
        return actions.deleteIntegration(integration).then((res: unknown) => {
            this.setState({isDeleting: false})
            return res
        })
    }

    _getFormValues = (): Map<string, unknown> => {
        const {integration} = this.props
        const form = integration
            .set('name', this.state.name)
            .set('type', KLAVIYO_INTEGRATION_TYPE)
            .setIn(['meta', 'api', 'public_key'], this.state.apiPublicKey)
            .setIn(
                ['meta', 'event_sync', 'ticket_created'],
                this.state.ticketCreated
            )
            .setIn(
                ['meta', 'event_sync', 'ticket_closed'],
                this.state.ticketClosed
            )
            .setIn(['meta', 'event_sync', 'csat_sent'], this.state.csatSent)
            .setIn(
                ['meta', 'event_sync', 'csat_responded'],
                this.state.csatResponded
            )
            .setIn(
                ['meta', 'customer_sync', 'enable_customer_sync'],
                this.state.enableCustomerSync
            )
            .setIn(
                ['meta', 'customer_sync', 'lists', 'default'],
                this.state.customerDefaultList
            )
            .setIn(
                ['connections'],
                [
                    {
                        data: {private_key: this.state.apiPrivateKey},
                    },
                ]
            )
        return form
    }

    _handleSubmit = (e: React.FormEvent<HTMLFormElement>): Promise<unknown> => {
        e.preventDefault()
        const {updateOrCreateIntegration} = this.props.actions
        this.setState({isSubmitting: true})
        return updateOrCreateIntegration(this._getFormValues()).then(
            (res: unknown) => {
                this.setState({isSubmitting: false})
                return res
            }
        )
    }

    _getIntegration = (integration: Map<string, unknown>) => {
        return {
            name: integration.get('name', ''),
            apiPublicKey: integration.getIn(['meta', 'api', 'public_key'], ''),
            ticketCreated: integration.getIn(
                ['meta', 'event_sync', 'ticket_created'],
                true
            ),
            ticketClosed: integration.getIn(
                ['meta', 'event_sync', 'ticket_closed'],
                true
            ),
            csatSent: integration.getIn(
                ['meta', 'event_sync', 'csat_sent'],
                true
            ),
            csatResponded: integration.getIn(
                ['meta', 'event_sync', 'csat_responded'],
                true
            ),
            enableCustomerSync: integration.getIn(
                ['meta', 'customer_sync', 'enable_customer_sync'],
                true
            ),
            customerDefaultList: integration.getIn(
                ['meta', 'customer_sync', 'lists', 'default'],
                'RhVsd2'
            ),
            klaviyoLists: integration.getIn(
                ['meta', 'customer_sync', 'lists', 'data'],
                []
            ),
        }
    }

    componentWillMount(): void {
        const {integration, isUpdate, loading} = this.props

        if (
            !this.isInitialized &&
            isUpdate &&
            !loading.get('integration') &&
            !integration.isEmpty()
        ) {
            this.setState(this._getIntegration(integration))
            this.isInitialized = true
        }
    }

    componentWillUpdate(nextProps: Props): void {
        const {integration, isUpdate, loading} = nextProps

        if (!this.isInitialized && isUpdate && !loading.get('integration')) {
            this.setState(this._getIntegration(integration))
            this.isInitialized = true
        }
    }

    render(): JSX.Element {
        const {integration, isUpdate} = this.props
        const {
            isSubmitting,
            isActivating,
            isDeleting,
            name,
            apiPublicKey,
            apiPrivateKey,
            ticketCreated,
            ticketClosed,
            csatSent,
            csatResponded,
            enableCustomerSync,
            customerDefaultList,
            klaviyoLists,
        } = this.state

        const isLoading = false
        const isActive = !integration.get('deactivated_datetime')
        const isExporting = false

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    Integrations
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations/klaviyo">
                                    Klaviyo
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                {isUpdate
                                    ? integration.get('name')
                                    : 'Add integration'}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />
                <Container fluid className="page-container">
                    <Row>
                        <Col md="8">
                            {!isUpdate ? (
                                <p>
                                    Add the details about the Klaviyo
                                    integration you want to add below. If you
                                    need help, you can check our{' '}
                                    <a
                                        href="https://docs.gorgias.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        docs
                                    </a>{' '}
                                    or contact us.
                                </p>
                            ) : null}
                            {isUpdate && (
                                <div>
                                    <h3>Historical data sync</h3>
                                    <p>
                                        We will export the last{' '}
                                        <strong>2 years </strong>of events and
                                        customers from Gorgias to Klaviyo.
                                    </p>
                                    <ConfirmButton
                                        color="primary"
                                        loading={isLoading}
                                        confirm={() => {
                                            return undefined
                                        }}
                                        content="Are you sure you want to sync historical data?"
                                    >
                                        Sync historical data
                                    </ConfirmButton>
                                    {isExporting && (
                                        <Alert color="info" className="mb-4">
                                            <p>
                                                <b className="alert-heading">
                                                    <i className="material-icons md-spin mr-2">
                                                        autorenew
                                                    </i>
                                                    Exporting historical data to
                                                    Klaviyo
                                                </b>
                                            </p>
                                            <p>
                                                We are syncing historical data
                                                from Gorgias to Klaviyo. You
                                                will start to see your tickets
                                                and satisfactions surveys
                                                populate in Klaviyo. Once this
                                                historical sync is complete,
                                                this notification will disappear
                                                and Gorgias will sync new data
                                                to Klaviyo every time it
                                                happens.
                                            </p>
                                        </Alert>
                                    )}
                                </div>
                            )}
                            <br />
                            <div>
                                {isUpdate && <h3>Settings</h3>}
                                <Form onSubmit={this._handleSubmit}>
                                    <FormGroup>
                                        <InputField
                                            type="text"
                                            name="name"
                                            label="Integration name"
                                            value={name}
                                            onChange={(value: string) =>
                                                this.setState({name: value})
                                            }
                                            required
                                        />
                                    </FormGroup>
                                    {(!isUpdate || !isActive) && (
                                        <FormGroup>
                                            {!isActive && (
                                                <FormText color="danger">
                                                    Your integration is
                                                    deactivated, please update
                                                    your API keys.
                                                </FormText>
                                            )}
                                            {isActive && (
                                                <InputField
                                                    type="text"
                                                    name="apiPublicKey"
                                                    label="API public key"
                                                    value={apiPublicKey}
                                                    onChange={(value: string) =>
                                                        this.setState({
                                                            apiPublicKey: value,
                                                        })
                                                    }
                                                    required
                                                />
                                            )}
                                            <InputField
                                                type="text"
                                                name="apiPrivateKey"
                                                label="API private key"
                                                value={apiPrivateKey}
                                                onChange={(value: string) =>
                                                    this.setState({
                                                        apiPrivateKey: value,
                                                    })
                                                }
                                                required
                                            />
                                        </FormGroup>
                                    )}
                                    <FormGroup>
                                        <Label className="control-label">
                                            Event sync
                                        </Label>
                                        <p>
                                            <FormText color="muted">
                                                The following events will be
                                                synced to Klaviyo every hour.
                                            </FormText>
                                        </p>
                                        <BooleanField
                                            name="klaviyo.event.ticket-created"
                                            type="checkbox"
                                            label="Ticket created"
                                            value={ticketCreated}
                                            onChange={(value: boolean) =>
                                                this.setState({
                                                    ticketCreated: value,
                                                })
                                            }
                                        />
                                        <BooleanField
                                            name="klaviyo.event.ticket-closed"
                                            type="checkbox"
                                            label="Ticket closed"
                                            value={ticketClosed}
                                            onChange={(value: boolean) =>
                                                this.setState({
                                                    ticketClosed: value,
                                                })
                                            }
                                        />
                                        <BooleanField
                                            name="klaviyo.event.csat-sent"
                                            type="checkbox"
                                            label="Satisfaction survey sent"
                                            value={csatSent}
                                            onChange={(value: boolean) =>
                                                this.setState({
                                                    csatSent: value,
                                                })
                                            }
                                        />
                                        <BooleanField
                                            name="klaviyo.event.csat-responded"
                                            type="checkbox"
                                            label="Satisfaction survey responded"
                                            value={csatResponded}
                                            onChange={(value: boolean) =>
                                                this.setState({
                                                    csatResponded: value,
                                                })
                                            }
                                        />
                                        <br />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label className="control-label">
                                            Customer sync
                                        </Label>
                                        <BooleanField
                                            name="klaviyo.customer.enable-sync"
                                            type="checkbox"
                                            label="Enable Gorgias customer sync"
                                            value={enableCustomerSync}
                                            onChange={(value: boolean) =>
                                                this.setState({
                                                    enableCustomerSync: value,
                                                })
                                            }
                                        />
                                    </FormGroup>
                                    {isUpdate && (
                                        <FormGroup>
                                            <p>
                                                <FormText color="muted">
                                                    When a ticket is created, a
                                                    customer will be
                                                    automatically added to a
                                                    Klaviyo customer list of
                                                    your choosing.
                                                </FormText>
                                            </p>

                                            <InputField
                                                type="select"
                                                value={customerDefaultList}
                                                onChange={(list: unknown[]) => {
                                                    this.setState({
                                                        customerDefaultList: list,
                                                    })
                                                }}
                                                required
                                            >
                                                {klaviyoLists.map(
                                                    (
                                                        option: Map<
                                                            string,
                                                            string
                                                        >
                                                    ) => (
                                                        <option
                                                            key={option.get(
                                                                'list_id'
                                                            )}
                                                            value={option.get(
                                                                'list_id'
                                                            )}
                                                        >
                                                            {option.get(
                                                                'list_name'
                                                            )}
                                                        </option>
                                                    )
                                                )}
                                            </InputField>
                                        </FormGroup>
                                    )}
                                    <br />
                                    <div>
                                        <Button
                                            type="submit"
                                            color="success"
                                            className={classNames('mr-2', {
                                                'btn-loading': isSubmitting,
                                            })}
                                            disabled={
                                                isActivating ||
                                                isSubmitting ||
                                                isDeleting
                                            }
                                        >
                                            {isUpdate
                                                ? 'Save changes'
                                                : 'Add integration'}
                                        </Button>
                                        {isUpdate && (
                                            <ConfirmButton
                                                className="float-right"
                                                color="secondary"
                                                confirm={
                                                    this._deleteIntegration
                                                }
                                                disabled={
                                                    isActivating ||
                                                    isSubmitting ||
                                                    isDeleting
                                                }
                                                content="Are you sure you want to delete this integration?"
                                            >
                                                <i className="material-icons mr-1 text-danger">
                                                    delete
                                                </i>
                                                Delete integration
                                            </ConfirmButton>
                                        )}
                                    </div>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}
