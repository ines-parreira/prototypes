import React, {Fragment, SyntheticEvent, useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'
import _defaults from 'lodash/defaults'
import _merge from 'lodash/merge'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    ButtonGroup,
    Form,
    Label,
} from 'reactstrap'
import classNames from 'classnames'

import wrench from 'assets/img/icons/wrench.svg'
import storefront from 'assets/img/icons/storefront.svg'

import * as IntegrationsActions from '../../../../../../state/integrations/actions'
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
    GORGIAS_CHAT_WIDGET_POSITION_OPTIONS,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
} from '../../../../../../config/integrations/gorgias_chat'
import {CHAT_AUTO_RESPONDER_REPLY_DEFAULT} from '../../../../../../config/integrations'
import {Language} from '../../../../../../constants/languages'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../../constants/integration'
import * as integrationSelectors from '../../../../../../state/integrations/selectors'
import {
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
    IntegrationType,
} from '../../../../../../models/integration/types'
import {RootState} from '../../../../../../state/types'
import ConfirmButton from '../../../../../common/components/ConfirmButton'
import ColorField from '../../../../../common/forms/ColorField.js'
import FileField from '../../../../../common/forms/FileField'
import InputField from '../../../../../common/forms/InputField.js'
import Loader from '../../../../../common/components/Loader/Loader'
import PageHeader from '../../../../../common/components/PageHeader'
import RadioField from '../../../../../common/forms/RadioField'
import GorgiasChatIntegrationNavigation from '../GorgiasChatIntegrationNavigation'
import ChatIntegrationPreview from '../GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import MessageContentPreview from '../GorgiasChatIntegrationPreview/MessageContent'
import Tooltip from '../../../../../common/components/Tooltip'

import GorgiasChatIntegrationPreviewContainer from '../GorgiasChatIntegrationPreviewContainer/GorgiasChatIntegrationPreviewContainer'
import css from './GorgiasChatIntegrationAppearance.less'
import {StoreNameDropdown} from './StoreNameDropdown'
import {StoreRadioButton} from './StoreRadioButton'

export enum PositionAxis {
    AXIS_X = 'axis-x',
    AXIS_Y = 'axis-y',
}

export const defaultContent = {
    type: IntegrationType.GorgiasChat,
    name: '',
    introductionText: GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS?.introductionText,
    offlineIntroductionText:
        GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS?.offlineIntroductionText,
    mainColor: GORGIAS_CHAT_DEFAULT_COLOR,
    conversationColor: GORGIAS_CHAT_DEFAULT_COLOR,
    isOnline: true,
    language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    avatarType: GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
    avatarTeamPictureUrl: undefined,
    position: GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
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
    integration: Map<any, any>
    isUpdate: boolean
    actions: typeof IntegrationsActions
    loading: Map<any, any>
    currentUser: Map<any, any>
}

type State = {
    type: IntegrationType
    name: string
    introductionText: string
    offlineIntroductionText: string
    mainColor: string
    conversationColor: string
    isOnline: boolean
    language: string
    avatarType: string
    avatarTeamPictureUrl?: string
    showSelectStoreField: boolean
    isCopied: boolean
    isShopifyInstructions: boolean
    isInitialized: boolean
    position: GorgiasChatPosition
    editedPositionAxis: PositionAxis | null
}

type SubmitForm = {
    type: IntegrationType
    id?: number
    name: string
    decoration: any
    meta: any
}

