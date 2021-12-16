import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import Clipboard from 'clipboard'
import {
    FormGroup,
    Container,
    Label,
    InputGroup,
    Button,
    Input,
    InputGroupAddon,
} from 'reactstrap'
import classnames from 'classnames'

import {getCurrentUser} from '../../../state/currentUser/selectors'
import {getApiKey} from '../../../state/auths/selectors'
import {getCurrentAccountState} from '../../../state/currentAccount/selectors'
import {fetchCurrentAuths, resetApiKey} from '../../../state/auths/actions'
import {notify} from '../../../state/notifications/actions'
import PageHeader from '../../common/components/PageHeader'
import {logEvent, SegmentEvent} from '../../../store/middlewares/segmentTracker'
import {RootState} from '../../../state/types'
import {NotificationStatus} from '../../../state/notifications/types'
import css from '../settings.less'

type Props = ConnectedProps<typeof connector>

type State = {
    isCopiedAPIKey: boolean
    isCopiedEmail: boolean
    isCopiedUrl: boolean
}

export class APIViewContainer extends Component<Props, State> {
    state = {
        isCopiedAPIKey: false,
        isCopiedEmail: false,
        isCopiedUrl: false,
    }

    componentWillMount() {
        // Load postman js
        ;(function (
            p: Window & {_pm?: () => void; PostmanRunObject?: any[]},
            o: Document,
            s: '_pm',
            t: 'PostmanRunObject',
            m: string,
            a,
            n?: HTMLScriptElement
        ) {
            !p[s] &&
                (p[s] = function () {
                    // eslint-disable-next-line prefer-rest-params
                    ;(p[t] || (p[t] = [])).push(arguments)
                })
            !o.getElementById(s + t) &&
                o.getElementsByTagName('head')[0].appendChild(
                    // eslint-disable-next-line no-param-reassign
                    ((n = o.createElement('script')),
                    (n.id = s + t),
                    ((n as unknown as {async: number}).async = 1),
                    (n.src = m),
                    n)
                )
        })(
            window,
            document,
            '_pm',
            'PostmanRunObject',
            'https://run.pstmn.io/button.js'
        )
    }

    componentDidMount() {
        void this.props.fetchCurrentAuths()

        const clipboard = new Clipboard('.copyBtn')

        clipboard.on('success', (e) => {
            const targetId = (
                e.trigger as Element & {
                    dataset: {clipboardTarget: string}
                }
            ).dataset.clipboardTarget
            const target = `isCopied${targetId.replace('#', '')}` as keyof State
            const newState: Partial<State> = {}
            newState[target] = true

            this.setState(newState as State)
            setTimeout(() => {
                newState[target] = false
                this.setState(newState as State)
            }, 1500)
        })
    }

    _subscribeToDeveloperNewsletter = () => {
        const {notify} = this.props

        logEvent(SegmentEvent.SubscribedToDevNewsletter)
        void notify({
            status: NotificationStatus.Success,
            message:
                'Thank you! You have been subscribed to our developer newsletter.',
        })
    }

    _resetApiKey = () => {
        const confirm = window.confirm(
            'You are about to reset your API key. Are you sure?'
        )

        if (confirm) {
            void this.props.resetApiKey()
        }
    }

    _createApiKey = () => {
        void this.props.resetApiKey()
    }

    _renderCreateApiKeySection() {
        return (
            <div>
                <p className={classnames(css['body-regular'], css.mb24)}>
                    You can create an API Key using the button below.
                </p>
                <Button
                    className="resetBtn"
                    color="primary"
                    onClick={this._createApiKey}
                >
                    Create API Key
                </Button>
            </div>
        )
    }

    _renderApiKeySection(apiKey: string) {
        return (
            <InputGroup>
                <Input id="apiKey" type="text" value={apiKey} readOnly />
                <InputGroupAddon addonType="append">
                    <Button
                        className="resetBtn"
                        color="danger"
                        onClick={this._resetApiKey}
                    >
                        <i className="material-icons mr-2">refresh</i>
                        Reset
                    </Button>
                    <Button className="copyBtn" data-clipboard-target="#apiKey">
                        <i className="material-icons mr-2">file_copy</i>
                        {this.state.isCopiedAPIKey ? 'Copied!' : 'Copy'}
                    </Button>
                </InputGroupAddon>
            </InputGroup>
        )
    }

