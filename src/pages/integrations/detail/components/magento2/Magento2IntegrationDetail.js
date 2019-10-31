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
} from 'reactstrap'

import Loader from '../../../../common/components/Loader'
import ConfirmButton from '../../../../common/components/ConfirmButton'
import InputField from '../../../../common/forms/InputField'
import PageHeader from '../../../../common/components/PageHeader'

import {notify} from '../../../../../state/notifications/actions'
import * as integrationSelectors from '../../../../../state/integrations/selectors'


type Props = {
    integration: Map<*, *>,
    isUpdate: boolean,
    actions: Object,
    loading: Object,

    redirectUri: string,

    getExistingMagento2Integration: (string) => Map<*, *>,

    // Router
    location: Object,

    // Actions
    notify: typeof notify
}

type State = {
    adminUrl: string,
    url: string,
    adminUrlSuffix: string,
    isInitialized: boolean
}

class Magento2IntegrationDetail extends React.Component<Props, State> {
    state = {
        adminUrl: '',
        url: '',
        adminUrlSuffix: '',
        isInitialized: false
    }

    componentDidMount() {
        // display message from url
        const {
            location: {
                query: {
                    message,
                    message_type: status = 'info',
                }
            },
            isUpdate
        } = this.props

        this.setState({isInitialized: !isUpdate})

        if (message) {
            this.props.notify({
                status,
                message: decodeURIComponent(message.replace(/\+/g, ' '))
            })
            // remove error from url
            browserHistory.push(window.location.pathname)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (_isEmpty(this.props.integration.toJS()) && !_isEmpty(nextProps.integration.toJS())) {
            const isAuthenticating = nextProps.location.query.action === 'authentication'

            if (isAuthenticating) {
                nextProps.actions.triggerCreateSuccess(nextProps.integration.toJS())
            }
        }
    }

    componentWillUpdate(nextProps, nextState) {
        const {integration, isUpdate, loading} = nextProps

        // populating the form when updating an integration
        if (!nextState.isInitialized && isUpdate && !loading.get('integration')) {
            this.setState({
                url: integration.getIn(['meta', 'store_url']),
                adminUrlSuffix: integration.getIn(['meta', 'admin_url_suffix']),
                isInitialized: true
            })
        }
    }

    _handleCreate = (evt: Event): void => {
        const {adminUrl} = this.state
        evt.preventDefault()

        const splitAdminUrl = adminUrl.split('/')
        const url = splitAdminUrl[0]
        const adminUrlSuffix = splitAdminUrl[1]

        window.location.href = this.props.redirectUri.concat(`?store_url=${url}&admin_url_suffix=${adminUrlSuffix}`)
    }

    _handleUpdate = (evt: Event): void => {
        evt.preventDefault()
        const {integration, actions} = this.props

        actions.updateOrCreateIntegration(integration.mergeDeep({
            meta: {
                admin_url_suffix: this.state.adminUrlSuffix
            }
        }))
    }

    render() {
        const {actions, integration, isUpdate, loading, getExistingMagento2Integration} = this.props
        const {adminUrl, url, adminUrlSuffix} = this.state

        const isSubmitting = !!loading.get('updateIntegration')

        const isActive = !integration.get('deactivated_datetime')
        const isSyncOver = integration.getIn(['meta', 'import_state', 'is_over'])

        const ctaIsLoading = isSubmitting

        if (loading.get('integration')) {
            return <Loader/>
        }

        const error = !isUpdate && !getExistingMagento2Integration(url).isEmpty()
            ? 'There is already an integration for this Magento 2 store'
            : null

        const submitIsDisabled = isSubmitting || !!error

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/magento2">Magento 2</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {isUpdate ? integration.get('name') : 'Add integration'}
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <Container
                    fluid
                    className="page-container"
                >
                    <Row>
                        <Col md="8">
                            {
                                !isUpdate ? (
                                    <p>
                                        Let's connect your store to Gorgias. We'll import your Magento 2 customers in
                                        Gorgias, along with their order information. This way, when they contact you,
                                        you'll be able to see their Magento 2 information next to tickets.
                                    </p>
                                ) : null
                            }
                            {
                                isUpdate ? (
                                    isSyncOver ? (
                                        <p>
                                            All your Magento 2 customers have been imported. You can now see their info
                                            in the sidebar. <Link to="/app/customers">Review your customers.</Link>
                                        </p>
                                    ) : (
                                        <Alert
                                            color="info"
                                            className="mb-4"
                                        >
                                            <p>
                                                <b className="alert-heading">
                                                    <i className="material-icons md-spin mr-2">
                                                        autorenew
                                                    </i>
                                                    Importing your Magento 2 customers
                                                </b>
                                            </p>
                                            <p>
                                                We're currently importing all your Magento 2 customers. This way, you'll
                                                see customer & orders info next to tickets. We'll notify you via email
                                                when the import is done. We typically sync 3,000 customers an hour.{' '}
                                                <Link to="/app/customers">Review imported customers.</Link>
                                            </p>
                                        </Alert>
                                    )
                                ) : null
                            }

                            <Form onSubmit={isUpdate ? this._handleUpdate : this._handleCreate}>
                                <div className="mb-4">
                                    {
                                        isUpdate ? (
                                            <InputField
                                                key="input"
                                                type="text"
                                                name="adminUrlSuffix"
                                                label="Store admin URL"
                                                placeholder={'ex: admin_45f1c'}
                                                leftAddon={`https://${url}/`}
                                                value={adminUrlSuffix}
                                                error={error}
                                                onChange={(adminUrlSuffix) => this.setState({adminUrlSuffix})}
                                                required
                                            />
                                        ) : (
                                            <InputField
                                                type="text"
                                                name="name"
                                                label="Store admin URL"
                                                placeholder={'ex: acme.com/admin_45f1c'}
                                                value={adminUrl}
                                                error={error}
                                                leftAddon="https://"
                                                onChange={(adminUrl) => this.setState({adminUrl})}
                                                pattern="[\w\d\.]+/[\w\d]+/?"
                                                required
                                            />
                                        )
                                    }
                                </div>

                                <div>
                                    <Button
                                        type="submit"
                                        color="success"
                                        className={classNames('mr-2', {
                                            'btn-loading': ctaIsLoading,
                                        })}
                                        disabled={submitIsDisabled}
                                    >
                                        {isUpdate ? 'Update integration' : 'Add integration'}
                                    </Button>

                                    {
                                        isUpdate && isActive ? (
                                            <Button
                                                type="button"
                                                color="warning"
                                                outline
                                                className={classNames({
                                                    'btn-loading': isSubmitting,
                                                })}
                                                disabled={isSubmitting}
                                                onClick={() => actions.deactivateIntegration(integration.get('id'))}
                                            >
                                                Deactivate integration
                                            </Button>
                                        ) : null
                                    }
                                    {
                                        isUpdate && !isActive ? (
                                            <Button
                                                type="button"
                                                color="success"
                                                className={classNames({
                                                    'btn-loading': isSubmitting,
                                                })}
                                                disabled={isSubmitting}
                                                onClick={() => actions.activateIntegration(integration.get('id'))}
                                            >
                                                Re-activate integration
                                            </Button>
                                        ) : null
                                    }
                                    {
                                        isUpdate ? (
                                            <ConfirmButton
                                                className="float-right"
                                                color="secondary"
                                                confirm={() => actions.deleteIntegration(integration)}
                                                content="Are you sure you want to delete this integration?"
                                            >
                                                <i className="material-icons mr-1 text-danger">
                                                    delete
                                                </i>
                                                Delete integration
                                            </ConfirmButton>
                                        ) : null
                                    }
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default withRouter(connect((state) => {
    return {
        getExistingMagento2Integration: integrationSelectors.makeGetMagento2IntegrationByStoreUrl(state)
    }
}, {notify})(Magento2IntegrationDetail))
