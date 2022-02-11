import React from 'react'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {Map} from 'immutable'
import _isEmpty from 'lodash/isEmpty'
import {Breadcrumb, BreadcrumbItem, Col, Container, Row} from 'reactstrap'
import {parse} from 'qs'
import classNames from 'classnames'

import {NotificationStatus} from '../../../../../state/notifications/types'
import {notify} from '../../../../../state/notifications/actions'
import {triggerCreateSuccess} from '../../../../../state/integrations/actions'
import Loader from '../../../../common/components/Loader/Loader'
import PageHeader from '../../../../common/components/PageHeader'
import Alert, {AlertType} from '../../../../common/components/Alert/Alert'
import history from '../../../../history'
import settingsCss from '../../../../settings/settings.less'

import css from './Magento2ManualSelectionButton.less'
import Magento2ManualIntegrationForm from './Magento2ManualIntegrationForm'
import Magento2OneClickIntegrationForm from './Magento2OneClickIntegrationForm'
import Magento2ModeSelectionButton from './Magento2ModeSelectionButton'

type Props = {
    integration: Map<any, any>
    isUpdate: boolean
    loading: Map<any, any>
    redirectUri: string
} & RouteComponentProps &
    ConnectedProps<typeof connector>

type State = {
    isManual: boolean
    isInitialized: boolean
}

export class Magento2IntegrationDetail extends React.Component<Props, State> {
    state = {
        isInitialized: false,
        isManual: false,
    }

    componentDidMount() {
        // display message from url
        const {location, isUpdate} = this.props
        const message = parse(location.search, {ignoreQueryPrefix: true})
            .message as string
        const status =
            (parse(location.search).message_type as NotificationStatus) ||
            NotificationStatus.Info
        this.setState({isInitialized: !isUpdate})

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
            const isAuthenticating =
                parse(nextProps.location.search, {ignoreQueryPrefix: true})
                    .action === 'authentication'

            if (isAuthenticating) {
                this.props.triggerCreateSuccess(nextProps.integration.toJS())
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
        const {integration, isUpdate, loading} = this.props

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

                <Container fluid className={settingsCss.pageContainer}>
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
                                    <Alert
                                        type={AlertType.Warning}
                                        className={settingsCss.mb16}
                                    >
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
                                    <Alert className={settingsCss.mb16}>
                                        <p>
                                            <b className="alert-heading">
                                                <i className="material-icons md-spin mr-2">
                                                    autorenew
                                                </i>
                                                Importing your Magento 2
                                                customers
                                            </b>
                                        </p>
                                        <span>
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
                                        </span>
                                    </Alert>
                                )
                            ) : null}
                            {!isUpdate && (
                                <>
                                    <span>
                                        How do you want to add this integration?
                                    </span>
                                    <div
                                        className={classNames(
                                            css['selection-button-group'],
                                            settingsCss.mt4
                                        )}
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
                                    type={AlertType.Warning}
                                    className="mb-3"
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
                                    isSubmitting={isSubmitting}
                                />
                            ) : (
                                <Magento2OneClickIntegrationForm
                                    integration={integration}
                                    isUpdate={isUpdate}
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

const connector = connect(null, {
    notify,
    triggerCreateSuccess,
})

export default withRouter(connector(Magento2IntegrationDetail))
