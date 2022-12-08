import React, {Component, FormEvent} from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Form,
    Button as ReactstrapButton,
} from 'reactstrap'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import classNames from 'classnames'
import {Map} from 'immutable'

import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import socketManager from 'services/socketManager/socketManager'
import {resendVerificationEmail} from 'state/currentAccount/actions'
import {
    sendVerificationEmail,
    verifyEmailIntegrationManually,
    deleteIntegration,
} from 'state/integrations/actions'
import {notify} from 'state/notifications/actions'
import {
    getForwardingEmailAddress,
    getEmailForwardingActivated,
} from 'state/integrations/selectors'
import {RootState} from 'state/types'
import {JoinEventType} from 'services/socketManager/types'
import history from 'pages/history'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import PageHeader from 'pages/common/components/PageHeader'
import css from 'pages/settings/settings.less'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {isBaseEmailAddress} from '../helpers'

type OwnProps = {
    integration: Map<any, any>
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    token: string
    loading: boolean
    isDisabled: boolean
    isVerificationLoading: boolean
}

export class EmailIntegrationCreateVerification extends Component<
    Props,
    State
> {
    state = {
        token: '',
        loading: false,
        isDisabled: false,
        isVerificationLoading: false,
    }

    componentWillMount() {
        const {integration} = this.props

        if (integration.get('id')) {
            socketManager.join(JoinEventType.Integration, integration.get('id'))
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (
            !this.props.integration.get('id') &&
            nextProps.integration.get('id')
        ) {
            socketManager.join(
                JoinEventType.Integration,
                nextProps.integration.get('id')
            )
        }

        if (
            !this.props.integration.getIn(['meta', 'verified']) &&
            nextProps.integration.getIn(['meta', 'verified'])
        ) {
            history.push(
                `/app/settings/channels/email/${
                    nextProps.integration.get('id') as number
                }`
            )
        }
    }

    componentWillUnmount() {
        const {integration} = this.props
        socketManager.leave(JoinEventType.Integration, integration.get('id'))
    }

    _sendVerificationEmail = () => {
        this.setState({loading: true, isDisabled: true})

        void this.props.sendVerificationEmail().then(() => {
            this.setState({loading: false, isDisabled: false})
        })
    }

    _verifyEmailIntegrationManually = (e: FormEvent) => {
        e.preventDefault()
        this.setState({isVerificationLoading: true, isDisabled: true})
        void this.props
            .verifyEmailIntegrationManually(this.state.token)
            .then(() => {
                this.setState({isVerificationLoading: false, isDisabled: false})
            })
    }

    _renderInstructions = () => {
        const {
            integration,
            deleteIntegration,
            forwardingEmailAddress,
            emailForwardingActivated,
        } = this.props
        const isLoading = this.state.loading
        const isShowingManualEmailVerificationForm =
            emailForwardingActivated ||
            this.props.integration.getIn(
                ['meta', 'email_forwarding_activated'],
                false
            )
        return (
            <div>
                {!isShowingManualEmailVerificationForm && (
                    <Alert
                        className={css.mb16}
                        icon={
                            <i className="material-icons md-spin">autorenew</i>
                        }
                    >
                        We're waiting to receive your verification email on{' '}
                        <strong>{forwardingEmailAddress}</strong>.
                    </Alert>
                )}
                {isShowingManualEmailVerificationForm && (
                    <div>
                        if you've received the verification email but your
                        integration still reads "Verification in progress...",
                        you can manually input the verification code listed in
                        the verification email.
                        <br />
                        <br />
                        <Form onSubmit={this._verifyEmailIntegrationManually}>
                            <DEPRECATED_InputField
                                name="code"
                                type="text"
                                label="Input verification code manually"
                                placeholder="f69a26"
                                onChange={(code) =>
                                    this.setState({token: code})
                                }
                            />
                            <Button
                                type="submit"
                                color="primary"
                                isDisabled={this.state.isDisabled}
                                className={classNames({
                                    'btn-loading':
                                        this.state.isVerificationLoading,
                                })}
                            >
                                Verify your integration
                            </Button>
                        </Form>
                        <br />
                    </div>
                )}
                <p>
                    If you haven't set up the forwarding yet, you'll find the
                    instructions{' '}
                    <Link
                        to={`/app/settings/channels/email/${
                            integration.get('id') as number
                        }/forwarding`}
                    >
                        there
                    </Link>
                    .<br />
                    If you have setup forwarding after having received the
                    verification email, click on the button below to re-send it.
                </p>
                <Button
                    intent="primary"
                    isDisabled={this.state.isDisabled}
                    className={classNames({
                        'btn-loading': isLoading,
                    })}
                    onClick={this._sendVerificationEmail}
                >
                    <i className="material-icons">mail</i> Re-send verification
                    email
                </Button>
                <ConfirmButton
                    onConfirm={() => deleteIntegration(integration)}
                    confirmationContent="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                    isDisabled={this.state.isDisabled}
                    intent="destructive"
                    className="float-right"
                >
                    <ButtonIconLabel icon="delete">
                        Delete email address
                    </ButtonIconLabel>
                </ConfirmButton>
            </div>
        )
    }

    _renderBaseIntegrationInstructions = () => {
        const {resendAccountVerificationEmail} = this.props

        return (
            <div>
                <Alert type={AlertType.Warning} className={css.mb16}>
                    In order to verify your base email integration, you need to
                    verify your own email address. Please check your inbox, you
                    should have received a verification email from us. If you
                    did not, you can re-send this email by{' '}
                    <ReactstrapButton
                        color="link"
                        className="p-0"
                        style={{verticalAlign: 'initial'}}
                        onClick={resendAccountVerificationEmail}
                    >
                        clicking here
                    </ReactstrapButton>
                    .
                </Alert>
            </div>
        )
    }

    render() {
        const {integration} = this.props

        const address: string = integration.getIn(['meta', 'address'], '')
        const isBaseEmailIntegration = isBaseEmailAddress(address)

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/channels/email">
                                    Email
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                {integration.get('name')}{' '}
                                <span className="text-faded">
                                    {integration.getIn(['meta', 'address'])}
                                </span>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <Container fluid className={css.pageContainer}>
                    <h1>
                        <i className="material-icons"></i>
                        Verification in progress...
                    </h1>

                    {isBaseEmailIntegration
                        ? this._renderBaseIntegrationInstructions()
                        : this._renderInstructions()}
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState, props: OwnProps) => ({
        forwardingEmailAddress: getForwardingEmailAddress(state),
        emailForwardingActivated: getEmailForwardingActivated(
            props.integration.get('id')
        )(state),
    }),
    {
        sendVerificationEmail,
        verifyEmailIntegrationManually,
        notify,
        deleteIntegration,
        resendAccountVerificationEmail: resendVerificationEmail,
    }
)

export default connector(EmailIntegrationCreateVerification)
