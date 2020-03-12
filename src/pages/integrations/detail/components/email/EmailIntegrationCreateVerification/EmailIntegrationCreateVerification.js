// @flow
import React from 'react'
import {Alert, Button, Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import {browserHistory, Link} from 'react-router'
import {connect} from 'react-redux'
import classNames from 'classnames'

import ConfirmButton from '../../../../../common/components/ConfirmButton'
import PageHeader from '../../../../../common/components/PageHeader'
import socketManager from '../../../../../../services/socketManager'
import * as accountActions from '../../../../../../state/currentAccount/actions'
import * as integrationActions from '../../../../../../state/integrations/actions'
import * as notificationActions from '../../../../../../state/notifications/actions'
import {getForwardingEmailAddress} from '../../../../../../state/integrations/selectors'

type Props = {
    integration: Object,
    deleteIntegration: (Object, string) => void,
    forwardingEmailAddress: string,
    sendVerificationEmail: () => Promise<void>,
    notify: ({status: string, message: string}) => Promise<void>,
    resendAccountVerificationEmail: () => Promise<void>
}

type State = {
    token: string,
    loading: boolean
}

export class EmailIntegrationCreateVerification extends React.Component<Props, State> {
    state = {
        token: '',
        loading: false
    }

    componentWillMount() {
        const {integration} = this.props

        if (integration.get('id')) {
            socketManager.join('integration', integration.get('id'))
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (!this.props.integration.get('id') && nextProps.integration.get('id')) {
            socketManager.join('integration', nextProps.integration.get('id'))
        }

        if (!this.props.integration.getIn(['meta', 'verified']) && nextProps.integration.getIn(['meta', 'verified'])) {
            browserHistory.push(`/app/settings/integrations/email/${nextProps.integration.get('id')}`)
        }
    }

    componentWillUnmount() {
        const {integration} = this.props
        socketManager.leave('integration', integration.get('id'))
    }

    _sendVerificationEmail = () => {
        this.setState({loading: true})

        this.props.sendVerificationEmail().then(() => {
            this.setState({loading: false})
        })
    }

    _renderInstructions = () => {
        const {integration, deleteIntegration, forwardingEmailAddress} = this.props
        const isLoading = this.state.loading

        return (
            <div>
                <Alert
                    color="info"
                    className="mb-4"
                >
                    <i className="material-icons md-spin mr-2">
                        autorenew
                    </i>
                  We're waiting to receive your verification email on <strong>{forwardingEmailAddress}</strong>.
                </Alert>
                <p>
                    If you haven't set up the forwarding yet, you'll find the instructions{' '}
                    <Link to={`/app/settings/integrations/email/${integration.get('id')}/forwarding`}>there</Link>.<br/>
                    If you have setup forwarding after having received the verification email, click on the button{' '}
                    below to re-send it.
                </p>
                <Button
                    type="button"
                    disabled={isLoading}
                    className={classNames({
                        'btn-loading': isLoading,
                    })}
                    onClick={this._sendVerificationEmail}
                >
                    <i className="material-icons">mail</i>{' '}Re-send verification email
                </Button>
                <ConfirmButton
                    className="float-right"
                    color="secondary"
                    confirm={() => deleteIntegration(integration, 'email')}
                    content="Are you sure you want to delete this integration?"
                >
                    <i className="material-icons mr-1 text-danger">
                        delete
                    </i>
                    Delete email address
                </ConfirmButton>
            </div>
        )
    }

    _renderBaseIntegrationInstructions = () => {
        const {resendAccountVerificationEmail} = this.props

        return (
            <div>

                <Alert
                    color="warning"
                    className="mb-4"
                >
                    In order to verify your base email integration, you need to verify your own email address. Please
                    check your inbox, you should have received a verification email from us. If you did not, you can
                    re-send this email by{' '}
                    <Button
                        color="link"
                        className="p-0"
                        style={{verticalAlign: 'initial'}}
                        onClick={resendAccountVerificationEmail}
                    >
                        clicking here
                    </Button>
                    .
                </Alert>
            </div>
        )
    }

    render() {
        const {integration} = this.props

        const address = integration.getIn(['meta', 'address'], '')
        const isBaseEmailIntegration = address.endsWith(window.EMAIL_FORWARDING_DOMAIN)

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/email">Email</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {integration.get('name')}{' '}
                            <span className="text-faded">
                                {integration.getIn(['meta', 'address'])}
                            </span>
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <Container
                    fluid
                    className="page-container"
                >
                    <h1>
                        <i className="material-icons"></i>
                        Verification in progress...
                    </h1>

                    {
                        isBaseEmailIntegration
                            ? this._renderBaseIntegrationInstructions()
                            : this._renderInstructions()
                    }
                </Container>
            </div>
        )
    }
}

export default connect((state) => ({
    forwardingEmailAddress: getForwardingEmailAddress(state)
}), {
    sendVerificationEmail: integrationActions.sendVerificationEmail,
    notify: notificationActions.notify,
    deleteIntegration: integrationActions.deleteIntegration,
    resendAccountVerificationEmail: accountActions.resendVerificationEmail,
})(EmailIntegrationCreateVerification)
