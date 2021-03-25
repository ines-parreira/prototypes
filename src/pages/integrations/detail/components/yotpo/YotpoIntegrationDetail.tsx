import React, {MouseEvent} from 'react'
import {Link, withRouter, RouteComponentProps} from 'react-router-dom'
import classNames from 'classnames'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Row,
} from 'reactstrap'
import {parse} from 'query-string'
import {fromJS, Map} from 'immutable'

import {PENDING_AUTHENTICATION_STATUS} from '../../../../../constants/integration'
import Loader from '../../../../common/components/Loader/Loader'
import ConfirmButton from '../../../../common/components/ConfirmButton'
import InputField from '../../../../common/forms/InputField.js'
import PageHeader from '../../../../common/components/PageHeader'

interface IActions {
    updateOrCreateIntegration: (data: Map<string, string> | undefined) => void
    fetchIntegration: (s1: string, s2: string, b: boolean) => () => string
    triggerCreateSuccess: (j: JSON) => void
    deleteIntegration: (integration: Map<string, unknown>) => void
}

type Props = {
    integration: Map<string, unknown>
    loading: Map<string, string>
    actions: IActions
    redirectUri: Location
} & RouteComponentProps

export class YotpoIntegrationDetailComponent extends React.Component<Props> {
    state = {
        integrationName: '',
    }

    componentDidMount(): void {
        if (!this.props.integration.isEmpty()) {
            this.setState({integrationName: this.props.integration.get('name')})
        }
    }

    componentWillReceiveProps(nextProps: Props): void {
        if (
            this.props.integration.isEmpty() &&
            !nextProps.integration.isEmpty()
        ) {
            this.setState({integrationName: nextProps.integration.get('name')})
            const authenticationRequired =
                nextProps.integration.getIn(['meta', 'oauth', 'status']) ===
                PENDING_AUTHENTICATION_STATUS
            const isAuthenticating =
                parse(nextProps.location.search)?.action === 'authentication'

            if (isAuthenticating) {
                if (authenticationRequired) {
                    setTimeout(
                        nextProps.actions.fetchIntegration(
                            nextProps.integration.get('id') as string,
                            nextProps.integration.get('type') as string,
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

    _handleUpdate = (evt: MouseEvent): void => {
        evt.preventDefault()
        this.props.actions.updateOrCreateIntegration(
            fromJS({
                id: this.props.integration.get('id'),
                name: this.state.integrationName,
            })
        )
    }

    render(): JSX.Element {
        const {actions, integration, loading} = this.props

        const isSubmitting = loading.get('updateIntegration')

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
                                <Link to="/app/settings/integrations/yotpo">
                                    Yotpo
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                {integration.get('name') as string}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />
                <Container fluid className="page-container">
                    <Row>
                        <Col md="8">
                            <InputField
                                type="text"
                                name="name"
                                label="Integration name"
                                value={this.state.integrationName}
                                onChange={(value: string) =>
                                    this.setState({integrationName: value})
                                }
                            />

                            <div>
                                <Button
                                    type="submit"
                                    color="success"
                                    className={classNames('mr-2', {
                                        'btn-loading': isSubmitting,
                                    })}
                                    onClick={this._handleUpdate}
                                    disabled={!!isSubmitting}
                                >
                                    Update integration
                                </Button>
                                <Button
                                    type="button"
                                    color="success"
                                    className={classNames({
                                        'btn-loading': isSubmitting,
                                    })}
                                    onClick={() =>
                                        (window.location = this.props.redirectUri)
                                    }
                                    disabled={!!isSubmitting}
                                >
                                    Reconnect integration
                                </Button>
                                <ConfirmButton
                                    className="float-right"
                                    color="secondary"
                                    confirm={() =>
                                        actions.deleteIntegration(integration)
                                    }
                                    content="Are you sure you want to delete this integration?"
                                    disabled={!!isSubmitting}
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

export default withRouter(YotpoIntegrationDetailComponent)
