import React, {Component, SyntheticEvent} from 'react'
import {Map, fromJS} from 'immutable'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Col, Container, Row} from 'reactstrap'
import {parse} from 'qs'
import {connect, ConnectedProps} from 'react-redux'

import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Button from 'pages/common/components/button/Button'
import {PENDING_AUTHENTICATION_STATUS} from 'constants/integration'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import {
    fetchIntegration,
    deleteIntegration,
    updateOrCreateIntegration,
} from 'state/integrations/actions'

import DEPRECATED_InputField from '../../../../common/forms/DEPRECATED_InputField'

import css from '../../../../settings/settings.less'

type Props = {
    integration: Map<any, any>
    redirectUri: string
    loading: Map<any, any>
} & RouteComponentProps &
    ConnectedProps<typeof connector>

type State = {
    name: string
}

export class SmileIntegrationDetailComponent extends Component<Props, State> {
    isInitialized = false

    state: State = {
        name: '',
    }

    componentDidMount() {
        if (!this.props.integration.isEmpty()) {
            this.setState({name: this.props.integration.get('name')})
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (
            this.props.integration.isEmpty() &&
            !nextProps.integration.isEmpty()
        ) {
            this.setState({name: nextProps.integration.get('name')})

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
                }
            }
        }
    }

    _handleUpdate = (evt: SyntheticEvent<HTMLButtonElement>): void => {
        evt.preventDefault()
        const {integration, updateOrCreateIntegration} = this.props
        void updateOrCreateIntegration(
            fromJS({id: integration.get('id'), name: this.state.name})
        )
    }

    _onReactivate = () => {
        window.location.href = this.props.redirectUri
    }

    render() {
        const {deleteIntegration, integration, loading} = this.props

        const isSubmitting = loading.get('updateIntegration')
        const isActive = !integration.get('deactivated_datetime')
        const authenticationRequired =
            integration.getIn(['meta', 'oauth', 'status']) ===
            PENDING_AUTHENTICATION_STATUS

        const isImportOver = integration.getIn([
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
                                    Apps & integrations
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations/smile">
                                    Smile
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                {integration.get('name')}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <Container fluid className={css.pageContainer}>
                    <Row>
                        <Col md="8">
                            {isActive &&
                                isImportOver !== undefined &&
                                (isImportOver ? (
                                    <p>
                                        All your Smile customers have been
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
                                                Importing your Smile customers
                                            </b>
                                        </p>
                                        <span>
                                            We're currently importing all your
                                            Smile customers. This way, you'll
                                            see customer rewards points next to
                                            tickets. We'll notify you via email
                                            when the import is done.
                                        </span>
                                    </LinkAlert>
                                ))}

                            <DEPRECATED_InputField
                                type="text"
                                name="name"
                                label="Integration name"
                                value={this.state.name}
                                onChange={(value) =>
                                    this.setState({name: value})
                                }
                            />

                            <div>
                                <Button
                                    type="submit"
                                    className="mr-2"
                                    onClick={this._handleUpdate}
                                    isLoading={isSubmitting}
                                >
                                    Update integration
                                </Button>
                                {!authenticationRequired && !isActive && (
                                    <Button
                                        type="button"
                                        onClick={this._onReactivate}
                                        isLoading={isSubmitting}
                                    >
                                        Reconnect
                                    </Button>
                                )}
                                <ConfirmButton
                                    className="float-right"
                                    onConfirm={() =>
                                        deleteIntegration(integration)
                                    }
                                    confirmationContent="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                                    isDisabled={isSubmitting}
                                    intent="destructive"
                                >
                                    <ButtonIconLabel icon="delete">
                                        Delete integration
                                    </ButtonIconLabel>
                                </ConfirmButton>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

const connector = connect(null, {
    fetchIntegration,
    deleteIntegration,
    updateOrCreateIntegration,
})
export default withRouter(connector(SmileIntegrationDetailComponent))
