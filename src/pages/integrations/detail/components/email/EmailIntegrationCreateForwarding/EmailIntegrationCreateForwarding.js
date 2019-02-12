// @flow
import React from 'react'
import {Link, withRouter, browserHistory} from 'react-router'
import Clipboard from 'clipboard'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Container,
    InputGroup,
    InputGroupAddon,
    Input,
} from 'reactstrap'

import * as notificationActions from '../../../../../../state/notifications/actions'
import * as integrationActions from '../../../../../../state/integrations/actions'
import PageHeader from '../../../../../common/components/PageHeader'
import type {dispatchType} from '../../../../../../state/types'

import css from './EmailIntegrationCreateForwarding.less'

import outlook from './../../../../../../../img/integrations/outlook.svg'
import office from './../../../../../../../img/integrations/office.svg'
import zoho from './../../../../../../../img/integrations/zoho.svg'
import exchange from './../../../../../../../img/integrations/exchange.svg'
import groups from './../../../../../../../img/integrations/google-groups.svg'


const servicesWithTutorials = [
    {
        img: groups,
        title: 'Google Groups',
        link: 'https://docs.gorgias.io/general/how-to-set-up-email-forwarding#g_suite_gmail'
    },
    {
        img: outlook,
        title: 'Outlook',
        link: 'https://docs.gorgias.io/general/how-to-set-up-email-forwarding#outlook_com'
    },
    {
        img: office,
        title: 'Office 365',
        link: 'https://docs.gorgias.io/general/how-to-set-up-email-forwarding#office_365'
    },
    {
        img: exchange,
        title: 'Microsoft Exchange',
        link: 'https://docs.gorgias.io/general/how-to-set-up-email-forwarding#microsoft_exchange'
    },
    {
        img: zoho,
        title: 'Zoho Mail',
        link: 'https://docs.gorgias.io/general/how-to-set-up-email-forwarding#zoho_mail'
    }
]

type Props = {
    domain: string,
    notify: (Object) => void,
    sendVerificationEmail: () => Promise<dispatchType>,
    integration: Object,
    actions: Object,
    location: Object,
}

type State = {
    isCopied: boolean,
    isLoading: boolean
}

export class EmailIntegrationCreateForwarding extends React.Component<Props, State> {
    state = {
        isCopied: false,
        isLoading: false,
    }

    componentDidUpdate() {
        // activate copy to clipboard button only for email integration
        if (this.props.integration.get('type') === 'email') {
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
        this.props.sendVerificationEmail().then(() => {
            this.setState({isLoading: false})
            browserHistory.push(`/app/settings/integrations/email/${integration.get('id')}/verification`)
        })
    }

    _renderInstructions = () => {
        const {domain, integration} = this.props
        const {isLoading} = this.state
        const address = integration.getIn(['meta', 'address'], '')

        return (
            <div>
                <div className="mb-4">
                    <p>
                        Forward emails from <b>{address}</b> to the address below.
                    </p>

                    <InputGroup>
                        <Input
                            id="forwarding-email"
                            type="text"
                            value={`${address.split('@')[0]}@${domain}.gorgias.io`}
                            readOnly
                        />
                        <InputGroupAddon addonType="append">
                            <Button
                                id="copy-forwarding-email"
                                color="primary"
                                data-clipboard-target="#forwarding-email"
                            >
                                <i className="material-icons mr-2">
                                    file_copy
                                </i>
                                {this.state.isCopied ? 'Copied!' : 'Copy'}
                            </Button>
                        </InputGroupAddon>
                    </InputGroup>
                </div>

                <div className="mb-4">
                    <p>Below are some handful tutorial to setup email forwarding depending on your email provider:</p>

                    <div className="d-flex flex-wrap">
                        {
                            servicesWithTutorials.map((config, idx) => (
                                <Button
                                    key={idx}
                                    color="secondary"
                                    size="lg"
                                    tag="a"
                                    href={config.link}
                                    target="_blank"
                                    className={css.forwardingCard}
                                >
                                    <img src={config.img} />
                                    <div>{config.title}</div>
                                </Button>
                            ))
                        }
                    </div>

                    <p>
                        Using GMail or G Suite?{' '}
                        <Link to="/app/settings/integrations/email/new">Connect your account in one click.</Link>
                    </p>
                </div>

                <Button
                    color="success"
                    disabled={isLoading}
                    tag={Link}
                    onClick={this._onSubmit}
                    className={classnames({
                        'btn-loading': isLoading
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
                        Let's setup email forwarding
                    </h1>

                    {this._renderInstructions()}
                </Container>
            </div>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        domain: state.currentAccount.get('domain'),
    }
}

const mapDispatchToProps = {
    sendVerificationEmail: integrationActions.sendVerificationEmail,
    notify: notificationActions.notify,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EmailIntegrationCreateForwarding))
