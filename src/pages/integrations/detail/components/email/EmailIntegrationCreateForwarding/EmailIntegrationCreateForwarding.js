import React, {PropTypes} from 'react'
import {Link, withRouter} from 'react-router'
import Clipboard from 'clipboard'
import {connect} from 'react-redux'
import {
    Button,
    Breadcrumb,
    BreadcrumbItem,
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
        link: 'https://gorgias.helpdocs.io/general/how-to-set-up-email-forwarding#G_Suite_Groups'
    },
    {
        img: outlook,
        title: 'Outlook',
        link: 'https://gorgias.helpdocs.io/general/how-to-set-up-email-forwarding#Outlook.com'
    },
    {
        img: office,
        title: 'Office 365',
        link: 'https://gorgias.helpdocs.io/general/how-to-set-up-email-forwarding#Office_365'
    },
    {
        img: exchange,
        title: 'Microsoft Exchange',
        link: 'https://gorgias.helpdocs.io/general/how-to-set-up-email-forwarding#Microsoft_Exchange'
    },
    {
        img: zoho,
        title: 'Zoho Mail',
        link: 'https://gorgias.helpdocs.io/general/how-to-set-up-email-forwarding#Zoho_Mail'
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
            <div className="ui form">
                <h3 className="mt-5">
                    Let's setup email forwarding
                </h3>
                <p>
                    Forward emails from <b>{address}</b> to the address below.
                </p>
                <div className={`field ${css.form}`}>
                    <div className="ui action input fluid">
                        <input
                            id="forwarding-email"
                            type="text"
                            value={`${address.split('@')[0]}@${domain}.gorgias.io`}
                            className={`${css['email-input']}`}
                            readOnly
                        />
                        <Button
                            id="copy-forwarding-email"
                            type="button"
                            color="info"
                            data-clipboard-target="#forwarding-email"
                        >
                            <i className="copy icon mr-2" />
                            {this.state.isCopied ? 'COPIED!' : 'COPY'}
                        </Button>
                    </div>
                </div>

                <p className="mt-5">
                   Below are some handful tutorial to setup email forwarding depending on your email provider:
                </p>

                <div className={css.cardContainer}>
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
                                <img src={config.img}/>
                                <div>{config.title}</div>
                            </Button>
                        ))
                    }
                </div>

                <p className="mt-3">
                    Using GMail or G Suite?{' '}
                    <Link to="/app/integrations/email/new">Connect your account in one click.</Link>
                </p>

                <Button
                    className="mt-4"
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
                    Add email address
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
