import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import Clipboard from 'clipboard'
import {FormGroup, Label, InputGroup, InputGroupButton, Button, Input} from 'reactstrap'

import * as currentUserSelectors from '../../../state/currentUser/selectors'
import * as currentAccountSelectors from '../../../state/currentAccount/selectors'

@connect((state) => {
    return {
        apiKey: currentUserSelectors.getApiKey(state),
        email: currentUserSelectors.getCurrentUser(state).get('email'),
        domain: currentAccountSelectors.getCurrentAccountState(state).get('domain'),
    }
})
export default class APIView extends React.Component {
    static propTypes = {
        domain: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        apiKey: PropTypes.string.isRequired
    }

    state = {
        isCopiedurl: false,
        isCopiedemail: false,
        isCopiedapiKey: false,
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
            <div>
                <h1>
                    <i className="fa fa-fw fa-code blue mr-2" />
                    REST API
                </h1>
                <p>
                    Gorgias prides itself on being a developer-friendly helpdesk.
                    We expose a <a href="https://stackoverflow.com/questions/671118/what-exactly-is-restful-programming"
                                   target="_blank">
                    RESTful API
                </a> to make it easy for you to get, create, update and delete many objects including users, tickets,
                    messages and events. To find out more our API please consult our docs here:
                    <a href="http://api.gorgias.io/" target="_blank"> http://api.gorgias.io/</a>.
                </p>
                <p>
                    Below are the parameters you will need to access our API. We're
                    using <a href="https://en.wikipedia.org/wiki/Basic_access_authentication">HTTP basic
                    authentication</a> to authenticate API requests.</p>
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
                        <InputGroupButton>
                            <Button
                                className="copyBtn"
                                color="info"
                                data-clipboard-target="#url"
                            >
                                <i className="fa fa-fw fa-files-o mr-2" />
                                {this.state.isCopiedurl ? 'Copied!' : 'Copy'}
                            </Button>
                        </InputGroupButton>
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
                        <InputGroupButton>
                            <Button
                                className="copyBtn"
                                color="info"
                                data-clipboard-target="#email"
                            >
                                <i className="fa fa-fw fa-files-o mr-2" />
                                {this.state.isCopiedemail ? 'Copied!' : 'Copy'}
                            </Button>
                        </InputGroupButton>
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
                        <InputGroupButton>
                            <Button
                                className="copyBtn"
                                color="info"
                                data-clipboard-target="#apiKey"
                            >
                                <i className="fa fa-fw fa-files-o mr-2" />
                                {this.state.isCopiedapiKey ? 'Copied!' : 'Copy'}
                            </Button>
                        </InputGroupButton>
                    </InputGroup>
                </FormGroup>
                <br />
                <h4>Postman collection</h4>
                <p>
                    You can also import our <a href="https://www.getpostman.com/" target="_blank">Postman </a>
                    collection below to quickly connect and use our REST API.
                </p>
                <div
                    className="postman-run-button"
                    data-postman-action="collection/import"
                    data-postman-var-1="9cd4c1e0f841a18f3510"
                    data-postman-param={postmanParams}
                />
            </div>
        )
    }
}
