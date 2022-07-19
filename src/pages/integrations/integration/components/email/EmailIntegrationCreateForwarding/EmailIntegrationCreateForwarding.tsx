import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import Clipboard from 'clipboard'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {
    Breadcrumb,
    BreadcrumbItem,
    Container,
    InputGroup,
    InputGroupAddon,
    Input,
} from 'reactstrap'
import {Map} from 'immutable'
import outlook from 'assets/img/integrations/outlook.svg'
import office from 'assets/img/integrations/office.svg'
import zoho from 'assets/img/integrations/zoho.svg'
import exchange from 'assets/img/integrations/exchange.svg'
import groups from 'assets/img/integrations/google-groups.svg'

import Button from 'pages/common/components/button/Button'

import {getForwardingEmailAddress} from '../../../../../../state/integrations/selectors'
import {notify} from '../../../../../../state/notifications/actions'
import {sendVerificationEmail} from '../../../../../../state/integrations/actions'
import PageHeader from '../../../../../common/components/PageHeader'
import history from '../../../../../history'
import {RootState} from '../../../../../../state/types'
import {IntegrationType} from '../../../../../../models/integration/types'
import settingsCss from '../../../../../settings/settings.less'

import css from './EmailIntegrationCreateForwarding.less'

const servicesWithTutorials = [
    {
        img: groups,
        title: 'Google Groups',
        link: 'https://gorgias.page/googlegroups',
    },
    {
        img: outlook,
        title: 'Outlook',
        link: 'https://gorgias.page/outlook',
    },
    {
        img: office,
        title: 'Office 365',
        link: 'https://gorgias.page/ms365',
    },
    {
        img: exchange,
        title: 'Microsoft Exchange',
        link: 'https://gorgias.page/msexchange',
    },
    {
        img: zoho,
        title: 'Zoho Mail',
        link: 'https://gorgias.page/zohomail',
    },
]

type Props = {
    integration: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    isCopied: boolean
    isLoading: boolean
}

export class EmailIntegrationCreateForwarding extends Component<Props, State> {
    state = {
        isCopied: false,
        isLoading: false,
    }

    componentDidUpdate() {
        // activate copy to clipboard button only for email integration
        if (this.props.integration.get('type') === IntegrationType.Email) {
            const clipboard = new Clipboard('#copy-forwarding-email')
            clipboard.on('success', () => {
                this.setState({isCopied: true})
                setTimeout(() => {
                    this.setState({isCopied: false})
                }, 1500)
            })
        }
    }

    _onSubmit = () => {
        const {integration} = this.props
        this.setState({isLoading: true})
        void this.props.sendVerificationEmail().then(() => {
            this.setState({isLoading: false})
            history.push(
                `/app/settings/integrations/email/${
                    integration.get('id') as number
                }/verification`
            )
        })
    }

    _renderInstructions = () => {
        const {forwardingEmailAddress, integration} = this.props
        const {isLoading} = this.state
        const address = integration.getIn(['meta', 'address'], '')

        return (
            <div>
                <div className="mb-4">
                    <p>
                        Forward emails from <b>{address}</b> to the address
                        below.
                    </p>

                    <InputGroup>
                        <Input
                            id="forwarding-email"
                            type="text"
                            value={forwardingEmailAddress}
                            readOnly
                        />
                        <InputGroupAddon addonType="append">
                            <Button
                                id="copy-forwarding-email"
                                intent="primary"
                                data-clipboard-target="#forwarding-email"
                            >
                                <i className="material-icons mr-2">file_copy</i>
                                {this.state.isCopied ? 'Copied!' : 'Copy'}
                            </Button>
                        </InputGroupAddon>
                    </InputGroup>
                </div>

                <div className="mb-4">
                    <p>
                        Below are some handful tutorial to setup email
                        forwarding depending on your email provider:
                    </p>

                    <div className="d-flex flex-wrap">
                        {servicesWithTutorials.map((config, idx) => (
                            <Button
                                key={idx}
                                intent="secondary"
                                onClick={() => window.open(config.link)}
                                className={css.forwardingCard}
                            >
                                <img
                                    alt={`${config.title} logo`}
                                    src={config.img}
                                />
                                <div>{config.title}</div>
                            </Button>
                        ))}
                    </div>
                    <p>
                        Using GMail or G Suite?{' '}
                        <Link to="/app/settings/integrations/email/new">
                            Connect your account in one click.
                        </Link>
                    </p>
                </div>

                <Button
                    color="primary"
                    type="submit"
                    isDisabled={isLoading}
                    onClick={this._onSubmit}
                    className={classnames({
                        'btn-loading': isLoading,
                    })}
                >
                    Verify email forwarding
                </Button>
            </div>
        )
    }

    render() {
        const {integration} = this.props

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
                                <Link to="/app/settings/integrations/email">
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

                <Container fluid className={settingsCss.pageContainer}>
                    <h1>Let's setup email forwarding</h1>

                    {this._renderInstructions()}
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        forwardingEmailAddress: getForwardingEmailAddress(state),
    }),
    {
        sendVerificationEmail,
        notify,
    }
)

export default connector(EmailIntegrationCreateForwarding)