    render() {
        const {domain, apiKey, email} = this.props
        const postmanVars = [
            {
                enabled: true,
                key: 'domain',
                value: domain,
                type: 'text',
            },
            {
                enabled: true,
                key: 'email',
                value: email,
                type: 'text',
            },
            {
                enabled: true,
                key: 'api_key',
                value: apiKey,
                type: 'text',
            },
        ]
        const postmanParams = encodeURI(
            `env[Gorgias Helpdesk]=${btoa(JSON.stringify(postmanVars))}`
        )

        return (
            <div className="full-width">
                <PageHeader title="REST API" />
                <Container fluid className={css.pageContainer}>
                    <div className={css.contentWrapper}>
                        <div
                            className={classnames(
                                css['body-regular'],
                                css.mb32
                            )}
                        >
                            <p>
                                Gorgias prides itself on being a
                                developer-friendly helpdesk. We expose a{' '}
                                <a
                                    href="https://stackoverflow.com/questions/671118/what-exactly-is-restful-programming"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    RESTful API
                                </a>{' '}
                                to make it easy for you to get, create, update
                                and delete many objects including customers,
                                tickets, messages and events. To find out more
                                about our API, please consult our docs here:
                                <a
                                    href="https://developers.gorgias.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {' '}
                                    https://developers.gorgias.com/
                                </a>
                                .
                            </p>
                            <p>
                                Below are the parameters you will need to access
                                our API. We're using{' '}
                                <a
                                    href="https://en.wikipedia.org/wiki/Basic_access_authentication"
                                    rel="noopener noreferrer"
                                >
                                    HTTP basic authentication
                                </a>{' '}
                                to authenticate API requests.
                            </p>
                        </div>
                        <div
                            className={classnames(
                                css['heading-section-semibold'],
                                css.mb16
                            )}
                        >
                            API Access &amp; Credentials
                        </div>
                        <FormGroup className={css.inputField}>
                            <Label className="control-label" for="URL">
                                Base API URL
                            </Label>
                            <InputGroup>
                                <Input
                                    id="url"
                                    type="text"
                                    value={`https://${domain}.gorgias.com/api/`}
                                    readOnly
                                />
                                <InputGroupAddon addonType="append">
                                    <Button
                                        className="copyBtn"
                                        data-clipboard-target="#url"
                                    >
                                        <i className="material-icons mr-2">
                                            file_copy
                                        </i>
                                        {this.state.isCopiedUrl
                                            ? 'Copied!'
                                            : 'Copy'}
                                    </Button>
                                </InputGroupAddon>
                            </InputGroup>
                        </FormGroup>
                        <FormGroup className={css.inputField}>
                            <Label className="control-label" for="email">
                                Username (your email address)
                            </Label>
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
                                        data-clipboard-target="#email"
                                    >
                                        <i className="material-icons mr-2">
                                            file_copy
                                        </i>
                                        {this.state.isCopiedEmail
                                            ? 'Copied!'
                                            : 'Copy'}
                                    </Button>
                                </InputGroupAddon>
                            </InputGroup>
                        </FormGroup>
                        <FormGroup
                            className={classnames(css.inputField, css.mb32)}
                        >
                            <Label className="control-label" for="apiKey">
                                Password (API Key)
                            </Label>
                            {!!apiKey
                                ? this._renderApiKeySection(apiKey)
                                : this._renderCreateApiKeySection()}
                        </FormGroup>

                        <div
                            className={classnames(
                                css['heading-subsection-semibold'],
                                css.mb8
                            )}
                        >
                            Postman collection
                        </div>
                        <div
                            className={classnames(
                                css['body-regular'],
                                css.mb24
                            )}
                        >
                            <p>
                                You can also import our{' '}
                                <a
                                    href="https://www.getpostman.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Postman
                                </a>{' '}
                                collection below to quickly connect and use our
                                REST API.
                            </p>
                        </div>
                        <div
                            className={classnames(
                                'postman-run-button',
                                css.mb32
                            )}
                            data-postman-action="collection/import"
                            data-postman-var-1="15687974-2ca60778-1282-4a00-9d6a-8e90213b8248"
                            data-postman-collection-url="entityId=15687974-2ca60778-1282-4a00-9d6a-8e90213b8248&entityType=collection&workspaceId=b6894a63-39b4-496f-acdc-db697172e169"
                            data-postman-param={postmanParams}
                        />

                        <div
                            className={classnames(
                                css['heading-subsection-semibold'],
                                css.mb8
                            )}
                        >
                            Developer newsletter
                        </div>
                        <div
                            className={classnames(
                                css['body-regular'],
                                css.mb24
                            )}
                        >
                            <p>
                                If you're using our API, we highly encourage you
                                to subscribe to our developer newsletter. It
                                contains updates about{' '}
                                <b>
                                    upcoming changes and breaking changes to the
                                    API
                                </b>
                                , new features and integrations.
                            </p>
                        </div>

                        <Button
                            color="primary"
                            onClick={this._subscribeToDeveloperNewsletter}
                        >
                            Subscribe
                        </Button>
                    </div>
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        apiKey: getApiKey(state),
        email: getCurrentUser(state).get('email'),
        domain: getCurrentAccountState(state).get('domain') as string,
    }),
    {
        fetchCurrentAuths,
        notify,
        resetApiKey,
    }
)

export default connector(APIViewContainer)
