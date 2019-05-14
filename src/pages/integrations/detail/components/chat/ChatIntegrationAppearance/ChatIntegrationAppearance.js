// @flow
import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {fromJS, type Map, type List} from 'immutable'
import _pick from 'lodash/pick'
import _merge from 'lodash/merge'
import _defaults from 'lodash/defaults'

import {
    Button,
    ButtonGroup,
    Breadcrumb,
    BreadcrumbItem,
    Col,
    Container,
    Form,
    Row,
} from 'reactstrap'

import {
    SMOOCH_INSIDE_WIDGET_TEXTS,
    SMOOCH_INSIDE_WIDGET_TEXTS_DEFAULTS,
    SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
    SMOOCH_INSIDE_WIDGET_LANGUAGE_OPTIONS,
    SMOOCH_INSIDE_DEFAULT_COLOR
} from '../../../../../../config/integrations/chat'
import {SHOPIFY_INTEGRATION_TYPE, SMOOCH_INSIDE_INTEGRATION_TYPE} from '../../../../../../constants/integration'
import Loader from '../../../../../common/components/Loader'
import ChatIntegrationNavigation from '../ChatIntegrationNavigation'
import ChatIntegrationPreview from '../ChatIntegrationPreview/ChatIntegrationPreview'
import ConfirmButton from '../../../../../common/components/ConfirmButton'

import InputField from '../../../../../common/forms/InputField'
import ColorField from '../../../../../common/forms/ColorField'

import PageHeader from '../../../../../common/components/PageHeader'

import css from './ChatIntegrationAppearance.less'
import * as integrationSelectors from './../../../../../../state/integrations/selectors'


export const defaultContent = {
    type: SMOOCH_INSIDE_INTEGRATION_TYPE,
    name: '',
    introductionText: SMOOCH_INSIDE_WIDGET_TEXTS_DEFAULTS.introductionText,
    offlineIntroductionText: SMOOCH_INSIDE_WIDGET_TEXTS_DEFAULTS.offlineIntroductionText,
    mainColor: SMOOCH_INSIDE_DEFAULT_COLOR,
    conversationColor: SMOOCH_INSIDE_DEFAULT_COLOR,
    isOnline: true,
    language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT
}

type Props = {
    integration: Map<*,*>,
    isUpdate: boolean,
    actions: Object,
    loading: Map<*,*>,
    currentUser: Map<*,*>,
    shopifyIntegrations: List<Map<*,*>>
}

type State = {
    type: string,
    name: string,
    introductionText: string,
    offlineIntroductionText: string,
    mainColor: string,
    conversationColor: string,
    isOnline: boolean,
    language: string,

    isCopied: boolean,
    isShopifyInstructions: boolean
}

class ChatIntegrationAppearance extends React.Component<Props, State> {
    isInitialized: boolean = false

    constructor(props) {
        super(props)

        // used to know if form has been asynchronously initialized when updating
        this.isInitialized = !props.isUpdate
    }

    state = _merge({
        isCopied: false,
        isShopifyInstructions: true,
    }, defaultContent)

    componentDidMount() {
        if (!this.state.integration && !this.props.integration.isEmpty()) {
            this.setState(this._getIntegration(this.props.integration))
        }
    }

    componentWillUpdate(nextProps: Props) {
        const {integration, isUpdate, loading} = nextProps

        // populating the form when updating an integration
        if (!this.isInitialized && isUpdate && !loading.get('integration')) {
            this.setState(this._getIntegration(integration))
            this.isInitialized = true
        }
    }

    _getIntegration = (integration: Map<*,*>) => {
        return _defaults({
            name: integration.get('name'),
            introductionText: integration.getIn(['decoration', 'introduction_text']),
            offlineIntroductionText: integration.getIn(['decoration', 'offline_introduction_text']),
            mainColor: integration.getIn(['decoration', 'main_color']),
            conversationColor: integration.getIn(['decoration', 'conversation_color']),
            language: integration.getIn(['meta', 'language'])
        }, defaultContent)
    }

    _isSubmitting = () => {
        const {loading, integration} = this.props
        return loading.get('updateIntegration') === integration.get('id', true)
    }

    _handleSubmit = (event: SyntheticEvent<*>) => {
        event.preventDefault()
        const form = _pick(this.state, ['name', 'type'])
        form.decoration = {
            conversation_color: this.state.conversationColor,
            main_color: this.state.mainColor,
            introduction_text: this.state.introductionText,
            offline_introduction_text: this.state.offlineIntroductionText,
        }

        form.meta = {
            language: this.state.language
        }

        if (this.props.isUpdate) {
            form.id = this.props.integration.get('id')
            form.meta = {
                ...this.props.integration.get('meta').toJS(),
                ...form.meta
            }
        }

        return this.props.actions.updateOrCreateIntegration(fromJS(form))
            .then(({error} = {}) => {
                if (error) {
                    return
                }

                // reload the integration
                this.isInitialized = false
            })
    }

