import React from 'react'
import {List, Map} from 'immutable'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import classNames from 'classnames'
import {
    Alert,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Label,
    Row,
} from 'reactstrap'

import {connect, ConnectedProps} from 'react-redux'

import * as integrationHelpers from '../../../../../state/integrations/helpers'
import {deleteIntegration} from '../../../../../state/integrations/actions'

import Loader from '../../../../common/components/Loader/Loader'
import ConfirmButton from '../../../../common/components/ConfirmButton'
import InputField from '../../../../common/forms/InputField'
import PageHeader from '../../../../common/components/PageHeader'

type Props = {
    integration: Map<any, any>
    shopifyIntegrations: List<Map<any, any>>
    loading: Map<any, any>
    redirectUri: string
} & RouteComponentProps<{integrationId: string}> &
    ConnectedProps<typeof connector>

type State = {
    store_name: string
    integrationLoading?: boolean
}

export class RechargeIntegrationDetail extends React.Component<Props, State> {
    isInitialized = false

    state: State = {
        store_name: '',
    }

    _updateAppPermissions = () => {
        const name = this.props.integration.getIn(['meta', 'store_name'])
        window.location.href = this.props.redirectUri
            .concat('?store_name=')
            .concat(name)
    }

    _installForShopifyStore = (shopifyIntegration: Map<any, any>) => {
        const shopifyShopName = shopifyIntegration.getIn(['meta', 'shop_name'])
        window.location.href = this.props.redirectUri
            .concat('?store_name=')
            .concat(shopifyShopName)
    }

    _reactivateForShopifyStore = () => {
        const shopifyShopName = this.props.integration.getIn([
            'meta',
            'store_name',
        ])
        window.location.href = this.props.redirectUri
            .concat('?store_name=')
            .concat(shopifyShopName)
    }

    render() {
        const {deleteIntegration, integration, shopifyIntegrations, loading} =
            this.props
        const isUpdate = this.props.match.params.integrationId !== 'new'
        const isSubmitting = loading.get('updateIntegration')
        const isActive = !integration.get('deactivated_datetime')

        const needScopeUpdate = integration.getIn(['meta', 'need_scope_update'])
        const isSyncOver = integration.getIn([
            'meta',
            'sync_state',
            'is_initialized',
        ])

        if (loading.get('integration')) {
            return <Loader />
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
                                <Link to="/app/settings/integrations/recharge">
                                    Recharge
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
                            {isUpdate &&
                                isSyncOver !== undefined &&
                                (isSyncOver ? (
                                    <p>
                                        All your Recharge customers have been
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
                                                Importing your Recharge
                                                customers
                                            </b>
                                        </p>
                                        <p>
                                            We're currently importing all your
                                            Recharge customers. This way, you'll
                                            see customer info & orders next to
                                            tickets. We'll notify you via email
                                            when the import is done.{' '}
                                            <Link to="/app/customers">
                                                Review imported customers.
                                            </Link>
                                        </p>
                                    </Alert>
                                ))}

                            {isUpdate ? (
                                <InputField
                                    type="text"
                                    name="name"
                                    label="Shopify store name"
                                    value={
                                        isUpdate
                                            ? integration.get('name')
                                            : undefined
                                    }
                                    onChange={(value) =>
                                        this.setState({store_name: value})
                                    }
                                    placeholder={
                                        'ex: "acme" for acme.myshopify.com'
                                    }
                                    disabled={isUpdate}
                                    rightAddon=".myshopify.com"
                                    required
                                />
                            ) : (
                                <div className="shopifyIntegrationsList">
                                    <Label className="control-label">
                                        Select an existing Shopify integration
                                    </Label>
                                    {shopifyIntegrations.map(
                                        (integration, idx) => {
                                            return (
                                                <Button
                                                    block
                                                    key={idx}
                                                    onClick={() =>
                                                        this._installForShopifyStore(
                                                            integration!
                                                        )
                                                    }
                                                    className={classNames(
                                                        'mb-2',
                                                        {
                                                            'btn-loading':
                                                                this.state
                                                                    .integrationLoading ===
                                                                integration!.get(
                                                                    'id'
                                                                ),
                                                        }
                                                    )}
                                                    color="secondary"
                                                >
                                                    <img
                                                        alt="shopify logo"
                                                        className="shopifyLogo"
                                                        src={integrationHelpers.getIconFromType(
                                                            'shopify'
                                                        )}
                                                    />
                                                    Install Recharge for{' '}
                                                    {integration!.get('name')}
                                                </Button>
                                            )
                                        }
                                    )}
                                </div>
                            )}

                            <div>
                                {isUpdate && needScopeUpdate && (
                                    <Button
                                        type="button"
                                        color="info"
                                        className={classNames('mr-2', {
                                            'btn-loading': isSubmitting,
                                        })}
                                        disabled={isSubmitting}
                                        onClick={this._updateAppPermissions}
                                    >
                                        Update app permissions
                                    </Button>
                                )}
                                {isUpdate && !isActive && (
                                    <Button
                                        type="button"
                                        color="success"
                                        className={classNames({
                                            'btn-loading': isSubmitting,
                                        })}
                                        onClick={
                                            this._reactivateForShopifyStore
                                        }
                                    >
                                        Reconnect
                                    </Button>
                                )}
                                {isUpdate && (
                                    <ConfirmButton
                                        className="float-right"
                                        color="secondary"
                                        id={integration.get('id')}
                                        confirm={() =>
                                            deleteIntegration(integration)
                                        }
                                        content="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                                    >
                                        <i className="material-icons mr-1 text-danger">
                                            delete
                                        </i>
                                        Delete
                                    </ConfirmButton>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

const connector = connect(null, {
    deleteIntegration,
})

export default withRouter(connector(RechargeIntegrationDetail))
