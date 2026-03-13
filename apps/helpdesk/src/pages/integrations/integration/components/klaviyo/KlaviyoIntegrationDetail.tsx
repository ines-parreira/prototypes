import { Component } from 'react'

import type { Map } from 'immutable'
import { Link } from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    Col,
    Container,
    Form,
    FormGroup,
    FormText,
    Label,
    Row,
} from 'reactstrap'

import { Button } from '@gorgias/axiom'

import {
    KLAVIYO_INITIAL_SYNC_SYNCED,
    KLAVIYO_INITIAL_SYNC_SYNCING,
} from 'config/integrations/klaviyo'
import { KLAVIYO_INTEGRATION_TYPE } from 'constants/integration'
import Alert from 'pages/common/components/Alert/Alert'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import PageHeader from 'pages/common/components/PageHeader'
import CheckBox from 'pages/common/forms/CheckBox'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'
import css from 'pages/settings/settings.less'
import type {
    deleteIntegration,
    klaviyoSyncHistoricalEvent,
    updateOrCreateIntegration,
} from 'state/integrations/actions'

interface IActions {
    updateOrCreateIntegration: typeof updateOrCreateIntegration
    deleteIntegration: typeof deleteIntegration
    klaviyoSyncHistoricalEvent: typeof klaviyoSyncHistoricalEvent
}

type Props = {
    integration: Map<string, string>
    actions: IActions
    loading: Map<string, string>
    isUpdate: boolean
}

class KlaviyoIntegrationDetail extends Component<Props> {
    state = {
        isSubmitting: false,
        isActivating: false,
        isDeleting: false,
        isSyncing: null,
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

    _syncHistorical = async () => {
        const { actions } = this.props
        this.setState({ isSyncing: KLAVIYO_INITIAL_SYNC_SYNCING })
        await (actions.klaviyoSyncHistoricalEvent() as unknown as Promise<any>)
    }

    _deleteIntegration = async () => {
        const { actions, integration } = this.props
        this.setState({ isDeleting: true })
        await (actions.deleteIntegration(
            integration,
        ) as unknown as Promise<any>)
        this.setState({ isDeleting: false })
    }

    _getFormValues = (): Map<string, unknown> => {
        const { integration } = this.props
        const form = integration
            .set('name', this.state.name)
            .set('type', KLAVIYO_INTEGRATION_TYPE)
            .setIn(['meta', 'api', 'public_key'], this.state.apiPublicKey)
            .setIn(
                ['meta', 'event_sync', 'ticket_created'],
                this.state.ticketCreated,
            )
            .setIn(
                ['meta', 'event_sync', 'ticket_closed'],
                this.state.ticketClosed,
            )
            .setIn(['meta', 'event_sync', 'csat_sent'], this.state.csatSent)
            .setIn(
                ['meta', 'event_sync', 'csat_responded'],
                this.state.csatResponded,
            )
            .setIn(
                ['meta', 'customer_sync', 'enable_customer_sync'],
                this.state.enableCustomerSync,
            )
            .setIn(
                ['meta', 'customer_sync', 'lists', 'default'],
                this.state.customerDefaultList,
            )
            .setIn(
                ['connections'],
                [
                    {
                        data: { private_key: this.state.apiPrivateKey },
                    },
                ],
            )
        return form
    }

    _handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const { updateOrCreateIntegration } = this.props.actions
        this.setState({ isSubmitting: true })
        await (updateOrCreateIntegration(
            this._getFormValues(),
        ) as unknown as Promise<any>)
        this.setState({ isSubmitting: false })
    }

    _getIntegration = (integration: Map<string, unknown>) => {
        return {
            name: integration.get('name', ''),
            isSyncing: integration.getIn(['meta', 'sync_status'], null),
            apiPublicKey: integration.getIn(['meta', 'api', 'public_key'], ''),
            ticketCreated: integration.getIn(
                ['meta', 'event_sync', 'ticket_created'],
                true,
            ),
            ticketClosed: integration.getIn(
                ['meta', 'event_sync', 'ticket_closed'],
                true,
            ),
            csatSent: integration.getIn(
                ['meta', 'event_sync', 'csat_sent'],
                true,
            ),
            csatResponded: integration.getIn(
                ['meta', 'event_sync', 'csat_responded'],
                true,
            ),
            enableCustomerSync: integration.getIn(
                ['meta', 'customer_sync', 'enable_customer_sync'],
                true,
            ),
            customerDefaultList: integration.getIn(
                ['meta', 'customer_sync', 'lists', 'default'],
                'RhVsd2',
            ),
            klaviyoLists: integration.getIn(
                ['meta', 'customer_sync', 'lists', 'data'],
                [],
            ),
        }
    }

    componentDidMount(): void {
        this.initializeState(this.props)
    }

    componentDidUpdate(): void {
        this.initializeState(this.props)
    }

