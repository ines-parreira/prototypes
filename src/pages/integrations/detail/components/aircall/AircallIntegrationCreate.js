import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Link} from 'react-router-dom'
import {connect} from 'react-redux'
import {
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Input,
    InputGroup,
    InputGroupAddon,
    Container,
    Row,
    Col,
    FormGroup,
} from 'reactstrap'
import Clipboard from 'clipboard'

import * as integrationsSelectors from '../../../../../state/integrations/selectors.ts'
import PageHeader from '../../../../common/components/PageHeader.tsx'

@connect((state) => {
    const aircallAuthData = integrationsSelectors.getAuthData('aircall')(state)

    return {
        webhookUrl: aircallAuthData.get('webhook_url'),
        webhookUrlNew: aircallAuthData.get('webhook_url_new'),
        showOldUrl: aircallAuthData.get('show_old_url'),
    }
})
export default class AircallIntegrationCreate extends Component {
    static propTypes = {
        webhookUrl: PropTypes.string.isRequired,
        webhookUrlNew: PropTypes.string.isRequired,
        showOldUrl: PropTypes.bool.isRequired,
    }

    state = {
        isCopied: false,
        isCopiedNew: false,
    }

    componentDidMount() {
        const clipboard = new Clipboard('#copyWebhookUrl')

        clipboard.on('success', () => {
            this.setState({isCopied: true})
            setTimeout(() => {
                this.setState({isCopied: false})
            }, 1500)
        })

        const clipboardNew = new Clipboard('#copyWebhookUrlNew')

        clipboardNew.on('success', () => {
            this.setState({isCopiedNew: true})
            setTimeout(() => {
                this.setState({isCopiedNew: false})
            }, 1500)
        })
    }

    render() {
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
                                <Link to="/app/settings/integrations/aircall">
                                    Aircall
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                Connect Aircall
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <Container fluid className="page-container">
                    <Row>
                        <Col md="8">
                            <h3>Setup Instructions</h3>
                            <div className="mb-4">
                                <p>
                                    Follow these instructions to connect
                                    Aircall:
                                    <ul>
                                        <li>1. Copy the webhook url below</li>
                                        <li>
                                            2. Add a Webhook integration in your
                                            Aircall account, under{' '}
                                            <a
                                                href="https://dashboard-v2.aircall.io/integrations"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                integrations
                                            </a>
                                        </li>
                                        <li>
                                            3. Paste the webhook url in the url
                                            field, and save
                                        </li>
                                    </ul>
                                </p>
                                <p>
                                    Gorgias will automatically create an Aircall
                                    integration for each of your Aircall numbers
                                    when you will receive or make a call.
                                </p>
                                {this.props.showOldUrl && (
                                    <FormGroup>
                                        <label htmlFor="webhookUrl">
                                            Webhook url
                                            <span
                                                className="alert alert-warning ml-4"
                                                style={{
                                                    padding: '4px 8px 4px 4px',
                                                    fontSize: '12px',
                                                }}
                                            >
                                                <span
                                                    role="img"
                                                    aria-label="warning"
                                                >
                                                    ⚠️ Deprecated
                                                </span>
                                            </span>
                                        </label>
                                        <InputGroup>
                                            <Input
                                                id="webhookUrl"
                                                type="text"
                                                value={this.props.webhookUrl}
                                                readOnly
                                            />
                                            <InputGroupAddon addonType="append">
                                                <Button
                                                    id="copyWebhookUrl"
                                                    color="primary"
                                                    data-clipboard-target="#webhookUrl"
                                                >
                                                    <i className="material-icons mr-2">
                                                        file_copy
                                                    </i>
                                                    {this.state.isCopied
                                                        ? 'Copied!'
                                                        : 'Copy'}
                                                </Button>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </FormGroup>
                                )}
                                <FormGroup>
                                    <label htmlFor="webhookUrlNew">
                                        Webhook URL
                                        {this.props.showOldUrl && (
                                            <span
                                                className="alert alert-success ml-3"
                                                style={{
                                                    padding: '4px 8px 4px 4px',
                                                    fontSize: '12px',
                                                }}
                                            >
                                                Updated
                                            </span>
                                        )}
                                    </label>
                                    <InputGroup>
                                        <Input
                                            id="webhookUrlNew"
                                            type="text"
                                            value={this.props.webhookUrlNew}
                                            readOnly
                                        />
                                        <InputGroupAddon addonType="append">
                                            <Button
                                                id="copyWebhookUrlNew"
                                                color="primary"
                                                data-clipboard-target="#webhookUrlNew"
                                            >
                                                <i className="material-icons mr-2">
                                                    file_copy
                                                </i>
                                                {this.state.isCopiedNew
                                                    ? 'Copied!'
                                                    : 'Copy'}
                                            </Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </FormGroup>
                            </div>
                            <Button
                                color="success"
                                tag={Link}
                                to="/app/settings/integrations/aircall"
                            >
                                I did it
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}
