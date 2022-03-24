import {AxiosError} from 'axios'
import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {fromJS, Map} from 'immutable'
import _defaults from 'lodash/defaults'
import _merge from 'lodash/merge'
import _pick from 'lodash/pick'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    ButtonGroup,
    Col,
    Container,
    Form,
    Row,
} from 'reactstrap'

import {CHAT_AUTO_RESPONDER_REPLY_DEFAULT} from 'config/integrations/index'
import {
    SMOOCH_INSIDE_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH,
    SMOOCH_INSIDE_AUTO_RESPONDER_ENABLED_DEFAULT,
    SMOOCH_INSIDE_DEFAULT_COLOR,
    SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_MEMBERS,
    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT,
    SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
    SMOOCH_INSIDE_WIDGET_LANGUAGE_OPTIONS,
    SMOOCH_INSIDE_WIDGET_TEXTS,
    SMOOCH_INSIDE_WIDGET_TEXTS_DEFAULTS,
    SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
    SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_DEFAULT,
} from 'config/integrations/smooch_inside'
import {IntegrationType, IntegrationDecoration} from 'models/integration/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import ColorField from 'pages/common/forms/ColorField'
import FileField, {UploadType} from 'pages/common/forms/FileField'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import settingsCss from 'pages/settings/settings.less'
import {
    deleteIntegration,
    updateOrCreateIntegration,
} from 'state/integrations/actions'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {RootState} from 'state/types'
import ChatIntegrationNavigation from 'pages/integrations/detail/components/chat/ChatIntegrationNavigation'
import ChatIntegrationPreview from 'pages/integrations/detail/components/chat/ChatIntegrationPreview/ChatIntegrationPreview'
import MessageContentPreview from 'pages/integrations/detail/components/chat/ChatIntegrationPreview/MessageContent'

import css from './ChatIntegrationAppearance.less'

export const defaultContent = {
    type: IntegrationType.SmoochInside,
    name: '',
    introductionText: SMOOCH_INSIDE_WIDGET_TEXTS_DEFAULTS.introductionText,
    offlineIntroductionText:
        SMOOCH_INSIDE_WIDGET_TEXTS_DEFAULTS.offlineIntroductionText,
    mainColor: SMOOCH_INSIDE_DEFAULT_COLOR,
    conversationColor: SMOOCH_INSIDE_DEFAULT_COLOR,
    isOnline: true,
    language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
    avatarType: SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_DEFAULT,
    avatarTeamPictureUrl: null,
}

const avatarTypeOptions = [
    {
        value: SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_MEMBERS,
        label: "Use team members' avatars",
    },
    {
        value: SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
        label: 'Use a single image for the whole team',
        caption:
            "For example, use your company's logo. The image " +
            'needs to be a square of 500kb maximum.',
    },
]

type Props = {
    integration: Map<any, any>
    isUpdate: boolean
    loading: Map<any, any>
    currentUser: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    type: string
    name: string
    introductionText: string
    offlineIntroductionText: string
    mainColor: string
    conversationColor: string
    isOnline: boolean
    language: string
    avatarType: string
    avatarTeamPictureUrl: Maybe<string>
    isCopied: boolean
    isShopifyInstructions: boolean
    isInitialized: boolean
}

export class ChatIntegrationAppearance extends Component<Props, State> {
    state = _merge(
        {
            isCopied: false,
            isShopifyInstructions: true,
            isInitialized: false,
        },
        defaultContent
    )

    componentDidMount() {
        if (
            this.props.isUpdate &&
            !this.state.isInitialized &&
            !this.props.integration.isEmpty()
        ) {
            this._initState(this.props.integration)
        }
    }

    componentWillUpdate(nextProps: Props, nextState: State) {
        const {integration, isUpdate, loading} = nextProps
        const {isInitialized} = nextState

        // populating the form when updating an integration
        if (isUpdate && !isInitialized && !loading.get('integration')) {
            this._initState(integration)
        }
    }

    _initState = (integration: Map<any, any>) => {
        this.setState(
            _defaults(
                {
                    name: integration.get('name'),
                    introductionText: integration.getIn([
                        'decoration',
                        'introduction_text',
                    ]),
                    offlineIntroductionText: integration.getIn([
                        'decoration',
                        'offline_introduction_text',
                    ]),
                    mainColor: integration.getIn(['decoration', 'main_color']),
                    conversationColor: integration.getIn([
                        'decoration',
                        'conversation_color',
                    ]),
                    language: integration.getIn(['meta', 'language']),
                    avatarType:
                        integration.getIn(['decoration', 'avatar_type']) ||
                        SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_DEFAULT,
                    avatarTeamPictureUrl: integration.getIn([
                        'decoration',
                        'avatar_team_picture_url',
                    ]),
                    isInitialized: true,
                },
                defaultContent
            )
        )
    }

