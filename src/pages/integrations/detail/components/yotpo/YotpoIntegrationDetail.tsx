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
import {parse} from 'qs'
import {fromJS, Map} from 'immutable'

import {PENDING_AUTHENTICATION_STATUS} from 'constants/integration'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import {ButtonIntent} from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import CheckBox from 'pages/common/forms/CheckBox'
import InputField from 'pages/common/forms/InputField'
import {
    deleteIntegration,
    fetchIntegration,
    triggerCreateSuccess,
    updateOrCreateIntegration,
} from 'state/integrations/actions'
import css from 'pages/settings/settings.less'

interface IActions {
    deleteIntegration: typeof deleteIntegration
    fetchIntegration: typeof fetchIntegration
    triggerCreateSuccess: typeof triggerCreateSuccess
    updateOrCreateIntegration: typeof updateOrCreateIntegration
}

type Props = {
    integration: Map<string, any>
    loading: Map<string, string>
    actions: IActions
    redirectUri: string
} & RouteComponentProps

export class YotpoIntegrationDetailComponent extends React.Component<Props> {
    state = {
        integrationName: '',
        enable_yotpo_tickets: false,
    }

    componentDidMount(): void {
        if (!this.props.integration.isEmpty()) {
            this.setState({
                integrationName: this.props.integration.get('name'),
                enable_yotpo_tickets: this.props.integration.getIn(
                    ['meta', 'enable_yotpo_tickets'],
                    false
                ),
            })
        }
    }

    componentWillReceiveProps(nextProps: Props): void {
        if (
            this.props.integration.isEmpty() &&
            !nextProps.integration.isEmpty()
        ) {
            this.setState({
                integrationName: nextProps.integration.get('name'),
                enable_yotpo_tickets: nextProps.integration.getIn(
                    ['meta', 'enable_yotpo_tickets'],
                    false
                ),
            })
            const authenticationRequired =
                nextProps.integration.getIn(['meta', 'oauth', 'status']) ===
                PENDING_AUTHENTICATION_STATUS
            const isAuthenticating =
                parse(nextProps.location.search, {ignoreQueryPrefix: true})
                    ?.action === 'authentication'

            if (isAuthenticating) {
                if (authenticationRequired) {
                    setTimeout(() => {
                        nextProps.actions.fetchIntegration(
                            nextProps.integration.get('id') as string,
                            nextProps.integration.get('type') as string,
                            true
                        )
                    }, 3000)
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
                meta: (
                    this.props.integration.get('meta') as Map<any, any>
                ).setIn(
                    ['enable_yotpo_tickets'],
                    this.state.enable_yotpo_tickets
                ),
            })
        )
    }

    render(): JSX.Element {
        const {actions, integration, loading} = this.props
        const {enable_yotpo_tickets} = this.state

        const isSubmitting = loading.get('updateIntegration')

        if (loading.get('integration')) {
            return <Loader />
        }

        const enableYotpoTicketsHelp = (
            <div>
                By Enabling Yotpo tickets, you will allow Yotpo reviews to
                create tickets on Gorgias. If you are using emails to integrate
                Yotpo reviews you should disable the emails to avoid Yotpo
                reviews ticket being duplicated.
            </div>
        )

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
                <Container fluid className={css.pageContainer}>
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
                            <CheckBox
                                name="enable_yotpo_tickets"
                                caption={enableYotpoTicketsHelp}
                                isChecked={enable_yotpo_tickets}
                                onChange={(value: boolean) =>
                                    this.setState({
                                        enable_yotpo_tickets: value,
                                    })
                                }
                            >
                                Enable Yotpo ticket
                            </CheckBox>
                            <br />
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
                                        (window.location.href =
                                            this.props.redirectUri)
                                    }
                                    disabled={!!isSubmitting}
                                >
                                    Reconnect integration
                                </Button>
                                <ConfirmButton
                                    className="float-right"
                                    type="button"
                                    onConfirm={() =>
                                        void actions.deleteIntegration(
                                            integration
                                        )
                                    }
                                    confirmationContent="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                                    isDisabled={!!isSubmitting}
                                    intent={ButtonIntent.Destructive}
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

export default withRouter(YotpoIntegrationDetailComponent)
