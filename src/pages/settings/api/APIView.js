import React from 'react'
import {connect} from 'react-redux'
import Clipboard from 'clipboard'
import {FormGroup, Container, Label, InputGroup, Button, Input, InputGroupAddon} from 'reactstrap'

import * as currentUserSelectors from '../../../state/currentUser/selectors'
import * as authsSelectors from '../../../state/auths/selectors'
import * as currentAccountSelectors from '../../../state/currentAccount/selectors'
import {fetchCurrentAuths, resetApiKey} from '../../../state/auths/actions'
import {notify} from '../../../state/notifications/actions'
import PageHeader from '../../common/components/PageHeader'
import * as segmentTracker from '../../../store/middlewares/segmentTracker'


type Props = {
    apiKey: string,
    domain: string,
    email: string,
    fetchCurrentAuths: typeof fetchCurrentAuths,
    notify: typeof notify,
    resetApiKey: typeof resetApiKey,
}

type State = {
    isCopiedapiKey: boolean,
    isCopiedemail: boolean,
    isCopiedurl: boolean,
}

@connect((state) => {
    return {
        apiKey: authsSelectors.getApiKey(state),
        email: currentUserSelectors.getCurrentUser(state).get('email'),
        domain: currentAccountSelectors.getCurrentAccountState(state).get('domain'),
    }
}, {fetchCurrentAuths, notify, resetApiKey})
export default class APIView extends React.Component<Props, State> {
    state = {
        isCopiedapiKey: false,
        isCopiedemail: false,
        isCopiedurl: false,
    }

    componentWillMount() {
        // Load postman js
        (function (p, o, s, t, m, a, n) {
            !p[s] && (p[s] = function () {
                (p[t] || (p[t] = [])).push(arguments)
            })
            !o.getElementById(s + t) && o.getElementsByTagName('head')[0].appendChild((
                (n = o.createElement('script')),
                (n.id = s + t), (n.async = 1), (n.src = m), n
            ))
        }(window, document, '_pm', 'PostmanRunObject', 'https://run.pstmn.io/button.js'))
    }

    componentDidMount() {
        this.props.fetchCurrentAuths()

        const clipboard = new Clipboard('.copyBtn')

        clipboard.on('success', (e) => {
            const targetId = e.trigger.dataset.clipboardTarget
            const target = `isCopied${targetId.replace('#', '')}`
            const newState = {}
            newState[target] = true

            this.setState(newState)
            setTimeout(() => {
                newState[target] = false
                this.setState(newState)
            }, 1500)
        })
    }

    _subscribeToDeveloperNewsletter = () => {
        const {notify} = this.props

        segmentTracker.logEvent(segmentTracker.EVENTS.SUBSCRIBED_TO_DEV_NEWSLETTER)
        notify({
            status: 'success',
            message: 'Thank you! You have been subscribed to our developer newsletter.'
        })
    }

    _resetApiKey = () => {
        const confirm = window.confirm('You are about to reset your API key. Are you sure?')

        if (confirm) {
            this.props.resetApiKey()
        }
    }

    render() {
        const {domain, apiKey, email} = this.props
        const postmanVars = [
            {
                'enabled': true,
                'key': 'domain',
                'value': domain,
                'type': 'text'
            },
            {
                'enabled': true,
                'key': 'email',
                'value': email,
                'type': 'text'
            },
            {
                'enabled': true,
                'key': 'api_key',
                'value': apiKey,
                'type': 'text'
            }
        ]
        const postmanParams = encodeURI(`env[Gorgias Helpdesk]=${btoa(JSON.stringify(postmanVars))}`)

        return (
            <div className="full-width">
                <PageHeader title="REST API"/>

                <Container
                    fluid
                    className="page-container"
                >
                    <p>
                        Gorgias prides itself on being a developer-friendly helpdesk.
                        We expose a <a
                            href="https://stackoverflow.com/questions/671118/what-exactly-is-restful-programming"
                            target="_blank"
                            rel="noopener noreferrer"
                        >RESTful API</a> to make it easy for you to
                        get, create, update and delete many objects including customers, tickets,
                        messages and events. To find out more about our API, please consult our docs here:
                        <a
                            href="http://api.gorgias.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                        > http://api.gorgias.io/</a>.
                    </p>
                    <p>
                        Below are the parameters you will need to access our API. We're
                        using <a
                            href="https://en.wikipedia.org/wiki/Basic_access_authentication"
                            rel="noopener noreferrer"
                        >HTTP basic authentication</a> to authenticate API requests.</p>
                    <h4>API Access &amp; Credentials</h4>
                    <FormGroup>
                        <Label for="URL">Base API URL</Label>
                        <InputGroup>
                            <Input
                                id="url"
                                type="text"
                                value={`https://${domain}.gorgias.io/api/`}
                                readOnly
                            />
                            <InputGroupAddon addonType="append">
                                <Button
                                    className="copyBtn"
                                    color="primary"
                                    data-clipboard-target="#url"
                                >
                                    <i className="material-icons mr-2">
                                        file_copy
                                    </i>
                                    {this.state.isCopiedurl ? 'Copied!' : 'Copy'}
                                </Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                    <FormGroup>
                        <Label for="email">Username (your email address)</Label>
                        <InputGroup>
                            <Input
                                id="email"
                                type="text"
                                value={email}
                                readOnly
                            />
                            <InputGroupAddon addonType="append">
                                <Button
                                    className="copyBtn"
                                    color="primary"
                                    data-clipboard-target="#email"
                                >
                                    <i className="material-icons mr-2">
                                        file_copy
                                    </i>
                                    {this.state.isCopiedemail ? 'Copied!' : 'Copy'}
                                </Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                    <FormGroup>
                        <Label for="apiKey">Password (API Key)</Label>
                        <InputGroup>
                            <Input
                                id="apiKey"
                                type="text"
                                value={apiKey}
                                readOnly
                            />
                            <InputGroupAddon addonType="append">
                                <Button
                                    className="resetBtn"
                                    color="danger"
                                    onClick={this._resetApiKey}
                                >
                                    <i className="material-icons mr-2">
                                        refresh
                                    </i>
                                    Reset
                                </Button>
                                <Button
                                    className="copyBtn"
                                    color="primary"
                                    data-clipboard-target="#apiKey"
                                >
                                    <i className="material-icons mr-2">
                                        file_copy
                                    </i>
                                    {this.state.isCopiedapiKey ? 'Copied!' : 'Copy'}
                                </Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                    <br/>

                    <h4>Postman collection</h4>
                    <p>
                        You can also import our{' '}
                        <a
                            href="https://www.getpostman.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Postman
                        </a>
                        {' '}collection below to quickly connect and use our REST API.
                    </p>
                    <div
                        className="postman-run-button"
                        data-postman-action="collection/import"
                        data-postman-var-1="9cd4c1e0f841a18f3510"
                        data-postman-param={postmanParams}
                    />
                    <br/><br/>

                    <h4>Developer newsletter</h4>
                    <p>
                        If you're using our API, we highly encourage you to subscribe to our developer newsletter.{' '}
                        It contains updates about <b>upcoming changes and breaking changes to the API</b>, new{' '}
                        features and integrations.
                    </p>
                    <Button
                        color="info"
                        onClick={this._subscribeToDeveloperNewsletter}
                    >
                        Subscribe
                    </Button>
                </Container>
            </div>
        )
    }
}