    _isSubmitting = () => {
        const {loading, integration} = this.props
        return loading.get('updateIntegration') === integration.get('id', true)
    }

    _handleSubmit = (event: React.SyntheticEvent) => {
        event.preventDefault()
        const form: {
            name: string
            type: string
            decoration?: IntegrationDecoration
            meta?: Record<string, unknown>
            id?: number
        } = _pick(this.state, ['name', 'type'])
        form.decoration = {
            conversation_color: this.state.conversationColor,
            main_color: this.state.mainColor,
            introduction_text: this.state.introductionText,
            offline_introduction_text: this.state.offlineIntroductionText,
            avatar_type: this.state.avatarType,
            avatar_team_picture_url: this.state.avatarTeamPictureUrl,
        }

        form.meta = {
            language: this.state.language,
            preferences: {
                email_capture_enforcement:
                    SMOOCH_INSIDE_WIDGET_EMAIL_CAPTURE_DEFAULT,
                auto_responder: {
                    enabled: SMOOCH_INSIDE_AUTO_RESPONDER_ENABLED_DEFAULT,
                    reply: CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
                },
            },
        }

        if (this.props.isUpdate) {
            form.id = this.props.integration.get('id')
            form.meta = (this.props.integration.get('meta') as Map<any, any>)
                .set('language', this.state.language)
                .toJS()
        }

        return (
            this.props.updateOrCreateIntegration(fromJS(form)) as Promise<{
                error?: AxiosError
            }>
        ).then(({error} = {}) => {
            if (error) {
                return
            }

            // reload the integration
            this.setState({isInitialized: false})
        })
    }

    _setLanguage = (language: string) => {
        const newState: Partial<State> = {language}

        const textFieldsToUpdate: [
            'introductionText',
            'offlineIntroductionText'
        ] = ['introductionText', 'offlineIntroductionText']
        textFieldsToUpdate.forEach((textName) => {
            if (
                this.state[textName] ===
                SMOOCH_INSIDE_WIDGET_TEXTS[this.state.language][textName]
            ) {
                newState[textName] =
                    SMOOCH_INSIDE_WIDGET_TEXTS[language][textName]
            }
        })

        this.setState(newState as State)
    }

