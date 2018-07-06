import React from 'react'
import {Link, withRouter} from 'react-router'
import classNames from 'classnames'
import _isEmpty from 'lodash/isEmpty'
import {
    Alert,
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


type Props = {
    integration: string,
    actions: Object,
    loading: Object,

    redirectUri: string,

    // Router
    location: Object,
    params: Object
}

type State = {
    store_name: string
}

class SmileIntegrationDetail extends React.Component<Props, State> {
    isInitialized = false

    state = {
        store_name: ''
    }

    componentWillReceiveProps(nextProps) {
        if (_isEmpty(this.props.integration.toJS()) && !_isEmpty(nextProps.integration.toJS())) {
            const authenticationRequired = nextProps.integration.getIn(['meta', 'oauth', 'status']) === 'pending'
            const isAuthenticating = nextProps.location.query.action === 'authentication'

            if (isAuthenticating) {
                if (authenticationRequired) {
                    setTimeout(
                        nextProps.actions.fetchIntegration(
                            nextProps.integration.get('id'),
                            nextProps.integration.get('type'),
                            true)
                        , 3000)
                } else {
                    nextProps.actions.triggerCreateSuccess(nextProps.integration.toJS())
                }
            }
        }
    }

    _updateAppPermissions = () => {
        const name = this.props.integration.getIn(['meta', 'store_name'])
        window.location.href = this.props.redirectUri.concat('?store_name=').concat(name)
    }

    _submit = () => {
        window.location.href = this.props.redirectUri.concat('?store_name=').concat(this.state.store_name)
    }

    render() {
        const {actions, integration, loading} = this.props

        const isUpdate = this.props.params.integrationId !== 'new'
        const isSubmitting = loading.get('updateIntegration')
        const isActive = !integration.get('deactivated_datetime')

        const authenticationRequired = this.props.integration.getIn(['meta', 'oauth', 'status']) === 'pending'

        const isSyncOver = integration.getIn(['meta', 'sync_state', 'is_initialized'])

        if (loading.get('integration')) {
            return <Loader />
        }

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/smile">Smile</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {isUpdate ? integration.get('name') : 'Add integration'}
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}
                />

                <Container fluid className="page-container">
                    <Row>
                        <Col md="8">
                            {
                                isUpdate && isActive && isSyncOver !== undefined && (
                                    isSyncOver
                                        ? (
                                            <p>
                                                All your Smile customers have been imported. You can now see their info in the
                                                sidebar. <Link to="/app/customers">Review your customers.</Link>
                                            </p>
                                        ) : (
                                            <Alert color="info" className="mb-4">
                                                <p>
                                                    <b className="alert-heading">
                                                        <i className="fa fa-refresh fa-spin mr-2" />
                                                        Importing your Smile customers
                                                    </b>
                                                </p>
                                                <p>
                                                    We're currently importing all your Smile customers. This way, you'll see
                                                    customer rewards points next to tickets. We'll notify you via email when the
                                                    import is done. <Link to="/app/customers">Review imported customers.</Link>
                                                </p>
                                            </Alert>
                                        )
                                )
                            }

                            <InputField
                                type="text"
                                name="name"
                                label="Shopify store name"
                                value={isUpdate ? integration.get('name') : undefined}
                                onChange={(value) => this.setState({store_name: value})}
                                placeholder={'ex: "acme" for acme.myshopify.com'}
                                disabled={isUpdate}
                                rightAddon=".myshopify.com"
                                required
                            />

                            <div>
                                {
                                    !isUpdate && (
                                        <Button
                                            type="button"
                                            color="success"
                                            className={classNames({
                                                'btn-loading': isSubmitting,
                                            })}
                                            onClick={() => this._submit()}
                                        >
                                            Add Smile integration
                                        </Button>
                                    )
                                }
                                {
                                    isUpdate && !authenticationRequired && isActive && (
                                        <Button
                                            type="button"
                                            color="warning"
                                            outline
                                            className={classNames({
                                                'btn-loading': isSubmitting,
                                            })}
                                            onClick={() => actions.deactivateIntegration(integration.get('id'))}
                                        >
                                            Deactivate integration
                                        </Button>
                                    )
                                }
                                {
                                    isUpdate && !authenticationRequired && !isActive && (
                                        <Button
                                            type="button"
                                            color="success"
                                            className={classNames({
                                                'btn-loading': isSubmitting,
                                            })}
                                            onClick={() => actions.activateIntegration(integration.get('id'))}
                                        >
                                            Re-activate integration
                                        </Button>
                                    )
                                }
                                {
                                    isUpdate && (
                                        <ConfirmButton
                                            className="float-right"
                                            color="secondary"
                                            confirm={() => actions.deleteIntegration(integration)}
                                            content="Are you sure you want to delete this integration?"
                                        >
                                            <i className="material-icons mr-1 text-danger">
                                                delete
                                            </i>
                                            Delete
                                        </ConfirmButton>
                                    )
                                }
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default withRouter(SmileIntegrationDetail)
