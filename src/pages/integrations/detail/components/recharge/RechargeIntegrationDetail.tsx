import React from 'react'
import {List, Map} from 'immutable'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import classNames from 'classnames'
import {
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
import DEPRECATED_ConfirmButton from '../../../../common/components/DEPRECATED_ConfirmButton'
import InputField from '../../../../common/forms/InputField'
import PageHeader from '../../../../common/components/PageHeader'
import LinkAlert from '../../../../common/components/Alert/LinkAlert'
import css from '../../../../settings/settings.less'

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

                <Container fluid className={css.pageContainer}>
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
                                    <LinkAlert
                                        className={css.mb16}
                                        actionHref="/app/customers"
                                        actionLabel="Review imported customers"
                                    >
                                        <p>
                                            <b className="alert-heading">
                                                <i className="material-icons md-spin mr-2">
                                                    autorenew
                                                </i>
                                                Importing your Recharge
                                                customers
                                            </b>
                                        </p>
                                        <span>
                                            We're currently importing all your
                                            Recharge customers. This way, you'll
                                            see customer info & orders next to
                                            tickets. We'll notify you via email
                                            when the import is done.
                                        </span>
                                    </LinkAlert>
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
                                    <DEPRECATED_ConfirmButton
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
                                    </DEPRECATED_ConfirmButton>
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