    render() {
        const {deleteIntegration, integration, isUpdate, loading, currentUser} =
            this.props
        const {
            name,
            introductionText,
            offlineIntroductionText,
            avatarType,
            avatarTeamPictureUrl,
            mainColor,
            conversationColor,
            language,
            isOnline,
        } = this.state

        const isTeamPictureAvatarSelected =
            avatarType === SMOOCH_INSIDE_WIDGET_AVATAR_TYPE_TEAM_PICTURE
        const isSubmitting = this._isSubmitting()

        if (loading.get('integration')) {
            return <Loader />
        }

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
                                <Link to="/app/settings/integrations/smooch_inside">
                                    Chat (Deprecated)
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {isUpdate
                                    ? integration.get('name')
                                    : 'New chat integration'}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                {isUpdate && (
                    <ChatIntegrationNavigation integration={integration} />
                )}

                <Container fluid className={settingsCss.pageContainer}>
                    <Row>
                        <Col>
                            <Form onSubmit={this._handleSubmit}>
                                <div className={css.form}>
                                    <div className={css.fieldset}>
                                        <DEPRECATED_InputField
                                            type="text"
                                            label="Chat title"
                                            value={name}
                                            onChange={(value) =>
                                                this.setState({name: value})
                                            }
                                            placeholder="Ex: Company Support"
                                            required
                                        />

                                        <DEPRECATED_InputField
                                            type="text"
                                            value={introductionText}
                                            onFocus={() =>
                                                this.setState({isOnline: true})
                                            }
                                            onChange={(value) =>
                                                this.setState({
                                                    introductionText: value,
                                                })
                                            }
                                            label="Introduction text during business hours"
                                            maxLength={
                                                SMOOCH_INSIDE_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH
                                            }
                                        />

                                        <DEPRECATED_InputField
                                            type="text"
                                            value={offlineIntroductionText}
                                            onFocus={() => {
                                                this.setState({isOnline: false})
                                            }}
                                            onChange={(value) => {
                                                this.setState({
                                                    offlineIntroductionText:
                                                        value,
                                                })
                                            }}
                                            label="Introduction text outside business hours"
                                            maxLength={
                                                SMOOCH_INSIDE_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH
                                            }
                                        />

                                        {isUpdate && (
                                            <>
                                                <RadioFieldSet
                                                    className="mb-3"
                                                    options={avatarTypeOptions}
                                                    selectedValue={avatarType}
                                                    onChange={(value) =>
                                                        this.setState({
                                                            avatarType: value,
                                                        })
                                                    }
                                                    label="Avatar"
                                                />
                                                {isTeamPictureAvatarSelected && (
                                                    <div className="d-flex flex-direction-row mb-2">
                                                        {!!avatarTeamPictureUrl && (
                                                            <img
                                                                className="mr-3"
                                                                style={{
                                                                    maxWidth:
                                                                        '100px',
                                                                }}
                                                                src={
                                                                    avatarTeamPictureUrl as any
                                                                }
                                                                alt="Team avatar"
                                                            />
                                                        )}
                                                        <FileField
                                                            returnFiles={false}
                                                            noPreview={true}
                                                            onChange={(
                                                                avatarTeamPictureUrl: Maybe<string>
                                                            ) =>
                                                                this.setState({
                                                                    avatarTeamPictureUrl,
                                                                })
                                                            }
                                                            uploadType={
                                                                UploadType.Avatar
                                                            }
                                                            params={{
                                                                ['integration_id']:
                                                                    integration.get(
                                                                        'id'
                                                                    ),
                                                            }}
                                                            maxSize={500 * 1000}
                                                            required={
                                                                isTeamPictureAvatarSelected &&
                                                                !avatarTeamPictureUrl
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <ColorField
                                            value={mainColor}
                                            onChange={(value: string) =>
                                                this.setState({
                                                    mainColor: value,
                                                })
                                            }
                                            label="Main color"
                                        />

                                        <ColorField
                                            value={conversationColor}
                                            onChange={(value: string) =>
                                                this.setState({
                                                    conversationColor: value,
                                                })
                                            }
                                            label="Conversation color"
                                        />

                                        <DEPRECATED_InputField
                                            type="select"
                                            value={language}
                                            options={SMOOCH_INSIDE_WIDGET_LANGUAGE_OPTIONS.toJS()}
                                            onChange={this._setLanguage}
                                            label="Language"
                                        >
                                            {SMOOCH_INSIDE_WIDGET_LANGUAGE_OPTIONS.map(
                                                (option: Map<any, any>) => (
                                                    <option
                                                        key={option.get(
                                                            'value'
                                                        )}
                                                        value={option.get(
                                                            'value'
                                                        )}
                                                    >
                                                        {option.get('label')}
                                                    </option>
                                                )
                                            )}
                                        </DEPRECATED_InputField>
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

                                {isUpdate && (
                                    <ConfirmButton
                                        className="float-right"
                                        onConfirm={() =>
                                            deleteIntegration(integration)
                                        }
                                        confirmationContent="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                                        intent="destructive"
                                        isDisabled={isSubmitting}
                                    >
                                        <ButtonIconLabel icon="delete">
                                            Delete chat
                                        </ButtonIconLabel>
                                    </ConfirmButton>
                                )}
                            </Form>
                        </Col>
                        <Col className="p-0">
                            <div
                                className="d-flex justify-content-center align-items-center"
                                style={{width: '30em'}} // same width as the preview
                            >
                                <ButtonGroup className="mb-3">
                                    <Button
                                        type="button"
                                        color={isOnline ? 'info' : 'secondary'}
                                        onClick={() =>
                                            this.setState({isOnline: true})
                                        }
                                    >
                                        During business hours
                                    </Button>
                                    <Button
                                        type="button"
                                        color={!isOnline ? 'info' : 'secondary'}
                                        onClick={() =>
                                            this.setState({isOnline: false})
                                        }
                                    >
                                        Outside business hours
                                    </Button>
                                </ButtonGroup>
                            </div>
                            <ChatIntegrationPreview
                                currentUser={currentUser}
                                name={name}
                                avatarType={avatarType}
                                avatarTeamPictureUrl={avatarTeamPictureUrl}
                                introductionText={introductionText}
                                offlineIntroductionText={
                                    offlineIntroductionText
                                }
                                mainColor={mainColor}
                                isOnline={isOnline}
                                language={language}
                            >
                                <MessageContentPreview
                                    conversationColor={conversationColor}
                                />
                            </ChatIntegrationPreview>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => {
        return {
            shopifyIntegrations: getIntegrationsByTypes(
                IntegrationType.Shopify
            )(state),
        }
    },
    {
        deleteIntegration,
        updateOrCreateIntegration,
    }
)

export default connector(ChatIntegrationAppearance)
