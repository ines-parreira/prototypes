import React, { Component } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classnames from 'classnames'
import copy from 'copy-to-clipboard'
import { fromJS } from 'immutable'
import _camelCase from 'lodash/camelCase'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { FormGroup, Label } from 'reactstrap'
import type { InputType } from 'reactstrap/es/Input'

import { LegacyButton as Button } from '@gorgias/axiom'

import IconButton from 'pages/common/components/button/IconButton'
import PageHeader from 'pages/common/components/PageHeader'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'
import { fetchCurrentAuths, resetApiKey } from 'state/auths/actions'
import { getApiKey } from 'state/auths/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { RootState } from 'state/types'

import css from '../settings.less'

type Props = ConnectedProps<typeof connector>

type State = {
    isCopiedApiKey: boolean
    isCopiedEmail: boolean
    isCopiedUrl: boolean
    apiKeyType: 'password' | 'text'
}

export class APIViewContainer extends Component<Props, State> {
    state: State = {
        isCopiedApiKey: false,
        isCopiedEmail: false,
        isCopiedUrl: false,
        apiKeyType: 'password',
    }
    private clipboardData: Record<string, string>

    constructor(props: Props) {
        super(props)
        this.clipboardData = fromJS({})
    }

    componentDidMount() {
        // Load postman js
        ;(function (
            p: Window & { _pm?: () => void; PostmanRunObject?: any[] },
            o: Document,
            s: '_pm',
            t: 'PostmanRunObject',
            m: string,
            a,
            n?: HTMLScriptElement,
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
                    ((n as unknown as { async: number }).async = 1),
                    (n.src = m),
                    n),
                )
        })(
            window,
            document,
            '_pm',
            'PostmanRunObject',
            'https://run.pstmn.io/button.js',
        )
        void this.props.fetchCurrentAuths()
    }

    _copyToClipboard = () => {
        if (this.clipboardData) {
            const data = this.clipboardData.data
            const clipboardTarget = this.clipboardData.targetPart

            copy(data)

            const targetPart = _camelCase(clipboardTarget)
            const stateProp = `isCopied${targetPart
                .charAt(0)
                .toUpperCase()}${targetPart.slice(1)}` as keyof Omit<
                State,
                'apiKeyType'
            >
            this.setState({
                ...this.state,
                [stateProp]: true,
            })

            setTimeout(() => {
                this.setState({
                    ...this.state,
                    [stateProp]: false,
                })
            }, 1500)
        }
    }

    _subscribeToDeveloperNewsletter = () => {
        const { notify } = this.props

        logEvent(SegmentEvent.SubscribedToDevNewsletter)
        void notify({
            status: NotificationStatus.Success,
            message:
                'Thank you! You have been subscribed to our developer newsletter.',
        })
    }

    _resetApiKey = () => {
        const confirm = window.confirm(
            'You are about to reset your API key. Are you sure?',
        )

        if (confirm) {
            void this.props.resetApiKey()
            this.setState({
                ...this.state,
                apiKeyType: 'password',
            })
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
                <Button onClick={this._createApiKey}>Create API key</Button>
            </div>
        )
    }

    _changeSecretVisibility = () => {
        let newApiKeyType: InputType = 'password'
        if (this.state.apiKeyType === 'password') {
            newApiKeyType = 'text'
        }
        this.setState({
            ...this.state,
            apiKeyType: newApiKeyType,
        })
    }

    _renderApiKeySection(apiKey: string) {
        return (
            <InputGroup>
                <TextInput
                    id="apiKey"
                    value={apiKey}
                    type={this.state.apiKeyType}
                    readOnly
                />
                <IconButton
                    intent="secondary"
                    onClick={this._changeSecretVisibility}
                >
                    {this.state.apiKeyType === 'password'
                        ? 'visibility'
                        : 'visibility_off'}
                </IconButton>
                <Button
                    intent="destructive"
                    onClick={this._resetApiKey}
                    leadingIcon="refresh"
                >
                    Reset
                </Button>
                <Button
                    intent="secondary"
                    className="copyBtn"
                    onClick={() => {
                        this.clipboardData = {
                            data: apiKey,
                            targetPart: 'apiKey',
                        }
                        this._copyToClipboard()
                    }}
                    leadingIcon="file_copy"
                >
                    {this.state.isCopiedApiKey ? 'Copied!' : 'Copy'}
                </Button>
            </InputGroup>
        )
    }

    render() {
        const { domain, apiKey, email } = this.props
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
            `env[Gorgias Helpdesk]=${btoa(JSON.stringify(postmanVars))}`,
        )
        const url = `https://${domain}.gorgias.com/api/`

        return (
            <div className="full-width">
                <PageHeader title="REST API" />
                <div className={css.pageContainer}>
                    <div className={css.contentWrapper}>
                        <div className={classnames('body-regular', css.mb32)}>
                            <p>
                                We use HTTP basic authentication to authenticate
                                API requests. Below are the parameters you will
                                need to access our API. For more details, please
                                consult our{' '}
                                <a
                                    href="https://developers.gorgias.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Developer Documentation
                                </a>
                                .
                            </p>
                        </div>
                        <div
                            className={classnames(
                                'heading-section-semibold',
                                css.mb16,
                            )}
                        >
                            API Access &amp; Credentials
                        </div>
                        <FormGroup className={css.inputField}>
                            <Label className="control-label" for="URL">
                                Base API URL
                            </Label>
                            <InputGroup>
                                <TextInput id="url" value={url} readOnly />
                                <Button
                                    intent="secondary"
                                    className="copyBtn"
                                    onClick={() => {
                                        this.clipboardData = {
                                            data: url,
                                            targetPart: 'url',
                                        }
                                        this._copyToClipboard()
                                    }}
                                    leadingIcon="file_copy"
                                >
                                    {this.state.isCopiedUrl
                                        ? 'Copied!'
                                        : 'Copy'}
                                </Button>
                            </InputGroup>
                        </FormGroup>
                        <FormGroup className={css.inputField}>
                            <Label className="control-label" for="email">
                                Username (your email address)
                            </Label>
                            <InputGroup>
                                <TextInput id="email" value={email} readOnly />
                                <Button
                                    intent="secondary"
                                    className="copyBtn"
                                    onClick={() => {
                                        this.clipboardData = {
                                            data: email,
                                            targetPart: 'email',
                                        }
                                        this._copyToClipboard()
                                    }}
                                    leadingIcon="file_copy"
                                >
                                    {this.state.isCopiedEmail
                                        ? 'Copied!'
                                        : 'Copy'}
                                </Button>
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
                                'heading-subsection-semibold',
                                css.mb8,
                            )}
                        >
                            Postman collection
                        </div>
                        <div className={classnames('body-regular', css.mb24)}>
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
                                css.mb32,
                            )}
                            data-postman-action="collection/import"
                            data-postman-var-1="15687974-2ca60778-1282-4a00-9d6a-8e90213b8248"
                            data-postman-collection-url="entityId=15687974-2ca60778-1282-4a00-9d6a-8e90213b8248&entityType=collection&workspaceId=b6894a63-39b4-496f-acdc-db697172e169"
                            data-postman-param={postmanParams}
                        />

                        <div
                            className={classnames(
                                'heading-section-semibold',
                                css.mb8,
                            )}
                        >
                            Developer newsletter
                        </div>
                        <div className={classnames('body-regular', css.mb24)}>
                            <p>
                                {`If you're using our API, we highly encourage you to subscribe to our developer newsletter. It contains updates about`}{' '}
                                <b>
                                    upcoming changes and breaking changes to the
                                    API
                                </b>
                                , new features and integrations.
                            </p>
                        </div>

                        <Button onClick={this._subscribeToDeveloperNewsletter}>
                            Subscribe
                        </Button>
                    </div>
                </div>
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
    },
)

export default connector(APIViewContainer)
