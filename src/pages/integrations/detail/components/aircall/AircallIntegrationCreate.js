import React, {PropTypes, Component} from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import {
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Input,
    InputGroup,
    InputGroupButton
} from 'reactstrap'
import Clipboard from 'clipboard'
import * as integrationsSelectors from '../../../../../state/integrations/selectors'

@connect((state) => {
    return {
        webhookUrl: integrationsSelectors.getIntegrationExtra('aircall')(state).get('webhook_url')
    }
})
export default class AircallIntegrationCreate extends Component {
    static propTypes = {
        webhookUrl: PropTypes.string.isRequired,
    }

    state = {
        isCopied: false,
    }

    componentDidMount() {
        const clipboard = new Clipboard('#copyWebhookUrl')

        clipboard.on('success', () => {
            this.setState({isCopied: true})
            setTimeout(() => {
                this.setState({isCopied: false})
            }, 1500)
        })
    }

    render() {
        return (
            <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/integrations">Integrations</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to="/app/integrations/aircall">Aircall</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        Connect Aircall
                    </BreadcrumbItem>
                </Breadcrumb>

                <h3>Setup Instructions</h3>
                <div className="mb-4">
                    <p>
                        Follow these instructions to connect Aircall:
                        <ul>

                            <li>1. Copy the webhook url below</li>
                            <li>2. Add a Gorgias integration in your Aircall account, under <a
                                href="https://dashboard-v2.aircall.io/integrations" target="_blank">
                                integrations</a>
                            </li>
                            <li>3. Paste the webhook url in the url field, and save</li>
                        </ul>
                    </p>
                    <p>
                        Gorgias will automatically create an Aircall integration for each of our Aircall
                        numbers when you will receive or make a call.
                    </p>
                    <label>Webhook url</label>
                    <InputGroup>
                        <Input
                            id="webhookUrl"
                            type="text"
                            value={this.props.webhookUrl}
                            readOnly
                        />
                        <InputGroupButton>
                            <Button
                                id="copyWebhookUrl"
                                color="info"
                                data-clipboard-target="#webhookUrl"
                            >
                                <i className="fa fa-fw fa-files-o mr-2" />
                                {this.state.isCopied ? 'Copied!' : 'Copy'}
                            </Button>
                        </InputGroupButton>
                    </InputGroup>
                </div>
                <Button
                    color="primary"
                    tag={Link}
                    to="/app/integrations/aircall"
                >
                    I did it
                </Button>
            </div>
        )
    }
}