    // $FlowFixMe
    _setLanguage = (language: string) => {
        let newState = {language}

        const textFieldsToUpdate = ['introductionText', 'offlineIntroductionText']
        textFieldsToUpdate.forEach((textName) => {
            if (this.state[textName] === SMOOCH_INSIDE_WIDGET_TEXTS[this.state.language][textName]) {
                // $FlowFixMe
                newState[textName] = SMOOCH_INSIDE_WIDGET_TEXTS[language][textName]
            }
        })

        this.setState(newState)
    }

    render() {
        const {actions, integration, isUpdate, loading, currentUser} = this.props
        const isSubmitting = this._isSubmitting()

        if (loading.get('integration')) {
            return <Loader/>
        }

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/smooch_inside">Chat</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {isUpdate ? integration.get('name') : 'New chat integration'}
                        </BreadcrumbItem>
                        {
                            isUpdate && (
                                <BreadcrumbItem active>
                                    Appearance
                                </BreadcrumbItem>
                            )
                        }
                    </Breadcrumb>
                )}/>

                {isUpdate && (
                    <ChatIntegrationNavigation integration={integration}/>
                )}

                <Container
                    fluid
                    className="page-container"
                >
                    <Row>
                        <Col>
                            <Form
                                onSubmit={this._handleSubmit}
                            >
                                <div className={css.form}>
                                    <div className={css.fieldset}>
                                        <InputField
                                            type="text"
                                            label="Chat title"
                                            value={this.state.name}
                                            onChange={(value) => this.setState({name: value})}
                                            placeholder="Ex: Company Support"
                                            required
                                        />

                                        <InputField
                                            type="text"
                                            value={this.state.introductionText}
                                            onFocus={() => this.setState({isOnline: true})}
                                            onChange={(value) => this.setState({introductionText: value})}
                                            label="Introduction text during business hours"
                                        />

                                        <InputField
                                            type="text"
                                            value={this.state.offlineIntroductionText}
                                            onFocus={() => {
                                                this.setState({isOnline: false})
                                            }}
                                            onChange={(value) => {
                                                this.setState({offlineIntroductionText: value})
                                            }}
                                            label="Introduction text outside business hours"
                                        />

                                        <ColorField
                                            value={this.state.mainColor}
                                            onChange={(value) => this.setState({mainColor: value})}
                                            label="Main color"
                                        />

                                        <ColorField
                                            value={this.state.conversationColor}
                                            onChange={(value) => this.setState({conversationColor: value})}
                                            label="Conversation color"
                                        />

                                        <InputField
                                            type="select"
                                            value={this.state.language}
                                            options={SMOOCH_INSIDE_WIDGET_LANGUAGE_OPTIONS.toJS()}
                                            onChange={this._setLanguage}
                                            label="Language"
                                        >
                                            {
                                                SMOOCH_INSIDE_WIDGET_LANGUAGE_OPTIONS.map((option) => (
                                                    <option
                                                        key={option.get('value')}
                                                        value={option.get('value')}
                                                    >
                                                        {option.get('label')}
                                                    </option>
                                                ))
                                            }
                                        </InputField>

                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    color="success"
                                    className={classnames({
                                        'btn-loading': isSubmitting,
                                    })}
                                    disabled={isSubmitting}
                                >
                                    {isUpdate ? 'Save changes' : 'Add new chat'}
                                </Button>

                                {
                                    isUpdate && (
                                        <ConfirmButton
                                            className="float-right"
                                            color="secondary"
                                            confirm={() => actions.deleteIntegration(integration)}
                                            content="Are you sure you want to delete this integration?"
                                        >
                                            <i className="material-icons mr-1 text-danger">
                                                delete
                                            </i>
                                            Delete chat
                                        </ConfirmButton>
                                    )
                                }
                            </Form>
                        </Col>
                        <Col className="p-0">
                            <div
                                className="d-flex justify-content-center align-items-center"
                                style={{width: '30em'}}  // same width as the preview
                            >
                                <ButtonGroup className="mb-3">
                                    <Button
                                        type="button"
                                        color={this.state.isOnline ? 'info' : 'secondary'}
                                        onClick={() => this.setState({isOnline: true})}
                                    >
                                        During business hours
                                    </Button>
                                    <Button
                                        type="button"
                                        color={!this.state.isOnline ? 'info' : 'secondary'}
                                        onClick={() => this.setState({isOnline: false})}
                                    >
                                        Outside business hours
                                    </Button>
                                </ButtonGroup>
                            </div>
                            <ChatIntegrationPreview
                                currentUser={currentUser}
                                name={this.state.name}
                                introductionText={this.state.introductionText}
                                offlineIntroductionText={this.state.offlineIntroductionText}
                                mainColor={this.state.mainColor}
                                conversationColor={this.state.conversationColor}
                                isOnline={this.state.isOnline}
                                translatedTexts={SMOOCH_INSIDE_WIDGET_TEXTS[this.state.language || SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT]}
                            />
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        shopifyIntegrations: integrationSelectors.getIntegrationsByTypes(SHOPIFY_INTEGRATION_TYPE)(state)
    }
}

export default connect(mapStateToProps)(ChatIntegrationAppearance)