export const GorgiasChatIntegrationAppearanceComponent = ({
    integration,
    isUpdate,
    actions,
    loading,
    currentUser,
    shopifyIntegrations,
    gorgiasChatIntegrations,
}: Props & ConnectedProps<typeof connector>) => {
    const [state, setState] = useState<State>(
        _merge(
            {
                showSelectStoreField: true,
                isCopied: false,
                isShopifyInstructions: true,
                isInitialized: false,
                editedPositionAxis: null,
            },
            defaultContent
        )
    )

    const [storeName, setStoreName] = useState(
        integration.getIn(['meta', 'shop_name'])
    )

    const [storeIntegrationId, setStoreIntegrationId] = useState(0)

    useEffect(() => {
        if (isUpdate && !loading.get('integration')) {
            initState(integration)
        }
    }, [integration])

    const initState = (integration: Map<any, any>) => {
        setState(
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
                    position: {
                        alignment: integration.getIn(
                            ['decoration', 'position', 'alignment'],
                            GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.alignment
                        ),
                        offsetX: integration.getIn(
                            ['decoration', 'position', 'offsetX'],
                            GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetX
                        ),
                        offsetY: integration.getIn(
                            ['decoration', 'position', 'offsetY'],
                            GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetY
                        ),
                    },
                    language:
                        integration.getIn(['meta', 'language']) ===
                        Language.French
                            ? Language.FrenchFr
                            : integration.getIn(['meta', 'language']),
                    avatarType:
                        integration.getIn(['decoration', 'avatar_type']) ||
                        GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
                    avatarTeamPictureUrl: integration.getIn([
                        'decoration',
                        'avatar_team_picture_url',
                    ]),
                    isInitialized: true,
                    showSelectStoreField: true,
                    isCopied: false,
                    isShopifyInstructions: true,
                    editedPositionAxis: null,
                },
                defaultContent
            )
        )
    }

    const _isSubmitting = () => {
        return loading.get('updateIntegration') === integration.get('id', true)
    }

    const _canSubmit = () => {
        return (
            (state.showSelectStoreField && !!storeName && state.name) ||
            (!state.showSelectStoreField && state.name)
        )
    }

    const handleSubmit = (event: SyntheticEvent<any>) => {
        event.preventDefault()
        const form: SubmitForm = {
            type: state.type,
            name: state.name,
            decoration: {
                conversation_color: state.conversationColor,
                main_color: state.mainColor,
                introduction_text: state.introductionText,
                offline_introduction_text: state.offlineIntroductionText,
                avatar_type: state.avatarType,
                avatar_team_picture_url: state.avatarTeamPictureUrl,
                position: state.position,
            },
            meta: {
                language: state.language,
                shop_name: state.showSelectStoreField ? storeName : null,
                shop_type: state.showSelectStoreField
                    ? SHOPIFY_INTEGRATION_TYPE
                    : null,
                shop_integration_id: state.showSelectStoreField
                    ? storeIntegrationId
                    : null,
                preferences: {
                    email_capture_enforcement:
                        GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
                    auto_responder: {
                        enabled: GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
                        reply: CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
                    },
                },
            },
        }

        if (isUpdate) {
            form.id = integration.get('id')
            const integrationMeta: Map<any, any> = integration.get('meta')
            form.meta = integrationMeta
                .set('language', state.language)
                .set('position', state.position)
                .toJS()
        }

        return (
            actions.updateOrCreateIntegration(
                fromJS(form)
            ) as unknown as Promise<any>
        ).then(({error} = {}) => {
            if (error) {
                return
            }

            // reload the integration
            setState((prevState) => ({...prevState, isInitialized: false}))
        })
    }

    const setLanguage = (language: string) => {
        const newState: {
            language: string
            introductionText?: string
            offlineIntroductionText?: string
        } = {language}

        const textFieldsToUpdate: [
            'introductionText',
            'offlineIntroductionText'
        ] = ['introductionText', 'offlineIntroductionText']
        textFieldsToUpdate.forEach((textName) => {
            if (
                state[textName] ===
                GORGIAS_CHAT_WIDGET_TEXTS[state.language][textName]
            ) {
                newState[textName] =
                    GORGIAS_CHAT_WIDGET_TEXTS[language][textName]
            }
        })

        setState((prevState) => ({...prevState, ...newState}))
    }

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
        position,
        editedPositionAxis,
    } = state

    const isTeamPictureAvatarSelected =
        avatarType === GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE
    const isSubmitting = _isSubmitting()
    const canSubmit = _canSubmit()
    const storeTypeRadioButtons = [
        {
            label: 'Shopify store',
            icon: <img src={storefront} alt="storefront" />,
            onClick: () =>
                setState((prevState) => ({
                    ...prevState,
                    showSelectStoreField: true,
                })),
            tooltipText:
                "By connecting your live chat to an online store, you can leverage all the store's information for automation such as self-service flows and help articles.",
            isSelected: Boolean(state.showSelectStoreField),
        },
        {
            label: 'Any other website',
            icon: <img src={wrench} alt="wrench" />,
            onClick: () =>
                setState((prevState) => ({
                    ...prevState,
                    showSelectStoreField: false,
                })),
            tooltipText:
                'By creating a custom live chat, you will not be able to leverage any online store information such as self-service flows or help articles.',
            isSelected: !Boolean(state.showSelectStoreField),
        },
    ]

    if (loading.get('integration')) {
        return <Loader />
    }

    const autoResponderEnabled = integration.getIn([
        'meta',
        'preferences',
        'auto_responder',
        'enabled',
    ])
    const autoResponderReply = integration.getIn([
        'meta',
        'preferences',
        'auto_responder',
        'reply',
    ])

    const chatPreview = (
        <>
            <ButtonGroup className="mb-3">
                <Button
                    type="button"
                    color={isOnline ? 'info' : 'secondary'}
                    onClick={() =>
                        setState((prevState) => ({
                            ...prevState,
                            isOnline: true,
                        }))
                    }
                >
                    During business hours
                </Button>
                <Button
                    type="button"
                    color={!isOnline ? 'info' : 'secondary'}
                    onClick={() =>
                        setState((prevState) => ({
                            ...prevState,
                            isOnline: false,
                        }))
                    }
                >
                    Outside business hours
                </Button>
            </ButtonGroup>
            <ChatIntegrationPreview
                currentUser={currentUser}
                name={name}
                avatarType={avatarType}
                avatarTeamPictureUrl={avatarTeamPictureUrl}
                introductionText={introductionText}
                offlineIntroductionText={offlineIntroductionText}
                mainColor={mainColor}
                isOnline={isOnline}
                language={language}
                position={position}
                editedPositionAxis={editedPositionAxis}
                autoResponderEnabled={autoResponderEnabled}
                autoResponderReply={autoResponderReply}
            >
                <MessageContentPreview
                    conversationColor={conversationColor}
                    currentUser={currentUser}
                />
            </ChatIntegrationPreview>
        </>
    )

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
                                to={`/app/settings/integrations/${IntegrationType.GorgiasChat}`}
                            >
                                Chat
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
                <GorgiasChatIntegrationNavigation integration={integration} />
            )}

            <GorgiasChatIntegrationPreviewContainer preview={chatPreview}>
                <Form onSubmit={handleSubmit}>
                    {!isUpdate ? (
                        <>
                            <div className={css.selectStoreTypeContainer}>
                                <Label className={css.bold}>
                                    Where will you use this chat?
                                    <span className={css.redStar}>*</span>
                                </Label>
                                <div className={css.radioButtonGroup}>
                                    {storeTypeRadioButtons.map((props) => (
                                        <StoreRadioButton
                                            {...props}
                                            key={props.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : null}

                    <div className={css.form}>
                        <div
                            className={classNames(css.fieldset, css.formGroup)}
                        >
                            {!isUpdate && state.showSelectStoreField ? (
                                <>
                                    <Label className={css.bold}>
                                        Select a store
                                        <span className={css.error}>*</span>
                                        <span id="select-store">
                                            <i
                                                className={classNames(
                                                    'material-icons',
                                                    css.neutral
                                                )}
                                            >
                                                info_outline
                                            </i>
                                        </span>
                                        <Tooltip
                                            autohide={false}
                                            delay={100}
                                            placement="bottom-start"
                                            target="select-store"
                                            style={{
                                                textAlign: 'start',
                                                width: 180,
                                            }}
                                        >
                                            We currently only support automatic
                                            installation and self-service
                                            features with Shopify stores. Use
                                            the custom live chat option for any
                                            other ecommerce platform.
                                            <a
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                href="https://docs.gorgias.com/gorgias-chat/chat-getting-started"
                                            >
                                                Read more
                                            </a>
                                        </Tooltip>
                                    </Label>
                                    <StoreNameDropdown
                                        value={storeName}
                                        placeholder={'Select a store'}
                                        gorgiasChatIntegrations={
                                            gorgiasChatIntegrations
                                        }
                                        shopifyIntegrations={
                                            shopifyIntegrations
                                        }
                                        onChange={(
                                            shopName: string,
                                            storeIntegrationId: number
                                        ) => {
                                            setStoreName(shopName)
                                            setStoreIntegrationId(
                                                storeIntegrationId
                                            )
                                        }}
                                    />
                                </>
                            ) : null}
                            <InputField
                                className={css.formGroup}
                                type="text"
                                label="Chat title"
                                value={name}
                                onChange={(value: string) =>
                                    setState((prevState) => ({
                                        ...prevState,
                                        name: value,
                                    }))
                                }
                                placeholder="Ex: Company Support"
                                required
                            />
                            <InputField
                                className={css.formGroup}
                                type="text"
                                value={introductionText}
                                onFocus={() =>
                                    setState((prevState) => ({
                                        ...prevState,
                                        isOnline: true,
                                    }))
                                }
                                onChange={(value: string) =>
                                    setState((prevState) => ({
                                        ...prevState,
                                        introductionText: value,
                                    }))
                                }
                                label="Introduction text during business hours"
                                maxLength={
                                    GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH
                                }
                            />
                            <InputField
                                className={css.formGroup}
                                type="text"
                                value={offlineIntroductionText}
                                onFocus={() => {
                                    setState((prevState) => ({
                                        ...prevState,
                                        isOnline: false,
                                    }))
                                }}
                                onChange={(value: string) => {
                                    setState((prevState) => ({
                                        ...prevState,
                                        offlineIntroductionText: value,
                                    }))
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
                                        onChange={(value: string) =>
                                            setState((prevState) => ({
                                                ...prevState,
                                                avatarType: value,
                                            }))
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
                                                        maxWidth: '100px',
                                                    }}
                                                    src={avatarTeamPictureUrl}
                                                    alt="Team avatar"
                                                />
                                            )}
                                            <FileField
                                                returnFiles={false}
                                                noPreview={true}
                                                onChange={(
                                                    avatarTeamPictureUrl: string
                                                ) =>
                                                    setState((prevState) => ({
                                                        ...prevState,
                                                        avatarTeamPictureUrl,
                                                    }))
                                                }
                                                uploadType="avatar_team_picture"
                                                params={{
                                                    ['integration_id']:
                                                        integration.get('id'),
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
                            <div
                                className={classNames(
                                    css.colorPickersWrapper,
                                    css.formGroup
                                )}
                            >
                                <ColorField
                                    value={mainColor}
                                    onChange={(value: string) => {
                                        setState((prevState) => ({
                                            ...prevState,
                                            mainColor: value,
                                        }))
                                    }}
                                    label="Main color"
                                />
                                <ColorField
                                    value={conversationColor}
                                    onChange={(value: string) =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            conversationColor: value,
                                        }))
                                    }
                                    label="Conversation color"
                                />
                            </div>
                            <div className={css.positionWrapper}>
                                <InputField
                                    className={css.formGroup}
                                    type="select"
                                    value={position.alignment}
                                    options={GORGIAS_CHAT_WIDGET_POSITION_OPTIONS.toJS()}
                                    onChange={(
                                        alignment: GorgiasChatPositionAlignmentEnum
                                    ) => {
                                        setState((prevState) => ({
                                            ...prevState,
                                            position: {
                                                ...position,
                                                alignment,
                                            },
                                        }))
                                    }}
                                    label="Chat position"
                                >
                                    {GORGIAS_CHAT_WIDGET_POSITION_OPTIONS.map(
                                        (option) => {
                                            const value = option?.get('value')
                                            const label = option?.get('label')
                                            return (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            )
                                        }
                                    )}
                                </InputField>
                                <div className={css.positionInputsWrapper}>
                                    <InputField
                                        className={css.formGroup}
                                        type="number"
                                        value={position.offsetX}
                                        onChange={(offsetX: number) => {
                                            setState((prevState) => ({
                                                ...prevState,
                                                position: {
                                                    ...position,
                                                    offsetX,
                                                },
                                            }))
                                        }}
                                        min="-20"
                                        max="200"
                                        label="Move widget left / right"
                                        tooltip="Move the chat left or right to avoid overlap with other widgets you might have.
                                            By default, the chat icon is displayed at 22px from the left/right edges and and 22px from the top/bottom edges."
                                        tooltipIcon={
                                            <i
                                                className={classNames(
                                                    'material-icons-outlined',
                                                    css.tooltipIcon
                                                )}
                                            >
                                                info
                                            </i>
                                        }
                                        suffix="px"
                                        onFocus={() => {
                                            setState((prevState) => ({
                                                ...prevState,
                                                editedPositionAxis:
                                                    PositionAxis.AXIS_X,
                                            }))
                                        }}
                                        onBlur={() => {
                                            setState((prevState) => ({
                                                ...prevState,
                                                editedPositionAxis: null,
                                            }))
                                        }}
                                    />
                                    <InputField
                                        className={css.formGroup}
                                        type="number"
                                        value={position.offsetY}
                                        onChange={(offsetY: number) => {
                                            setState((prevState) => ({
                                                ...prevState,
                                                position: {
                                                    ...position,
                                                    offsetY,
                                                },
                                            }))
                                        }}
                                        min="-20"
                                        max="200"
                                        label="Move widget up / down"
                                        tooltip="Move the chat up or down to avoid overlap with other widgets you might have.
                                            By default, the chat icon is displayed at 22px from the left/right edges and and 22px from the top/bottom edges."
                                        tooltipIcon={
                                            <i
                                                className={classNames(
                                                    'material-icons-outlined',
                                                    css.tooltipIcon
                                                )}
                                            >
                                                info
                                            </i>
                                        }
                                        suffix="px"
                                        onFocus={() => {
                                            setState((prevState) => ({
                                                ...prevState,
                                                editedPositionAxis:
                                                    PositionAxis.AXIS_Y,
                                            }))
                                        }}
                                        onBlur={() => {
                                            setState((prevState) => ({
                                                ...prevState,
                                                editedPositionAxis: null,
                                            }))
                                        }}
                                    />
                                </div>
                            </div>
                            <InputField
                                className={css.formGroup}
                                type="select"
                                value={language}
                                options={GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.toJS()}
                                onChange={setLanguage}
                                label="Language"
                            >
                                {GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.map(
                                    (option) => {
                                        const value = option?.get('value')
                                        const label = option?.get('label')
                                        return (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        )
                                    }
                                )}
                            </InputField>
                        </div>
                        <div>
                            <Button
                                type="submit"
                                color="success"
                                className={classNames({
                                    'btn-loading': isSubmitting,
                                })}
                                disabled={
                                    isSubmitting || (!isUpdate && !canSubmit)
                                }
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
                                        ) as unknown as Promise<any>
                                    }
                                    confirmText="Delete"
                                    confirmColor="danger"
                                    content="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                                >
                                    <i className="material-icons mr-1 text-danger">
                                        delete
                                    </i>
                                    Delete chat
                                </ConfirmButton>
                            )}
                        </div>
                    </div>
                </Form>
            </GorgiasChatIntegrationPreviewContainer>
        </div>
    )
}

const mapStateToProps = (state: RootState) => {
    return {
        shopifyIntegrations: integrationSelectors.getIntegrationsByTypes(
            IntegrationType.Shopify
        )(state),
        gorgiasChatIntegrations: integrationSelectors.getIntegrationsByTypes(
            IntegrationType.GorgiasChat
        )(state),
    }
}
const connector = connect(mapStateToProps)

export default connector(GorgiasChatIntegrationAppearanceComponent)
