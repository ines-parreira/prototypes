import classNames from 'classnames'
import {fromJS, Map} from 'immutable'
import {LDFlagSet, withLDConsumer} from 'launchdarkly-react-client-sdk'
import {parse} from 'qs'
import React, {MouseEvent, Component} from 'react'
import {Link, RouteComponentProps} from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Row,
} from 'reactstrap'

import {FeatureFlagKey} from 'config/featureFlags'
import {PENDING_AUTHENTICATION_STATUS} from 'constants/integration'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import CheckBox from 'pages/common/forms/CheckBox'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import withRouter from 'pages/common/utils/withRouter'
import {INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT} from 'pages/integrations/integration/constants'
import {getRemovalConfirmationMessageWithSavedFiltersText} from 'pages/integrations/integration/utils'
import css from 'pages/settings/settings.less'
import {
    deleteIntegration,
    fetchIntegration,
    triggerCreateSuccess,
    updateOrCreateIntegration,
} from 'state/integrations/actions'

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
    flags?: LDFlagSet
} & RouteComponentProps

type State = {
    integrationName: string
    enable_yotpo_tickets: boolean
}

export class YotpoIntegrationDetailComponent extends Component<Props, State> {
    state: State = {
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

    UNSAFE_componentWillReceiveProps(nextProps: Props): void {
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
        const {actions, integration, loading, flags = {}} = this.props
        const {enable_yotpo_tickets} = this.state

        const isSubmitting = loading.get('updateIntegration')

        if (loading.get('integration')) {
            return <Loader />
        }

        const isAnalyticsSavedFilters =
            !!flags[FeatureFlagKey.AnalyticsSavedFilters]

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
                                    All apps
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
                            <DEPRECATED_InputField
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
                                    onConfirm={() =>
                                        void actions.deleteIntegration(
                                            integration
                                        )
                                    }
                                    confirmationContent={getRemovalConfirmationMessageWithSavedFiltersText(
                                        isAnalyticsSavedFilters,
                                        INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT
                                    )}
                                    isDisabled={!!isSubmitting}
                                    intent="destructive"
                                    leadingIcon="delete"
                                >
                                    Delete App
                                </ConfirmButton>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default withRouter(withLDConsumer()(YotpoIntegrationDetailComponent))
