import React, {PropTypes} from 'react'
import {Link, withRouter} from 'react-router'
import Clipboard from 'clipboard'
import {connect} from 'react-redux'
import {
    Button,
    Breadcrumb,
    BreadcrumbItem,
    InputGroup,
    InputGroupButton,
    Input,
} from 'reactstrap'

import css from './EmailIntegrationCreateForwarding.less'

import outlook from './../../../../../../../img/integrations/outlook.svg'
import office from './../../../../../../../img/integrations/office.svg'
import zoho from './../../../../../../../img/integrations/zoho.svg'
import exchange from './../../../../../../../img/integrations/exchange.svg'
import groups from './../../../../../../../img/integrations/google-groups.svg'

import * as notificationActions from '../../../../../../state/notifications/actions'
import * as integrationActions from '../../../../../../state/integrations/actions'

const servicesWithTutorials = [
    {
        img: groups,
        title: 'Google Groups',
        link: 'http://docs.gorgias.io/general/how-to-set-up-email-forwarding#G_Suite_Groups'
    },
    {
        img: outlook,
        title: 'Outlook',
        link: 'http://docs.gorgias.io/general/how-to-set-up-email-forwarding#Outlook.com'
    },
    {
        img: office,
        title: 'Office 365',
        link: 'http://docs.gorgias.io/general/how-to-set-up-email-forwarding#Office_365'
    },
    {
        img: exchange,
        title: 'Microsoft Exchange',
        link: 'http://docs.gorgias.io/general/how-to-set-up-email-forwarding#Microsoft_Exchange'
    },
    {
        img: zoho,
        title: 'Zoho Mail',
        link: 'http://docs.gorgias.io/general/how-to-set-up-email-forwarding#Zoho_Mail'
    }
]

class EmailIntegrationCreateForwarding extends React.Component {
    state = {
        isCopied: false,
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

    _renderInstructions = () => {
        const {domain, integration} = this.props
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
                        <InputGroupButton>
                            <Button
                                id="copy-forwarding-email"
                                color="info"
                                data-clipboard-target="#forwarding-email"
                            >
                                <i className="fa fa-fw fa-files-o mr-2" />
                                {this.state.isCopied ? 'Copied!' : 'Copy'}
                            </Button>
                        </InputGroupButton>
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
                        <Link to="/app/integrations/email/new">Connect your account in one click.</Link>
                    </p>
                </div>

                <Button
                    color="primary"
                    tag={Link}
                    to={`/app/integrations/email/${integration.get('id')}`}
                >
                    I added email forwarding
                </Button>
            </div>
        )
    }

    render() {
        return (
            <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/integrations">Integrations</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to="/app/integrations/email">Email</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        Add
                    </BreadcrumbItem>
                </Breadcrumb>

                <h1>
                    Let's setup email forwarding
                </h1>

                {this._renderInstructions()}
            </div>
        )
    }
}

EmailIntegrationCreateForwarding.propTypes = {
    domain: PropTypes.string.isRequired,
    notify: PropTypes.func.isRequired,
    integration: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
}


const mapStateToProps = (state) => {
    return {
        domain: state.currentAccount.get('domain'),
    }
}

const mapDispatchToProps = {
    importEmails: integrationActions.importEmails,
    notify: notificationActions.notify,
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EmailIntegrationCreateForwarding))
