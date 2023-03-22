import React, {SyntheticEvent, useEffect, useState, useRef} from 'react'
import {Link, useHistory} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, List, Map} from 'immutable'
import _defaults from 'lodash/defaults'
import _merge from 'lodash/merge'
import _cloneDeep from 'lodash/cloneDeep'
import {
    Breadcrumb,
    BreadcrumbItem,
    Form,
    Label as ReactStrapLabel,
} from 'reactstrap'
import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import InputField from 'pages/common/forms/input/InputField'
import wrench from 'assets/img/icons/wrench.svg'
import storefront from 'assets/img/icons/storefront.svg'

import * as ToggleButton from 'pages/common/components/ToggleButton'
import Button from 'pages/common/components/button/Button'
import * as IntegrationsActions from 'state/integrations/actions'
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
    GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
} from 'config/integrations/gorgias_chat'
import {Language} from 'constants/languages'
import * as integrationSelectors from 'state/integrations/selectors'
import {
    GorgiasChatAvatarSettings,
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
    GorgiasChatLauncherType,
    IntegrationType,
} from 'models/integration/types'
import {RootState} from 'state/types'
import PageHeader from 'pages/common/components/PageHeader'
import Tooltip from 'pages/common/components/Tooltip'
import ColorField from 'pages/common/forms/ColorField'
import FileField from 'pages/common/forms/FileField'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import NumberInput from 'pages/common/forms/input/NumberInput'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import GorgiasChatIntegrationNavigation from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationNavigation'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import GorgiasChatIntegrationPreviewContainer from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreviewContainer/GorgiasChatIntegrationPreviewContainer'
import ConversationTimestamp from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ConversationTimestamp'
import ChatLauncher from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatLauncher'
import AutoResponderMessages from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/AutoResponderMessages'
import OfflineMessages from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/OfflineMessages'
import {FeatureFlagKey} from 'config/featureFlags'
import {SegmentEvent} from 'store/middlewares/segmentTracker'
import {useOnClickOutside} from 'pages/common/hooks/useOnClickOutside'
import Label from 'pages/common/forms/Label/Label'
import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'
import useIntegrationPageViewLogEvent from '../../../hooks/useIntegrationPageViewLogEvent'
import GorgiasChatIntegrationConnectedChannel from '../GorgiasChatIntegrationConnectedChannel'

import css from './GorgiasChatIntegrationAppearance.less'
import {StoreNameDropdown} from './StoreNameDropdown'
import {StoreRadioButton} from './StoreRadioButton'
import {CustomizeToneOfVoiceBlock} from './components/CustomizeToneOfVoiceBlock'
import ImageField from './components/ImageField'
import UploadLogoCaption from './components/UploadLogoCaption'

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
    launcher: {
        type: GorgiasChatLauncherType.ICON,
    },
    avatar: {
        imageType: GorgiasChatAvatarImageType.AGENT_PICTURE,
        nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
    },
}

const avatarTypeOptions = [
    {
        value: GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_MEMBERS,
        label: "Use team members' avatars",
    },
    {
        value: GORGIAS_CHAT_WIDGET_AVATAR_TYPE_TEAM_PICTURE,
        label: 'Use a single image for the whole team',
        caption:
            "For example, use your company's logo. The image " +
            'needs to be a square of 500kb maximum.',
    },
]

