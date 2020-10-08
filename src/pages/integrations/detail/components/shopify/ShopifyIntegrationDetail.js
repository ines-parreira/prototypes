// @flow
import React from 'react'
import {browserHistory, Link, withRouter} from 'react-router'
import {connect} from 'react-redux'
import classNames from 'classnames'
import {type Map} from 'immutable'
import _isEmpty from 'lodash/isEmpty'
import {
    Alert,
    Form,
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Row,
    Col,
    Label,
} from 'reactstrap'

import Loader from '../../../../common/components/Loader'
import ConfirmButton from '../../../../common/components/ConfirmButton'
import BooleanField from '../../../../common/forms/BooleanField'
import InputField from '../../../../common/forms/InputField'
import PageHeader from '../../../../common/components/PageHeader'

import * as utils from '../../../../../utils.ts'

import {notify} from '../../../../../state/notifications/actions.ts'
import * as integrationSelectors from '../../../../../state/integrations/selectors.ts'
import {PENDING_AUTHENTICATION_STATUS} from '../../../../../constants/integration.ts'

type Props = {
    integration: Map<*, *>,
    isUpdate: boolean,
    actions: Object,
    loading: Object,

    redirectUri: string,

    getExistingShopifyIntegration: (string) => Map<*, *>,

    // Router
    location: Object,

    // Actions
    notify: typeof notify,
}

type State = {
    name: string,
    syncCustomerNotes: boolean,
    isInitialized: boolean,
}

class ShopifyIntegrationDetail extends React.Component<Props, State> {
    state = {
        name: '',
        syncCustomerNotes: true,
        isInitialized: false,
    }

    componentDidMount() {
        // display message from url
        const {
            location: {
                query: {message, message_type: status = 'info', error},
            },
            isUpdate,
        } = this.props

        this.setState({isInitialized: !isUpdate})

        if (error === 'need_scope_update') {
            this.props.notify({
                status: 'error',
                message:
                    'You need to update your app permissions in order to do that.',
            })
        }

        if (message) {
            this.props.notify({
                status,
                message: decodeURIComponent(message.replace(/\+/g, ' ')),
            })
            // remove error from url
            browserHistory.push(window.location.pathname)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (
            _isEmpty(this.props.integration.toJS()) &&
            !_isEmpty(nextProps.integration.toJS())
        ) {
            const authenticationRequired =
                nextProps.integration.getIn(['meta', 'oauth', 'status']) ===
                PENDING_AUTHENTICATION_STATUS
            const isAuthenticating =
                nextProps.location.query.action === 'authentication'

            if (isAuthenticating) {
                if (authenticationRequired) {
                    setTimeout(
                        nextProps.actions.fetchIntegration(
                            nextProps.integration.get('id'),
                            nextProps.integration.get('type'),
                            true
                        ),
                        3000
                    )
                } else {
                    nextProps.actions.triggerCreateSuccess(
                        nextProps.integration.toJS()
                    )
                }
            }
        }
    }

    componentWillUpdate(nextProps, nextState) {
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

    _handleCreate = (evt: Event): void => {
        evt.preventDefault()
        window.location.href = this.props.redirectUri.replace(
            '{shop_name}',
            utils.subdomain(this.state.name)
        )
    }

    _handleUpdate = (evt: Event): void => {
        evt.preventDefault()
        const {integration, actions} = this.props

        actions.updateOrCreateIntegration(
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
            actions,
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

                <Container fluid className="page-container">
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
                                    <Alert color="info" className="mb-4">
                                        <p>
                                            <b className="alert-heading">
                                                <i className="material-icons md-spin mr-2">
                                                    autorenew
                                                </i>
                                                Importing your Shopify customers
                                            </b>
                                        </p>
                                        <p>
                                            We're currently importing all your
                                            Shopify customers. This way, you'll
                                            see customer info & orders next to
                                            tickets. We'll notify you via email
                                            when the import is done. We
                                            typically sync 3,000 customers an
                                            hour.{' '}
                                            <Link to="/app/customers">
                                                Review imported customers.
                                            </Link>
                                        </p>
                                    </Alert>
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
                                        <BooleanField
                                            name="sync_customer_notes"
                                            type="checkbox"
                                            value={syncCustomerNotes}
                                            onChange={(value) =>
                                                this.setState({
                                                    syncCustomerNotes: value,
                                                })
                                            }
                                            label="Synchronize customer notes"
                                            help=""
                                        />
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
                                            color="info"
                                            className={classNames(
                                                {
                                                    'btn-loading': isSubmitting,
                                                },
                                                'mr-2'
                                            )}
                                            disabled={isSubmitting}
                                            onClick={this._updateAppPermissions}
                                        >
                                            Update app permissions
                                        </Button>
                                    ) : null}

                                    <Button
                                        type="submit"
                                        color="success"
                                        className={classNames('mr-2', {
                                            'btn-loading': ctaIsLoading,
                                        })}
                                        disabled={submitIsDisabled}
                                    >
                                        {isUpdate
                                            ? 'Update integration'
                                            : 'Add integration'}
                                    </Button>

                                    {!authenticationRequired &&
                                    isUpdate &&
                                    isActive ? (
                                        <Button
                                            type="button"
                                            color="warning"
                                            outline
                                            className={classNames({
                                                'btn-loading': isSubmitting,
                                            })}
                                            disabled={isSubmitting}
                                            onClick={() =>
                                                actions.deactivateIntegration(
                                                    integration.get('id')
                                                )
                                            }
                                        >
                                            Deactivate integration
                                        </Button>
                                    ) : null}
                                    {!authenticationRequired &&
                                    isUpdate &&
                                    !isActive ? (
                                        <Button
                                            type="button"
                                            color="success"
                                            className={classNames({
                                                'btn-loading': isSubmitting,
                                            })}
                                            disabled={isSubmitting}
                                            onClick={() =>
                                                actions.activateIntegration(
                                                    integration.get('id')
                                                )
                                            }
                                        >
                                            Re-activate integration
                                        </Button>
                                    ) : null}
                                    {isUpdate ? (
                                        <ConfirmButton
                                            className="float-right"
                                            color="secondary"
                                            confirm={() =>
                                                actions.deleteIntegration(
                                                    integration
                                                )
                                            }
                                            content="Are you sure you want to delete this integration?"
                                        >
                                            <i className="material-icons mr-1 text-danger">
                                                delete
                                            </i>
                                            Delete integration
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

export default withRouter(
    connect(
        (state) => {
            return {
                getExistingShopifyIntegration: integrationSelectors.makeGetShopifyIntegrationByShopName(
                    state
                ),
            }
        },
        {notify}
    )(ShopifyIntegrationDetail)
)
