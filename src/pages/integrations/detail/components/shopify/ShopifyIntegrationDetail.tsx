import React, {SyntheticEvent} from 'react'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {Map} from 'immutable'
import _isEmpty from 'lodash/isEmpty'
import {
    Breadcrumb,
    BreadcrumbItem,
    Col,
    Container,
    Form,
    Label,
    Row,
} from 'reactstrap'
import {parse} from 'qs'

import {PENDING_AUTHENTICATION_STATUS} from 'constants/integration'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import CheckBox from 'pages/common/forms/CheckBox'
import InputField from 'pages/common/forms/InputField'
import history from 'pages/history'
import css from 'pages/settings/settings.less'
import {
    deleteIntegration,
    fetchIntegration,
    triggerCreateSuccess,
    updateOrCreateIntegration,
} from 'state/integrations/actions'
import {makeGetShopifyIntegrationByShopName} from 'state/integrations/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RootState} from 'state/types'
import * as utils from 'utils'

type Props = {
    integration: Map<any, any>
    isUpdate: boolean
    loading: Map<any, any>
    redirectUri: string
} & RouteComponentProps<any, any, {search: string}> &
    ConnectedProps<typeof connector>

type State = {
    name: string
    syncCustomerNotes: boolean
    isInitialized: boolean
}

export class ShopifyIntegrationDetail extends React.Component<Props, State> {
    state = {
        name: '',
        syncCustomerNotes: true,
        isInitialized: false,
    }

