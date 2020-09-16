// @flow
//$FlowFixMe
import React, {Fragment} from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {fromJS, type List, type Map} from 'immutable'
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

import {
    GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH,
    GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    GORGIAS_CHAT_DEFAULT_COLOR,
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_MEMBERS,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS,
    GORGIAS_CHAT_WIDGET_TEXTS,
    GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS,
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
} from '../../../../../../config/integrations/gorgias_chat'
import {CHAT_AUTO_RESPONDER_REPLY_DEFAULT} from '../../../../../../config/integrations'
import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from '../../../../../../constants/integration'

import * as integrationSelectors from '../../../../../../state/integrations/selectors.ts'

import ConfirmButton from '../../../../../common/components/ConfirmButton'
import ColorField from '../../../../../common/forms/ColorField'
import FileField from '../../../../../common/forms/FileField'
import InputField from '../../../../../common/forms/InputField'
import Loader from '../../../../../common/components/Loader'
import PageHeader from '../../../../../common/components/PageHeader'
import RadioField from '../../../../../common/forms/RadioField'

import GorgiasChatIntegrationNavigation from '../GorgiasChatIntegrationNavigation'
import GorgiasChatIntegrationPreview from '../GorgiasChatIntegrationPreview'
import MessageContentPreview from '../GorgiasChatIntegrationPreview/MessageContent'

import css from './GorgiasChatIntegrationAppearance.less'

export const defaultContent = {
    type: GORGIAS_CHAT_INTEGRATION_TYPE,
    name: '',
    introductionText: GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS.introductionText,
    offlineIntroductionText:
        GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS.offlineIntroductionText,
    mainColor: GORGIAS_CHAT_DEFAULT_COLOR,
    conversationColor: GORGIAS_CHAT_DEFAULT_COLOR,
    isOnline: true,
    language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    avatarType: GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
    avatarTeamPictureUrl: null,
}

const avatarTypeOptions = [
    {
        value: GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_MEMBERS,
        label: "Use team members' avatars",
    },
    {
        value: GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
        label: 'Use a single image for the whole team',
        description:
            "For example, use your company's logo. The image " +
            'needs to be a square of 500kb maximum.',
    },
]

type Props = {
    integration: Map<*, *>,
    isUpdate: boolean,
    actions: Object,
    loading: Map<*, *>,
    currentUser: Map<*, *>,
    shopifyIntegrations: List<Map<*, *>>,
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
    avatarType: string,
    avatarTeamPictureUrl: ?string,

    isCopied: boolean,
    isShopifyInstructions: boolean,
    isInitialized: boolean,
}

export class GorgiasChatIntegrationAppearanceComponent extends React.Component<
    Props,
    State
