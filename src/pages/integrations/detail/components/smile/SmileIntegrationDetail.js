// @flow
import React from 'react'
import type {Map} from 'immutable'
import {Link, withRouter} from 'react-router'
import classNames from 'classnames'
import {
    Alert,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Row,
} from 'reactstrap'

import {PENDING_AUTHENTICATION_STATUS} from '../../../../../constants/integration'
import Loader from '../../../../common/components/Loader'
import ConfirmButton from '../../../../common/components/ConfirmButton'
import InputField from '../../../../common/forms/InputField'
import PageHeader from '../../../../common/components/PageHeader'


type Props = {
    integration: Map<*, *>,

    actions: Object,
    loading: Map<*, *>,

    // Router
    location: Object
}

type State = {
    name: string
}

export class SmileIntegrationDetailComponent extends React.Component<Props, State> {
    isInitialized = false

    state = {
        name: ''
    }

    componentDidMount() {
        if (!this.props.integration.isEmpty()) {
            this.setState({name: this.props.integration.get('name')})
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.integration.isEmpty() && !nextProps.integration.isEmpty()) {
            this.setState({name: nextProps.integration.get('name')})

            const authenticationRequired =
                nextProps.integration.getIn(['meta', 'oauth', 'status']) === PENDING_AUTHENTICATION_STATUS
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

    _handleUpdate = (evt: Event): void => {
        evt.preventDefault()
        const {integration, actions} = this.props

        actions.updateOrCreateIntegration(integration.set('name', this.state.name))
    }

    render() {
        const {actions, integration, loading} = this.props

        const isSubmitting = loading.get('updateIntegration')
        const isActive = !integration.get('deactivated_datetime')

        const authenticationRequired =
            integration.getIn(['meta', 'oauth', 'status']) === PENDING_AUTHENTICATION_STATUS

        const isImportOver = integration.getIn(['meta', 'sync_state', 'is_initialized'])

        if (loading.get('integration')) {
            return <Loader/>
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
                            {integration.get('name')}
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}
                />

                <Container
                    fluid
                    className="page-container"
                >
                    <Row>
                        <Col md="8">
                            {
                                isActive && isImportOver !== undefined && (
                                    isImportOver
                                        ? (
                                            <p>
                                                All your Smile customers have been imported. You can now see their info
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
                                                        Importing your Smile customers
                                                    </b>
                                                </p>
                                                <p>
                                                    We're currently importing all your Smile customers. This way,
                                                    you'll see customer rewards points next to tickets. We'll notify
                                                    you via email when the import is done.{' '}
                                                    <Link to="/app/customers">Review imported customers.</Link>
                                                </p>
                                            </Alert>
                                        )
                                )
                            }

                            <InputField
                                type="text"
                                name="name"
                                label="Integration name"
                                value={this.state.name}
                                onChange={(value) => this.setState({name: value})}
                            />

                            <div>
                                <Button
                                    type="submit"
                                    color="success"
                                    className={classNames('mr-2', {
                                        'btn-loading': isSubmitting,
                                    })}
                                    onClick={this._handleUpdate}
                                    disabled={isSubmitting}
                                >
                                    Update integration
                                </Button>

                                {
                                    !authenticationRequired && isActive && (
                                        <Button
                                            type="button"
                                            color="warning"
                                            outline
                                            className={classNames({
                                                'btn-loading': isSubmitting,
                                            })}
                                            onClick={() => actions.deactivateIntegration(integration.get('id'))}
                                            disabled={isSubmitting}
                                        >
                                            Deactivate integration
                                        </Button>
                                    )
                                }
                                {
                                    !authenticationRequired && !isActive && (
                                        <Button
                                            type="button"
                                            color="success"
                                            className={classNames({
                                                'btn-loading': isSubmitting,
                                            })}
                                            onClick={() => actions.activateIntegration(integration.get('id'))}
                                            disabled={isSubmitting}
                                        >
                                            Re-activate integration
                                        </Button>
                                    )
                                }
                                <ConfirmButton
                                    className="float-right"
                                    color="secondary"
                                    confirm={() => actions.deleteIntegration(integration)}
                                    content="Are you sure you want to delete this integration?"
                                    disabled={isSubmitting}
                                >
                                    <i className="material-icons mr-1 text-danger">
                                        delete
                                    </i>
                                    Delete
                                </ConfirmButton>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default withRouter(SmileIntegrationDetailComponent)