    componentDidMount() {
        // display message from url
        const {location, isUpdate} = this.props
        const message = parse(location.search, {ignoreQueryPrefix: true})
            .message as string
        const status =
            (parse(location.search, {ignoreQueryPrefix: true})
                .message_type as NotificationStatus) || NotificationStatus.Info
        const error = parse(location.search, {ignoreQueryPrefix: true}).error
        this.setState({isInitialized: !isUpdate})

        if (error === 'need_scope_update') {
            void this.props.notify({
                status: NotificationStatus.Error,
                message:
                    'You need to update your app permissions in order to do that.',
            })
        }

        if (message) {
            void this.props.notify({
                status,
                message: decodeURIComponent(message.replace(/\+/g, ' ')),
            })
            // remove error from url
            history.push(window.location.pathname)
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (
            _isEmpty(this.props.integration.toJS()) &&
            !_isEmpty(nextProps.integration.toJS())
        ) {
            const authenticationRequired =
                nextProps.integration.getIn(['meta', 'oauth', 'status']) ===
                PENDING_AUTHENTICATION_STATUS
            const isAuthenticating =
                parse(nextProps.location.search, {ignoreQueryPrefix: true})
                    .action === 'authentication'

            if (isAuthenticating) {
                if (authenticationRequired) {
                    setTimeout(() => {
                        void this.props.fetchIntegration(
                            nextProps.integration.get('id'),
                            nextProps.integration.get('type'),
                            true
                        )
                    }, 3000)
                } else {
                    this.props.triggerCreateSuccess(
                        nextProps.integration.toJS()
                    )
                }
            }
        }
    }

    componentWillUpdate(nextProps: Props, nextState: State) {
        const {integration, isUpdate, loading} = nextProps

        // populating the form when updating an integration
        if (
            !nextState.isInitialized &&
            isUpdate &&
            !loading.get('integration')
        ) {
            this.setState({
                name: integration.get('name'),
                syncCustomerNotes: integration.getIn([
                    'meta',
                    'sync_customer_notes',
                ]),
                isInitialized: true,
            })
        }
    }

    _handleCreate = (evt: SyntheticEvent<HTMLFormElement>): void => {
        evt.preventDefault()
        window.location.href = this.props.redirectUri.replace(
            '{shop_name}',
            utils.subdomain(this.state.name)
        )
    }

    _handleUpdate = (evt: SyntheticEvent<HTMLFormElement>): void => {
        evt.preventDefault()
        const {integration} = this.props

        void this.props.updateOrCreateIntegration(
            integration.mergeDeep({
                meta: {
                    sync_customer_notes: this.state.syncCustomerNotes,
                },
            })
        )
    }

    _updateAppPermissions = (): void => {
        const {integration, redirectUri} = this.props
        window.location.href = redirectUri.replace(
            '{shop_name}',
            integration.getIn(['meta', 'shop_name'], '')
        )
    }

    render() {
        const {
            deleteIntegration,
            integration,
            isUpdate,
            loading,
            getExistingShopifyIntegration,
        } = this.props
        const {name: shopName, syncCustomerNotes} = this.state

        const isSubmitting = !!loading.get('updateIntegration')

        const isActive = !integration.get('deactivated_datetime')
        const needScopeUpdate = integration.getIn(['meta', 'need_scope_update'])
        const authenticationRequired =
            integration.getIn(['meta', 'oauth', 'status']) ===
            PENDING_AUTHENTICATION_STATUS
        const isCustomersImportOver = integration.getIn([
            'meta',
            'import_state',
            'customers',
            'is_over',
        ])

        const ctaIsLoading = isSubmitting || authenticationRequired

        if (loading.get('integration')) {
            return <Loader />
        }

        const error =
            !isUpdate && !getExistingShopifyIntegration(shopName).isEmpty()
                ? 'There is already an integration for this Shopify store'
                : null

        const settingsHaveChanged =
            integration.getIn(['meta', 'sync_customer_notes']) !==
            syncCustomerNotes
        const submitIsDisabled =
            isSubmitting || !!error || (isUpdate && !settingsHaveChanged)
        const activateIntegration = () => {
            const IntegrationName = integration.get('name')
            window.location.href = this.props.redirectUri.replace(
                '{shop_name}',
                IntegrationName
            )
        }
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
                                <Link to="/app/settings/integrations/shopify">
                                    Shopify
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

                <Container fluid className={css.pageContainer}>
                    <Row>
                        <Col md="8">
                            {!isUpdate ? (
                                <p>
                                    Let's connect your store to Gorgias. We'll
                                    import your Shopify customers in Gorgias,
                                    along with their order information. This
                                    way, when they contact you, you'll be able
                                    to see their Shopify information next to
                                    tickets.
                                </p>
                            ) : null}
                            {isUpdate ? (
                                isCustomersImportOver ? (
                                    <p>
                                        All your Shopify customers have been
                                        imported. You can now see their info in
                                        the sidebar.{' '}
                                        <Link to="/app/customers">
                                            Review your customers.
                                        </Link>
                                    </p>
                                ) : (
                                    <LinkAlert
                                        className={css.mb16}
                                        actionLabel="Review imported customers"
                                        actionHref="/app/customers"
                                    >
                                        <p>
                                            <b className="alert-heading">
                                                <i className="material-icons md-spin mr-2">
                                                    autorenew
                                                </i>
                                                Importing your Shopify customers
                                            </b>
                                        </p>
                                        <span>
                                            We're currently importing all your
                                            Shopify customers. This way, you'll
                                            see customer info & orders next to
                                            tickets. We'll notify you via email
                                            when the import is done. We
                                            typically sync 3,000 customers an
                                            hour.
                                        </span>
                                    </LinkAlert>
                                )
                            ) : null}

                            <Form
                                onSubmit={
                                    isUpdate
                                        ? this._handleUpdate
                                        : this._handleCreate
                                }
                            >
                                <div className="mb-4">
                                    <InputField
                                        type="text"
                                        name="name"
                                        label="Store name"
                                        placeholder={
                                            'ex: "acme" for acme.myshopify.com'
                                        }
                                        required
                                        disabled={isUpdate}
                                        value={shopName}
                                        error={error}
                                        onChange={(name) =>
                                            this.setState({name})
                                        }
                                        rightAddon=".myshopify.com"
                                    />
                                </div>

                                {isUpdate && [
                                    <div key="input" className="mb-2">
                                        <Label className="control-label">
                                            Synchronization settings
                                        </Label>
                                        <CheckBox
                                            name="sync_customer_notes"
                                            isChecked={syncCustomerNotes}
                                            onChange={(value: boolean) =>
                                                this.setState({
                                                    syncCustomerNotes: value,
                                                })
                                            }
                                        >
                                            Synchronize customer notes
                                        </CheckBox>
                                    </div>,
                                    <div key="help" className="text-faded mb-4">
                                        If this option is enabled, updating a
                                        customer's note in Shopify will also
                                        update it in Gorgias, and updating it in
                                        Gorgias will also update it in Shopify:
                                        <ul>
                                            <li>
                                                if two people are editing a
                                                single customer's note at the
                                                same time in Shopify and
                                                Gorgias,{' '}
                                                <b>
                                                    the first one to save the
                                                    data will overwrite the
                                                    other one's modifications
                                                </b>
                                            </li>
                                            <li>
                                                if a single Gorgias customer is
                                                associated with two or more
                                                Shopify customers on two or more
                                                Shopify stores,{' '}
                                                <b>
                                                    its note will not be
                                                    synchronized from Shopify
                                                </b>
                                                , and{' '}
                                                <b>
                                                    updating the Gorgias
                                                    customer note won't update
                                                    any Shopify customer note
                                                </b>
                                            </li>
                                        </ul>
                                    </div>,
                                ]}

                                <div>
                                    {isUpdate && needScopeUpdate ? (
                                        <Button
                                            type="button"
                                            className="mr-2"
                                            isLoading={isSubmitting}
                                            onClick={this._updateAppPermissions}
                                        >
                                            Update app permissions
                                        </Button>
                                    ) : null}

                                    <Button
                                        type="submit"
                                        className="mr-2"
                                        isDisabled={submitIsDisabled}
                                        isLoading={ctaIsLoading}
                                    >
                                        {isUpdate
                                            ? 'Update integration'
                                            : 'Add integration'}
                                    </Button>
                                    {!authenticationRequired &&
                                    isUpdate &&
                                    !isActive ? (
                                        <Button
                                            type="button"
                                            isLoading={isSubmitting}
                                            onClick={activateIntegration}
                                        >
                                            Reactivate integration
                                        </Button>
                                    ) : null}
                                    {isUpdate ? (
                                        <ConfirmButton
                                            className="float-right"
                                            type="button"
                                            onConfirm={() =>
                                                deleteIntegration(
                                                    integration
                                                ) as unknown as Promise<void>
                                            }
                                            confirmationContent="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                                            intent={ButtonIntent.Destructive}
                                        >
                                            <ButtonIconLabel icon="delete">
                                                Delete integration
                                            </ButtonIconLabel>
                                        </ConfirmButton>
                                    ) : null}
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => {
        return {
            getExistingShopifyIntegration:
                makeGetShopifyIntegrationByShopName(state),
        }
    },
    {
        notify,
        deleteIntegration,
        fetchIntegration,
        triggerCreateSuccess,
        updateOrCreateIntegration,
    }
)

export default withRouter(connector(ShopifyIntegrationDetail))