> {
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

    _initState = (integration: Map<*, *>) => {
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
                        GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
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

    _handleSubmit = (event: SyntheticEvent<*>) => {
        event.preventDefault()
        const form = _pick(this.state, ['name', 'type'])
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
                email_capture_enforcement: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
                auto_responder: {
                    enabled: GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
                    reply: CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
                },
            },
        }

        if (this.props.isUpdate) {
            form.id = this.props.integration.get('id')
            form.meta = this.props.integration
                .get('meta')
                .set('language', this.state.language)
                .toJS()
        }

        return this.props.actions
            .updateOrCreateIntegration(fromJS(form))
            .then(({error} = {}) => {
                if (error) {
                    return
                }

                // reload the integration
                this.setState({isInitialized: false})
            })
    }

    // $FlowFixMe
    _setLanguage = (language: string) => {
        let newState = {language}

        const textFieldsToUpdate = [
            'introductionText',
            'offlineIntroductionText',
        ]
        textFieldsToUpdate.forEach((textName) => {
            if (
                this.state[textName] ===
                GORGIAS_CHAT_WIDGET_TEXTS[this.state.language][textName]
            ) {
                // $FlowFixMe
                newState[textName] =
                    GORGIAS_CHAT_WIDGET_TEXTS[language][textName]
            }
        })

        this.setState(newState)
    }

    render() {
        const {
            actions,
            integration,
            isUpdate,
            loading,
            currentUser,
        } = this.props
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
            avatarType === GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE
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
                                <Link
                                    to={`/app/settings/integrations/${GORGIAS_CHAT_INTEGRATION_TYPE}`}
                                >
                                    Gorgias Chat
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {isUpdate
                                    ? integration.get('name')
                                    : 'New chat integration'}
                            </BreadcrumbItem>
                            {isUpdate && (
                                <BreadcrumbItem active>
                                    Appearance
                                </BreadcrumbItem>
                            )}
                        </Breadcrumb>
                    }
                />

                {isUpdate && (
                    <GorgiasChatIntegrationNavigation
                        integration={integration}
                    />
                )}

                <Container fluid className="page-container">
                    <Row>
                        <Col>
                            <Form onSubmit={this._handleSubmit}>
                                <div className={css.form}>
                                    <div className={css.fieldset}>
                                        <InputField
                                            type="text"
                                            label="Chat title"
                                            value={name}
                                            onChange={(value) =>
                                                this.setState({name: value})
                                            }
                                            placeholder="Ex: Company Support"
                                            required
                                        />

                                        <InputField
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
                                                GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH
                                            }
                                        />

                                        <InputField
                                            type="text"
                                            value={offlineIntroductionText}
                                            onFocus={() => {
                                                this.setState({isOnline: false})
                                            }}
                                            onChange={(value) => {
                                                this.setState({
                                                    offlineIntroductionText: value,
                                                })
                                            }}
                                            label="Introduction text outside business hours"
                                            maxLength={
                                                GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH
                                            }
                                        />

                                        {isUpdate && (
                                            <Fragment>
                                                <RadioField
                                                    key="type-field"
                                                    options={avatarTypeOptions}
                                                    value={avatarType}
                                                    onChange={(value) =>
                                                        this.setState({
                                                            avatarType: value,
                                                        })
                                                    }
                                                    label="Avatar"
                                                />
                                                {isTeamPictureAvatarSelected && (
                                                    <div
                                                        key="file-field"
                                                        className="d-flex flex-direction-row mb-2"
                                                    >
                                                        {!!avatarTeamPictureUrl && (
                                                            <img
                                                                className="mr-3"
                                                                style={{
                                                                    maxWidth:
                                                                        '100px',
                                                                }}
                                                                src={
                                                                    avatarTeamPictureUrl
                                                                }
                                                                alt="Team avatar"
                                                            />
                                                        )}
                                                        <FileField
                                                            returnFiles={false}
                                                            noPreview={true}
                                                            onChange={(
                                                                avatarTeamPictureUrl
                                                            ) =>
                                                                this.setState({
                                                                    avatarTeamPictureUrl,
                                                                })
                                                            }
                                                            uploadType="avatar_team_picture"
                                                            params={{
                                                                ['integration_id']: integration.get(
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
                                            </Fragment>
                                        )}

                                        <ColorField
                                            value={mainColor}
                                            onChange={(value) =>
                                                this.setState({
                                                    mainColor: value,
                                                })
                                            }
                                            label="Main color"
                                        />

                                        <ColorField
                                            value={conversationColor}
                                            onChange={(value) =>
                                                this.setState({
                                                    conversationColor: value,
                                                })
                                            }
                                            label="Conversation color"
                                        />

                                        <InputField
                                            type="select"
                                            value={language}
                                            options={GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.toJS()}
                                            onChange={this._setLanguage}
                                            label="Language"
                                        >
                                            {GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.map(
                                                (option) => (
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

                                {isUpdate && (
                                    <ConfirmButton
                                        className="float-right"
                                        color="secondary"
                                        confirm={() =>
                                            actions.deleteIntegration(
                                                integration
                                            )
                                        }
                                        content="Are you sure you want to delete this integration?"
                                    >
                                        <i className="material-icons mr-1 text-danger">
                                            delete
                                        </i>
                                        Delete chat
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
                            <GorgiasChatIntegrationPreview
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
                                    currentUser={currentUser}
                                />
                            </GorgiasChatIntegrationPreview>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        shopifyIntegrations: integrationSelectors.getIntegrationsByTypes(
            SHOPIFY_INTEGRATION_TYPE
        )(state),
    }
}

export default connect(mapStateToProps)(
    GorgiasChatIntegrationAppearanceComponent
)
