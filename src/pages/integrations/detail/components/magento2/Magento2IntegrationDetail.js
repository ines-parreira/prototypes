// @flow
import React from 'react'
import {Link, withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {type Map} from 'immutable'
import _isEmpty from 'lodash/isEmpty'
import {
    Alert,
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Row,
    Col,
} from 'reactstrap'
import {parse} from 'query-string'

import Loader from '../../../../common/components/Loader/Loader.tsx'
import PageHeader from '../../../../common/components/PageHeader.tsx'

import {notify} from '../../../../../state/notifications/actions.ts'
import history from '../../../../history.ts'

import css from './Magento2ManualSelectionButton.less'
import Magento2ManualIntegrationForm from './Magento2ManualIntegrationForm.tsx'
import Magento2OneClickIntegrationForm from './Magento2OneClickIntegrationForm.tsx'
import Magento2ModeSelectionButton from './Magento2ModeSelectionButton.tsx'

type Props = {
    integration: Map<*, *>,
    isUpdate: boolean,
    actions: Object,
    loading: Object,

    redirectUri: string,

    // Router
    location: Object,

    // Actions
    notify: typeof notify,
}

type State = {
    isManual: boolean,
    isInitialized: boolean,
}

export class Magento2IntegrationDetail extends React.Component<Props, State> {
    state = {
        isInitialized: false,
        isManual: false,
    }

    componentDidMount() {
        // display message from url
        const {location, isUpdate} = this.props
        const message = parse(location.search).message
        const status = parse(location.search).message_type || 'info'
        this.setState({isInitialized: !isUpdate})

        if (message) {
            this.props.notify({
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
            const isAuthenticating =
                parse(nextProps.location.search).action === 'authentication'

            if (isAuthenticating) {
                nextProps.actions.triggerCreateSuccess(
                    nextProps.integration.toJS()
                )
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
                isManual: integration.getIn(['meta', 'is_manual']),
                isInitialized: true,
            })
        }
    }

    render() {
        const {actions, integration, isUpdate, loading} = this.props

        const isSubmitting = !!loading.get('updateIntegration')

        const isSyncOver = integration.getIn([
            'meta',
            'import_state',
            'is_over',
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
                                <Link to="/app/settings/integrations/magento2">
                                    Magento 2
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
                                <div>
                                    <p>
                                        Let's connect your store to Gorgias.
                                        We'll import your Magento 2 customers in
                                        Gorgias, along with their order
                                        information. This way, when they contact
                                        you, you'll be able to see their Magento
                                        2 information next to tickets.
                                    </p>
                                    <Alert color="warning">
                                        To add a Magento 2 integration to
                                        Gorgias, you will need to have installed
                                        the{' '}
                                        <a
                                            href="https://marketplace.magento.com/gorgias-module-magento-connect.html"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Gorgias plugin
                                        </a>{' '}
                                        on your store first. Please follow
                                        instructions{' '}
                                        <a
                                            href="https://docs.gorgias.com/ecommerce-integrations/magento-2"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            here
                                        </a>{' '}
                                        for more details about how to do that.
                                    </Alert>
                                </div>
                            ) : null}
                            {isUpdate ? (
                                isSyncOver ? (
                                    <p>
                                        All your Magento 2 customers have been
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
                                                Importing your Magento 2
                                                customers
                                            </b>
                                        </p>
                                        <p>
                                            We're currently importing all your
                                            Magento 2 customers. This way,
                                            you'll see customer & orders info
                                            next to tickets. We'll notify you
                                            via email when the import is done.
                                            We typically sync 3,000 customers an
                                            hour.{' '}
                                            <Link to="/app/customers">
                                                Review imported customers.
                                            </Link>
                                        </p>
                                    </Alert>
                                )
                            ) : null}
                            {!isUpdate && (
                                <>
                                    <span>
                                        How do you want to add this integration?
                                    </span>
                                    <div
                                        className={
                                            css['selection-button-group']
                                        }
                                    >
                                        <Magento2ModeSelectionButton
                                            text="One-click installation"
                                            icon="storefront"
                                            selected={
                                                this.state.isManual === false
                                            }
                                            onClick={() =>
                                                this.setState({isManual: false})
                                            }
                                        />
                                        <Magento2ModeSelectionButton
                                            text="Manual installation"
                                            icon="build"
                                            selected={
                                                this.state.isManual === true
                                            }
                                            onClick={() =>
                                                this.setState({isManual: true})
                                            }
                                        />
                                    </div>
                                </>
                            )}

                            {!isUpdate && this.state.isManual && (
                                <Alert
                                    color="warning"
                                    style={{marginBottom: '15px'}}
                                >
                                    This option is useful if you have a firewall
                                    configured on your Magento store that
                                    prevents you from adding the integration
                                    using the one-click installation process.
                                </Alert>
                            )}

                            {this.state.isManual ? (
                                <Magento2ManualIntegrationForm
                                    integration={integration}
                                    isUpdate={isUpdate}
                                    actions={actions}
                                    isSubmitting={isSubmitting}
                                />
                            ) : (
                                <Magento2OneClickIntegrationForm
                                    integration={integration}
                                    isUpdate={isUpdate}
                                    actions={actions}
                                    isSubmitting={isSubmitting}
                                    redirectUri={this.props.redirectUri}
                                />
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default withRouter(connect(null, {notify})(Magento2IntegrationDetail))