    initializeState = (props: Props): void => {
        const { integration, isUpdate, loading } = props

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

    render(): JSX.Element {
        const { integration, isUpdate } = this.props
        const {
            isSubmitting,
            isActivating,
            isDeleting,
            isSyncing,
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

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    All apps
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
                                    : 'Connect app'}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />
                <Container fluid className={css.pageContainer}>
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
                                    {!(
                                        isSyncing ===
                                        KLAVIYO_INITIAL_SYNC_SYNCING
                                    ) && (
                                        <div>
                                            <p>
                                                We will export the last{' '}
                                                <strong>2 years </strong>of
                                                events and customers from
                                                Gorgias to Klaviyo.
                                            </p>
                                            <ConfirmButton
                                                isLoading={isLoading}
                                                onConfirm={this._syncHistorical}
                                                confirmationContent="Are you sure you want to sync historical data?"
                                            >
                                                {isSyncing ===
                                                KLAVIYO_INITIAL_SYNC_SYNCED
                                                    ? 'Resync historical data'
                                                    : 'Sync historical data'}
                                            </ConfirmButton>
                                        </div>
                                    )}
                                    {isSyncing ===
                                        KLAVIYO_INITIAL_SYNC_SYNCING && (
                                        <Alert className={css.mb16}>
                                            <p>
                                                <b className="alert-heading">
                                                    <i className="material-icons md-spin mr-2">
                                                        autorenew
                                                    </i>
                                                    Exporting historical data to
                                                    Klaviyo
                                                </b>
                                            </p>
                                            <span>
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
                                            </span>
                                        </Alert>
                                    )}
                                </div>
                            )}
                            <br />
                            <div>
                                {isUpdate && <h3>Settings</h3>}
                                <Form onSubmit={this._handleSubmit}>
                                    <FormGroup>
                                        <DEPRECATED_InputField
                                            type="text"
                                            name="name"
                                            label="Integration name"
                                            value={name}
                                            onChange={(value: string) =>
                                                this.setState({ name: value })
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
                                                <DEPRECATED_InputField
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
                                            <DEPRECATED_InputField
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
                                        <CheckBox
                                            className="mb-2"
                                            name="klaviyo.event.ticket-created"
                                            isChecked={ticketCreated}
                                            onChange={(value: boolean) =>
                                                this.setState({
                                                    ticketCreated: value,
                                                })
                                            }
                                        >
                                            Ticket created
                                        </CheckBox>
                                        <CheckBox
                                            className="mb-2"
                                            name="klaviyo.event.ticket-closed"
                                            isChecked={ticketClosed}
                                            onChange={(value: boolean) =>
                                                this.setState({
                                                    ticketClosed: value,
                                                })
                                            }
                                        >
                                            Ticket closed
                                        </CheckBox>
                                        <CheckBox
                                            className="mb-2"
                                            name="klaviyo.event.csat-sent"
                                            isChecked={csatSent}
                                            onChange={(value: boolean) =>
                                                this.setState({
                                                    csatSent: value,
                                                })
                                            }
                                        >
                                            Satisfaction survey sent
                                        </CheckBox>
                                        <CheckBox
                                            className="mb-2"
                                            name="klaviyo.event.csat-responded"
                                            isChecked={csatResponded}
                                            onChange={(value: boolean) =>
                                                this.setState({
                                                    csatResponded: value,
                                                })
                                            }
                                        >
                                            Satisfaction survey responded
                                        </CheckBox>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label className="control-label">
                                            Customer sync
                                        </Label>
                                        <CheckBox
                                            name="klaviyo.customer.enable-sync"
                                            isChecked={enableCustomerSync}
                                            onChange={(value: boolean) =>
                                                this.setState({
                                                    enableCustomerSync: value,
                                                })
                                            }
                                        >
                                            Enable Gorgias customer sync
                                        </CheckBox>
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

                                            <DEPRECATED_InputField
                                                type="select"
                                                value={customerDefaultList}
                                                onChange={(list: unknown[]) => {
                                                    this.setState({
                                                        customerDefaultList:
                                                            list,
                                                    })
                                                }}
                                                required
                                            >
                                                {klaviyoLists.map(
                                                    (
                                                        option: Map<
                                                            string,
                                                            string
                                                        >,
                                                    ) => (
                                                        <option
                                                            key={option.get(
                                                                'list_id',
                                                            )}
                                                            value={option.get(
                                                                'list_id',
                                                            )}
                                                        >
                                                            {option.get(
                                                                'list_name',
                                                            )}
                                                        </option>
                                                    ),
                                                )}
                                            </DEPRECATED_InputField>
                                        </FormGroup>
                                    )}
                                    <br />
                                    <div>
                                        <Button
                                            type="submit"
                                            className="mr-2"
                                            isLoading={isSubmitting}
                                            isDisabled={
                                                isActivating || isDeleting
                                            }
                                        >
                                            {isUpdate
                                                ? 'Save changes'
                                                : 'Connect App'}
                                        </Button>
                                        {isUpdate && (
                                            <ConfirmButton
                                                className="float-right"
                                                onConfirm={
                                                    this._deleteIntegration
                                                }
                                                isDisabled={
                                                    isActivating ||
                                                    isSubmitting ||
                                                    isDeleting
                                                }
                                                confirmationContent={
                                                    INTEGRATION_REMOVAL_CONFIGURATION_TEXT
                                                }
                                                intent="destructive"
                                                leadingIcon="delete"
                                            >
                                                Delete App
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

export default KlaviyoIntegrationDetail