const avatarNameTypeOptions = [
    {
        value: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
        label: 'First name only',
    },
    {
        value: GorgiasChatAvatarNameType.AGENT_FIRST_LAST_NAME_INITIAL,
        label: 'First name, last name initial',
    },
    {
        value: GorgiasChatAvatarNameType.AGENT_FULLNAME,
        label: 'Full name',
    },
    {
        value: GorgiasChatAvatarNameType.CHAT_TITLE,
        label: 'Use chat title instead of agent name',
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
    launcher: {
        type: GorgiasChatLauncherType
        label?: string
    }
    avatar: GorgiasChatAvatarSettings
}

type SubmitForm = {
    type: IntegrationType
    id?: number
    name: string
    decoration: Record<string, any>
    meta: any
}

export const GorgiasChatIntegrationAppearanceComponent = ({
    integration,
    isUpdate,
    actions,
    loading,
    currentUser,
    storeIntegrations: storeIntegrationsProp,
    shopifyIntegrations,
    gorgiasChatIntegrations,
}: Props & ConnectedProps<typeof connector>) => {
    const history = useHistory()
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
    const viewTranslateEdit =
        useFlags()[FeatureFlagKey.ChatEnableTranslationEdit]
    const shouldShowLauncherCustomization =
        useFlags()[FeatureFlagKey.ChatLauncherCustomization]
    const shouldShowAvatarCustomization =
        useFlags()[FeatureFlagKey.ChatAgentAvatarCustomization]
    const isAutomationSettingsRevampEnabled =
        useFlags()[FeatureFlagKey.AutomationSettingsRevamp]

    const storeIntegrations = (
        isAutomationSettingsRevampEnabled
            ? storeIntegrationsProp
            : shopifyIntegrations
    ) as List<Map<any, any>>

    const [storeIntegrationId, setStoreIntegrationId] = useState(
        integration.getIn(['meta', 'shop_integration_id'], null)
    )

    useIntegrationPageViewLogEvent(
        SegmentEvent.ChatSettingsAppearancePageViewed,
        {
            isReady: !loading.get('integration'),
            integration: integration,
        }
    )

    useEffect(() => {
        if (isUpdate && !loading.get('integration')) {
            initState(integration)
        }

        // Preselect store if merchant has only 1 store integration
        if (!isUpdate && !loading.get('integration')) {
            if (storeIntegrations.size === 1) {
                const storeIntegration = storeIntegrations.getIn(['0']) as Map<
                    any,
                    any
                >

                setStoreIntegrationId(storeIntegration.get('id'))
                prefillWithStorename(storeIntegration.get('name'))
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [integration])

    const prefillWithStorename = (shopName: string) => {
        setState((state) => ({
            ...state,
            name: `${shopName} Support`,
        }))
    }

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
                    avatarType: integration.getIn(
                        ['decoration', 'avatar_type'],
                        GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT
                    ),
                    avatarTeamPictureUrl: integration.getIn([
                        'decoration',
                        'avatar_team_picture_url',
                    ]),
                    isInitialized: true,
                    showSelectStoreField: true,
                    isCopied: false,
                    isShopifyInstructions: true,
                    editedPositionAxis: null,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    launcher: integration
                        .getIn(
                            ['decoration', 'launcher'],
                            fromJS({type: GorgiasChatLauncherType.ICON})
                        )
                        .toJS(),
                    avatar: {
                        imageType: integration.getIn(
                            ['decoration', 'avatar', 'image_type'],
                            GorgiasChatAvatarImageType.AGENT_PICTURE
                        ),
                        nameType: integration.getIn(
                            ['decoration', 'avatar', 'name_type'],
                            GorgiasChatAvatarNameType.AGENT_FIRST_NAME
                        ),
                        companyLogoUrl: integration.getIn([
                            'decoration',
                            'avatar',
                            'company_logo_url',
                        ]),
                    },
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
            (state.showSelectStoreField &&
                !!storeIntegrationId &&
                state.name) ||
            (!state.showSelectStoreField && state.name)
        )
    }

    const handleSubmit = (event: SyntheticEvent<any>) => {
        event.preventDefault()

        const mainColor = CSS.supports('color', state.mainColor)
            ? state.mainColor.trim()
            : GORGIAS_CHAT_DEFAULT_COLOR

        const conversationColor = CSS.supports('color', state.conversationColor)
            ? state.conversationColor.trim()
            : GORGIAS_CHAT_DEFAULT_COLOR

        const storeIntegration = storeIntegrations.find(
            (storeIntegration) =>
                storeIntegration?.get('id') === storeIntegrationId
        )

        const form: SubmitForm = {
            type: state.type,
            name: state.name,
            decoration: {
                conversation_color: conversationColor,
                main_color: mainColor,
                introduction_text: state.introductionText,
                offline_introduction_text: state.offlineIntroductionText,
                avatar_type: state.avatarType,
                avatar_team_picture_url: state.avatarTeamPictureUrl,
                position: state.position,
                avatar: {
                    image_type: state.avatar.imageType,
                    name_type: state.avatar.nameType,
                },
            },
            meta: {
                language: state.language,
                shop_name: storeIntegration
                    ? getShopNameFromStoreIntegration(storeIntegration.toJS())
                    : null,
                shop_type: storeIntegration
                    ? storeIntegration.get('type')
                    : null,
                shop_integration_id: storeIntegration
                    ? storeIntegration.get('id')
                    : null,
                preferences: {
                    email_capture_enforcement:
                        GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
                    auto_responder: {
                        enabled: GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
                        reply: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
                    },
                    offline_mode_enabled_datetime:
                        GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT,
                },
            },
        }

        if (state.launcher.type === GorgiasChatLauncherType.ICON_AND_LABEL) {
            form.decoration.launcher = {
                type: GorgiasChatLauncherType.ICON_AND_LABEL,
                label: state.launcher.label,
            }
        } else if (state.launcher.type === GorgiasChatLauncherType.ICON) {
            form.decoration.launcher = {
                type: GorgiasChatLauncherType.ICON,
            }
        }

        if (!!state.avatar.companyLogoUrl) {
            form.decoration.avatar = {
                ...form.decoration.avatar,
                company_logo_url: state.avatar.companyLogoUrl,
            }
        }

        let actionToUse = actions.createGorgiasChatIntegration

        if (isUpdate) {
            form.id = integration.get('id')
            const integrationMeta: Map<any, any> = integration.get('meta')
            form.meta = integrationMeta
                .set('language', state.language)
                .set('position', state.position)
                .toJS()

            actionToUse = actions.updateOrCreateIntegration
        }

        return (actionToUse(fromJS(form)) as unknown as Promise<any>).then(
            ({error} = {}) => {
                if (error) {
                    return
                }

                // reload the integration
                setState((prevState) => ({...prevState, isInitialized: false}))
            }
        )
    }

    const setLanguage = (language: string) => {
        const newState: Partial<State> = {language}

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

        if (
            state.launcher.label ===
            GORGIAS_CHAT_WIDGET_TEXTS[state.language].chatWithUs
        ) {
            newState.launcher = _cloneDeep(state.launcher)
            newState.launcher.label =
                GORGIAS_CHAT_WIDGET_TEXTS[language].chatWithUs
        }

        setState((prevState) => ({...prevState, ...newState}))
    }

    const {
        name,
        introductionText,
        offlineIntroductionText,
        avatar,
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
            value: 'shopify',
            icon: <img src={storefront} alt="storefront" />,
            onClick: () =>
                setState((prevState) => ({
                    ...prevState,
                    showSelectStoreField: true,
                })),
            tooltipText:
                "By connecting your chat to an online store, you can leverage all the store's information for automation such as self-service flows and help articles.",
            isSelected: Boolean(state.showSelectStoreField),
        },
        {
            label: 'Any other website',
            value: 'website',
            icon: <img src={wrench} alt="wrench" />,
            onClick: () => {
                setState((prevState) => ({
                    ...prevState,
                    showSelectStoreField: false,
                }))
                setStoreIntegrationId(null)
            },
            tooltipText:
                'By creating a custom live chat, you will not be able to leverage any online store information such as self-service flows or help articles.',
            isSelected: !Boolean(state.showSelectStoreField),
        },
    ]

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

    const launcherCustomizationRef = useRef<HTMLDivElement>(null)
    const [isChatOpenInPreview, setIsChatOpenInPreview] = useState(true)
    useOnClickOutside(launcherCustomizationRef, () => {
        setIsChatOpenInPreview(true)
    })

    const chatPreview = (
        <div className={css.container}>
            <ToggleButton.Wrapper
                type={ToggleButton.Type.Label}
                value={isOnline}
                onChange={(isOnline: boolean) =>
                    setState((prevState) => ({
                        ...prevState,
                        isOnline,
                    }))
                }
                className={css.toggleButtonWrapper}
            >
                <ToggleButton.Option value={true}>
                    During Business Hours
                </ToggleButton.Option>
                <ToggleButton.Option value={false}>
                    Outside Business Hours
                </ToggleButton.Option>
            </ToggleButton.Wrapper>
            <ChatIntegrationPreview
                name={name}
                avatar={avatar}
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
                launcher={state.launcher}
                isOpen={isChatOpenInPreview}
                renderFooter={isOnline}
            >
                {isOnline ? (
                    <AutoResponderMessages
                        currentUser={currentUser}
                        conversationColor={conversationColor}
                        chatTitle={name}
                        avatar={state.avatar}
                        language={language}
                        autoResponderReply={
                            GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC
                        }
                    />
                ) : (
                    <>
                        <ConversationTimestamp />
                        <OfflineMessages
                            mainColor={mainColor}
                            chatTitle={name}
                            language={language}
                        />
                    </>
                )}
            </ChatIntegrationPreview>
        </div>
    )

    const launcherLabel =
        'label' in state.launcher
            ? state.launcher.label
            : GORGIAS_CHAT_WIDGET_TEXTS[state.language].chatWithUs

    const onCompanyLogoUrlChange = (companyLogoUrl?: string) => {
        setState((prevState) => ({
            ...prevState,
            avatar: {
                ...prevState.avatar,
                imageType:
                    !companyLogoUrl &&
                    prevState.avatar.imageType ===
                        GorgiasChatAvatarImageType.COMPANY_LOGO
                        ? GorgiasChatAvatarImageType.AGENT_PICTURE
                        : prevState.avatar.imageType,
                companyLogoUrl,
            },
        }))
    }

    const avatarImageTypeOptions = [
        {
            value: GorgiasChatAvatarImageType.AGENT_PICTURE,
            label: 'Profile picture',
        },
        {
            value: GorgiasChatAvatarImageType.AGENT_INITIALS,
            label: 'Initials',
        },
        {
            value: GorgiasChatAvatarImageType.COMPANY_LOGO,
            label: 'Logo',
            disabled: !avatar.companyLogoUrl,
            caption: !avatar.companyLogoUrl && (
                <UploadLogoCaption onConfirm={onCompanyLogoUrlChange} />
            ),
        },
    ]

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/channels/${IntegrationType.GorgiasChat}`}
                            >
                                Chat
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {isUpdate
                                ? integration.get('name')
                                : isAutomationSettingsRevampEnabled
                                ? 'New Chat'
                                : 'New chat integration'}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            >
                {isUpdate && (
                    <GorgiasChatIntegrationConnectedChannel
                        integration={integration}
                    />
                )}
            </PageHeader>

            {isUpdate && (
                <GorgiasChatIntegrationNavigation integration={integration} />
            )}

            <GorgiasChatIntegrationPreviewContainer preview={chatPreview}>
                <Form onSubmit={handleSubmit}>
                    {!isUpdate && !isAutomationSettingsRevampEnabled && (
                        <div className={css.selectStoreTypeContainer}>
                            <ReactStrapLabel className={css.bold}>
                                Where will you use this chat?
                                <span className={css.redStar}>*</span>
                            </ReactStrapLabel>
                            <div className={css.radioButtonGroup}>
                                {storeTypeRadioButtons.map((props) => (
                                    <StoreRadioButton
                                        {...props}
                                        key={props.label}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={css.form}>
                        {!isUpdate &&
                            state.showSelectStoreField &&
                            !isAutomationSettingsRevampEnabled && (
                                <>
                                    <ReactStrapLabel className={css.bold}>
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
                                    </ReactStrapLabel>
                                    <StoreNameDropdown
                                        storeIntegrationId={storeIntegrationId}
                                        gorgiasChatIntegrations={
                                            gorgiasChatIntegrations
                                        }
                                        storeIntegrations={storeIntegrations}
                                        onChange={(
                                            storeIntegrationId: number
                                        ) => {
                                            const storeIntegration =
                                                storeIntegrations.find(
                                                    (storeIntegration) =>
                                                        storeIntegration?.get(
                                                            'id'
                                                        ) === storeIntegrationId
                                                )!

                                            setStoreIntegrationId(
                                                storeIntegrationId
                                            )
                                            prefillWithStorename(
                                                storeIntegration.get('name')
                                            )
                                        }}
                                    />
                                </>
                            )}

                        {!isUpdate && isAutomationSettingsRevampEnabled && (
                            <div className={css.formSection}>
                                <h2 className={css.title}>
                                    Select a platform type
                                </h2>

                                <div className={css.platformTypeContainer}>
                                    <PreviewRadioButton
                                        value="ecommerce-platforms"
                                        isSelected={state.showSelectStoreField}
                                        label="Ecommerce platforms"
                                        caption="Shopify, Magento, BigCommerce"
                                        onClick={() =>
                                            setState((prevState) => ({
                                                ...prevState,
                                                showSelectStoreField: true,
                                            }))
                                        }
                                    />
                                    <PreviewRadioButton
                                        value="any-other-website"
                                        isSelected={!state.showSelectStoreField}
                                        label="Any other website"
                                        caption="Websites, knowledge bases, etc."
                                        onClick={() =>
                                            setState((prevState) => ({
                                                ...prevState,
                                                showSelectStoreField: false,
                                            }))
                                        }
                                    />
                                </div>

                                <Label isRequired={state.showSelectStoreField}>
                                    Connect a store
                                </Label>
                                <div className={css.connectStoreDescription}>
                                    {state.showSelectStoreField
                                        ? 'Connect a store to use Automation Add-on features in chat and to enable 1-click install for Shopify.'
                                        : 'Connect a store to enable Automation Add-on features in chat. You can always connect a store later.'}
                                </div>
                                <StoreNameDropdown
                                    storeIntegrationId={storeIntegrationId}
                                    gorgiasChatIntegrations={
                                        gorgiasChatIntegrations
                                    }
                                    storeIntegrations={storeIntegrations}
                                    onChange={(storeIntegrationId: number) => {
                                        const storeIntegration =
                                            storeIntegrations.find(
                                                (storeIntegration) =>
                                                    storeIntegration?.get(
                                                        'id'
                                                    ) === storeIntegrationId
                                            )!

                                        setStoreIntegrationId(
                                            storeIntegrationId
                                        )
                                        prefillWithStorename(
                                            storeIntegration.get('name')
                                        )
                                    }}
                                />
                            </div>
                        )}

                        <div className={css.formSection}>
                            {!isUpdate && isAutomationSettingsRevampEnabled && (
                                <h2 className={css.title}>Preferences</h2>
                            )}
                            <DEPRECATED_InputField
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
                            <DEPRECATED_InputField
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
                            </DEPRECATED_InputField>
                        </div>

                        <div className={css.formSection}>
                            <h2 className={css.title}>Intro message</h2>
                            <DEPRECATED_InputField
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
                                label={
                                    isAutomationSettingsRevampEnabled
                                        ? 'During business hours'
                                        : 'Introduction text during business hours'
                                }
                                maxLength={
                                    GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH
                                }
                            />
                            <DEPRECATED_InputField
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
                                label={
                                    isAutomationSettingsRevampEnabled
                                        ? 'Outside business hours'
                                        : 'Introduction text outside business hours'
                                }
                                maxLength={
                                    GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH
                                }
                            />

                            {viewTranslateEdit && isUpdate && (
                                <CustomizeToneOfVoiceBlock
                                    integrationId={integration.get('id')}
                                />
                            )}
                        </div>

                        <div className={css.formSection}>
                            <h2 className={css.title}>Colors</h2>

                            <div
                                className={classNames(css.colorPickersWrapper)}
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
                        </div>

                        {isUpdate && (
                            <>
                                {shouldShowAvatarCustomization ? (
                                    <div className={css.formSection}>
                                        <h2 className={css.title}>
                                            Company logo
                                        </h2>
                                        <ImageField
                                            isDiscardable={true}
                                            onChange={onCompanyLogoUrlChange}
                                            url={avatar.companyLogoUrl}
                                            maxSize={500 * 1000}
                                        />
                                        <h2
                                            className={classNames(
                                                css.title,
                                                'mt-5'
                                            )}
                                        >
                                            Agent avatar
                                        </h2>

                                        <div
                                            className={css.avatarInputsWrapper}
                                        >
                                            <RadioFieldSet
                                                className={css.radioFieldSet}
                                                label="Name"
                                                name="avatar-name-type-field"
                                                options={avatarNameTypeOptions}
                                                selectedValue={avatar.nameType}
                                                onChange={(value) =>
                                                    setState((prevState) => ({
                                                        ...prevState,
                                                        avatar: {
                                                            ...prevState.avatar,
                                                            nameType:
                                                                value as GorgiasChatAvatarNameType,
                                                        },
                                                    }))
                                                }
                                            />
                                            <RadioFieldSet
                                                className={css.radioFieldSet}
                                                label="Image"
                                                name="avatar-image-type-field"
                                                options={avatarImageTypeOptions}
                                                selectedValue={avatar.imageType}
                                                onChange={(value) =>
                                                    setState((prevState) => ({
                                                        ...prevState,
                                                        avatar: {
                                                            ...prevState.avatar,
                                                            imageType:
                                                                value as GorgiasChatAvatarImageType,
                                                        },
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={css.formSection}>
                                        <h2 className={css.title}>
                                            Chat header
                                        </h2>

                                        <RadioFieldSet
                                            name="type-field"
                                            className="mb-3"
                                            options={avatarTypeOptions}
                                            selectedValue={avatarType}
                                            onChange={(value) =>
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    avatarType: value,
                                                }))
                                            }
                                            label="Image"
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
                                                        avatarTeamPictureUrl: string
                                                    ) =>
                                                        setState(
                                                            (prevState) => ({
                                                                ...prevState,
                                                                avatarTeamPictureUrl,
                                                            })
                                                        )
                                                    }
                                                    uploadType="avatar_team_picture"
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
                                    </div>
                                )}
                            </>
                        )}

                        <div className={css.formSection}>
                            <h2 className={css.title}>Launcher</h2>

                            {shouldShowLauncherCustomization && (
                                <div ref={launcherCustomizationRef}>
                                    <div className={css.launcherTypes}>
                                        <PreviewRadioButton
                                            isSelected={
                                                state.launcher.type ===
                                                GorgiasChatLauncherType.ICON
                                            }
                                            label="Icon"
                                            preview={
                                                <div
                                                    className={
                                                        css.launcherPreview
                                                    }
                                                >
                                                    <ChatLauncher
                                                        type={
                                                            GorgiasChatLauncherType.ICON
                                                        }
                                                        backgroundColor={
                                                            mainColor
                                                        }
                                                        windowState="closed"
                                                    />
                                                </div>
                                            }
                                            value={GorgiasChatLauncherType.ICON}
                                            onClick={() => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    launcher: {
                                                        ...prevState.launcher,
                                                        type: GorgiasChatLauncherType.ICON,
                                                    },
                                                }))
                                                setIsChatOpenInPreview(false)
                                            }}
                                        />

                                        <PreviewRadioButton
                                            isSelected={
                                                state.launcher.type ===
                                                GorgiasChatLauncherType.ICON_AND_LABEL
                                            }
                                            label="Icon and label"
                                            preview={
                                                <div
                                                    className={
                                                        css.launcherPreview
                                                    }
                                                >
                                                    <ChatLauncher
                                                        type={
                                                            GorgiasChatLauncherType.ICON_AND_LABEL
                                                        }
                                                        backgroundColor={
                                                            mainColor
                                                        }
                                                        label={launcherLabel}
                                                        windowState="closed"
                                                    />
                                                </div>
                                            }
                                            value={
                                                GorgiasChatLauncherType.ICON_AND_LABEL
                                            }
                                            onClick={() => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    launcher: {
                                                        type: GorgiasChatLauncherType.ICON_AND_LABEL,
                                                        label: launcherLabel,
                                                    },
                                                }))
                                                setIsChatOpenInPreview(false)
                                            }}
                                        />
                                    </div>
                                    {state.launcher.type ===
                                        GorgiasChatLauncherType.ICON_AND_LABEL && (
                                        <div
                                            className={css.launcherSettingsGrid}
                                        >
                                            <InputField
                                                className={classNames(
                                                    css.formGroup,
                                                    css.launcherLabelInput
                                                )}
                                                type="text"
                                                label="Label"
                                                value={state.launcher.label}
                                                onFocus={() => {
                                                    setIsChatOpenInPreview(
                                                        false
                                                    )
                                                }}
                                                onChange={(value: string) => {
                                                    setState((prevState) => ({
                                                        ...prevState,
                                                        launcher: {
                                                            type: GorgiasChatLauncherType.ICON_AND_LABEL,
                                                            label: value,
                                                        },
                                                    }))
                                                    setIsChatOpenInPreview(
                                                        false
                                                    )
                                                }}
                                                isRequired
                                                maxLength={20}
                                                caption={`${
                                                    state.launcher.label
                                                        ?.length || 0
                                                }/20 characters`}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={css.launcherSettingsGrid}>
                                <DEPRECATED_InputField
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
                                    label="Widget position on page"
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
                                </DEPRECATED_InputField>
                                <div className={css.positionInputsWrapper}>
                                    <div>
                                        <ReactStrapLabel className={css.bold}>
                                            Move left / right
                                            <span id="move-widget-left-right">
                                                <i
                                                    className={classNames(
                                                        'material-icons-outlined',
                                                        css.tooltipIcon
                                                    )}
                                                >
                                                    info
                                                </i>
                                                <Tooltip
                                                    style={{
                                                        textAlign: 'left',
                                                    }}
                                                    target="move-widget-left-right"
                                                >
                                                    Move the chat left or right
                                                    to avoid overlap with other
                                                    widgets you might have. By
                                                    default, the chat icon is
                                                    displayed at 20px from the
                                                    left/right edges and and
                                                    20px from the top/bottom
                                                    edges.
                                                </Tooltip>
                                            </span>
                                        </ReactStrapLabel>
                                        <NumberInput
                                            value={position.offsetX}
                                            onChange={(offsetX) => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    position: {
                                                        ...position,
                                                        offsetX: offsetX || 0,
                                                    },
                                                }))
                                            }}
                                            min={-20}
                                            max={200}
                                            suffix="px"
                                            onFocus={() => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    editedPositionAxis:
                                                        PositionAxis.AXIS_X,
                                                }))
                                                setIsChatOpenInPreview(false)
                                            }}
                                            onBlur={() => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    editedPositionAxis: null,
                                                }))
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <ReactStrapLabel className={css.bold}>
                                            Move up / down
                                            <span id="move-widget-up-down">
                                                <i
                                                    className={classNames(
                                                        'material-icons-outlined',
                                                        css.tooltipIcon
                                                    )}
                                                >
                                                    info
                                                </i>
                                                <Tooltip
                                                    style={{
                                                        textAlign: 'left',
                                                    }}
                                                    target="move-widget-up-down"
                                                >
                                                    Move the chat up or down to
                                                    avoid overlap with other
                                                    widgets you might have. By
                                                    default, the chat icon is
                                                    displayed at 20px from the
                                                    left/right edges and and
                                                    20px from the top/bottom
                                                    edges.
                                                </Tooltip>
                                            </span>
                                        </ReactStrapLabel>
                                        <NumberInput
                                            value={position.offsetY}
                                            onChange={(offsetY) => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    position: {
                                                        ...position,
                                                        offsetY: offsetY || 0,
                                                    },
                                                }))
                                            }}
                                            min={-20}
                                            max={200}
                                            suffix="px"
                                            onFocus={() => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    editedPositionAxis:
                                                        PositionAxis.AXIS_Y,
                                                }))
                                                setIsChatOpenInPreview(false)
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
                            </div>
                        </div>
                        <div>
                            <Button
                                type="submit"
                                isDisabled={!isUpdate && !canSubmit}
                                isLoading={isSubmitting}
                            >
                                {isUpdate ? 'Save changes' : 'Add new chat'}
                            </Button>
                            {!isUpdate && (
                                <Button
                                    intent="secondary"
                                    onClick={() => {
                                        history.push(
                                            '/app/settings/channels/gorgias_chat'
                                        )
                                    }}
                                    className={css.cancelButton}
                                >
                                    Cancel
                                </Button>
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
        storeIntegrations:
            integrationSelectors.DEPRECATED_getIntegrationsByTypes([
                IntegrationType.Shopify,
                IntegrationType.BigCommerce,
                IntegrationType.Magento2,
            ])(state),
        shopifyIntegrations:
            integrationSelectors.DEPRECATED_getIntegrationsByTypes(
                IntegrationType.Shopify
            )(state),
        gorgiasChatIntegrations:
            integrationSelectors.DEPRECATED_getIntegrationsByTypes(
                IntegrationType.GorgiasChat
            )(state),
    }
}
const connector = connect(mapStateToProps)

export default connector(GorgiasChatIntegrationAppearanceComponent)
