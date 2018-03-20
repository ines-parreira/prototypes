import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import _pick from 'lodash/pick'
import _merge from 'lodash/merge'
import _defaults from 'lodash/defaults'

import {
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Form,
    Row,
    Col
} from 'reactstrap'

import * as integrationSelectors from './../../../../../../state/integrations/selectors'

import Loader from '../../../../../common/components/Loader'
import ChatIntegrationPreview from '../ChatIntegrationPreview/ChatIntegrationPreview'
import ConfirmButton from '../../../../../common/components/ConfirmButton'

import InputField from '../../../../../common/forms/InputField'
import ColorField from '../../../../../common/forms/ColorField'

import css from './ChatIntegrationAppearance.less'
import PageHeader from '../../../../../common/components/PageHeader'
import RealtimeMessagingIntegrationNavigation from '../../../../common/RealtimeMessagingIntegrationNavigation'

export const defaultContent = {
    type: 'smooch_inside',
    name: '',
    introductionText: 'What can we do for you?',
    offlineIntroductionText: 'We\'re away!',
    inputPlaceholder: 'Type a message...',
    mainColor: '#0d87dd',
    conversationColor: '#0d87dd',
    isOnline: true
}

class ChatIntegrationAppearance extends React.Component {
    static propTypes = {
        integration: PropTypes.object.isRequired,
        isUpdate: PropTypes.bool.isRequired,
        actions: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
        currentUser: PropTypes.object.isRequired,

        shopifyIntegrations: PropTypes.object.isRequired
    }

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

    componentWillUpdate(nextProps) {
        const {integration, isUpdate, loading} = nextProps

        // populating the form when updating an integration
        if (!this.isInitialized && isUpdate && !loading.get('integration')) {
            this.setState(this._getIntegration(integration))
            this.isInitialized = true
        }
    }

    _getIntegration = (integration) => {
        return _defaults({
            name: integration.get('name'),
            introductionText: integration.getIn(['decoration', 'introduction_text']),
            offlineIntroductionText: integration.getIn(['decoration', 'offline_introduction_text']),
            inputPlaceholder: integration.getIn(['decoration', 'input_placeholder']),
            mainColor: integration.getIn(['decoration', 'main_color'], integration.getIn(['decoration', 'header_color'])), // todo(@martin): remove this fallback when everybody has migrated to the new design (latest: Nov. 1, 2017)
            conversationColor: integration.getIn(['decoration', 'conversation_color']),
        }, defaultContent)
    }

    _isSubmitting = () => {
        const {loading, integration} = this.props
        return loading.get('updateIntegration') === integration.get('id', true)
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        const form = _pick(this.state, ['name', 'type'])
        form.decoration = {
            input_placeholder: this.state.inputPlaceholder,
            conversation_color: this.state.conversationColor,
            main_color: this.state.mainColor,
            introduction_text: this.state.introductionText,
            offline_introduction_text: this.state.offlineIntroductionText,
        }

        // if update, set ids for server
        if (this.props.isUpdate) {
            form.id = this.props.integration.get('id')
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
                    <RealtimeMessagingIntegrationNavigation integration={integration}/>
                )}

                <Container fluid className="page-container">
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
                                            onChange={value => this.setState({name: value})}
                                            placeholder="Ex: Company Support"
                                            required
                                        />

                                        <InputField
                                            type="text"
                                            value={this.state.introductionText}
                                            onFocus={() => this.setState({isOnline: true})}
                                            onChange={value => this.setState({introductionText: value})}
                                            label="Introduction text"
                                        />

                                        <InputField
                                            type="text"
                                            value={this.state.offlineIntroductionText}
                                            onFocus={() => {
                                                this.setState({isOnline: false})
                                            }}
                                            onChange={value => {
                                                this.setState({offlineIntroductionText: value})
                                            }}
                                            label="Away introduction text"
                                        />

                                        <InputField
                                            type="text"
                                            value={this.state.inputPlaceholder}
                                            onChange={value => this.setState({inputPlaceholder: value})}
                                            label="Input placeholder"
                                        />

                                        <ColorField
                                            value={this.state.mainColor}
                                            onChange={value => this.setState({mainColor: value})}
                                            label="Main color"
                                        />

                                        <ColorField
                                            value={this.state.conversationColor}
                                            onChange={value => this.setState({conversationColor: value})}
                                            label="Conversation color"
                                        />

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
                                            color="danger"
                                            outline
                                            confirm={() => actions.deleteIntegration(integration)}
                                            content="Are you sure you want to delete this integration?"
                                        >
                                            Delete chat
                                        </ConfirmButton>
                                    )
                                }
                            </Form>
                        </Col>
                        <Col className="p-0">
                            <ChatIntegrationPreview
                                currentUser={currentUser}
                                name={this.state.name}
                                introductionText={this.state.introductionText}
                                offlineIntroductionText={this.state.offlineIntroductionText}
                                inputPlaceholder={this.state.inputPlaceholder}
                                mainColor={this.state.mainColor}
                                conversationColor={this.state.conversationColor}
                                isOnline={this.state.isOnline}
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
        shopifyIntegrations: integrationSelectors.getIntegrationsByTypes('shopify')(state)
    }
}

export default connect(mapStateToProps)(ChatIntegrationAppearance)
