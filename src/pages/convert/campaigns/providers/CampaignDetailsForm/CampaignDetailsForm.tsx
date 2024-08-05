import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Map, fromJS} from 'immutable'
import {produce} from 'immer'
import {EditorState} from 'draft-js'

import _trim from 'lodash/trim'
import _isEmpty from 'lodash/isEmpty'

import {useFlags} from 'launchdarkly-react-client-sdk'
import history from 'pages/history'
import {convertToHTML} from 'utils/editor'
import {sanitizeHtmlDefault} from 'utils/html'

import {User} from 'config/types/user'
import {
    getPrimaryLanguageFromChatConfig,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatAvatarSettings,
    GorgiasChatIntegration,
} from 'models/integration/types'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'

import {getNewMessageAttachments} from 'state/newMessage/selectors'
import {
    deleteAttachment,
    setNewMessageForChatCampaign,
} from 'state/newMessage/actions'

import Accordion from 'pages/common/components/accordion/Accordion'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

import {FeatureFlagKey} from 'config/featureFlags'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {WizardConfiguration} from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'

import {createCampaignPayload} from 'pages/convert/campaigns/utils/createCampaignPayload'

import {transformAttachmentToProduct} from '../../utils/transformAttachmentToProduct'

import {usePristineSteps} from '../../hooks/usePristineSteps'
import {useManageTriggers} from '../../hooks/useManageTriggers'
import {useChatPreviewProps} from '../../hooks/useChatPreviewProps'

import {IntegrationProvider} from '../../containers/IntegrationProvider'
import {CampaignBasicStep} from '../../containers/CampaignBasicStep'
import {CampaignAudienceStep} from '../../containers/CampaignAudienceStep'
import {CampaignMessageStep} from '../../containers/CampaignMessageStep'

import {HeaderReturnButton} from '../../../common/components/HeaderReturnButton'
import CampaignPreview from '../../components/CampaignPreview'
import {CampaignFooter} from '../../components/CampaignFooter'

import {Campaign} from '../../types/Campaign'
import {CampaignAuthor} from '../../types/CampaignAgent'
import {CampaignStepsKeys} from '../../types/CampaignSteps'
import {CampaignProduct} from '../../types/CampaignProduct'

import {CampaignStatus} from '../../types/enums/CampaignStatus.enum'

import {transformCampaignAttachmentsToDetails} from '../../utils/transformCampaignAttachmentsToDetails'
import {CampaignDiscountOffer} from '../../types/CampaignDiscountOffer'
import {transformAttachmentsToDiscountOffers} from '../../utils/transformAttachmentsToDiscountOffers'
import {CampaignDetailsFormApi, CampaignDetailsFormProvider} from './context'

import {
    CampaigFormConfigurationProvider,
    CampaignFormConfigurationType,
} from './configurationContext'

import css from './style.less'

export type Props = {
    agents: User[]
    campaign: Campaign
    wizardConfiguration?: WizardConfiguration
    isLoading: boolean
    isEditMode?: boolean
    isShopifyStore?: boolean
    isOverCampaignsLimit?: boolean
    isCreateDisabled?: boolean
    canCreateABVariants?: boolean
    integration: Map<any, any>
    shopifyIntegration: Map<any, any>
    createCampaign?: (form: any) => Promise<unknown>
    updateCampaign: (form: any) => Promise<unknown>
    duplicateCampaign?: (form: any) => Promise<unknown>
    deleteCampaign?: () => Promise<unknown>
    header?: React.ReactNode
    openedStep?: CampaignStepsKeys
    allowActivate?: boolean
    backUrl: string
}

export const CampaignDetailsForm = ({
    agents = [],
    campaign,
    wizardConfiguration,
    isLoading,
    isEditMode = false,
    isShopifyStore = false,
    isOverCampaignsLimit = false,
    isCreateDisabled = false,
    canCreateABVariants = false,
    integration,
    shopifyIntegration,
    createCampaign,
    updateCampaign,
    duplicateCampaign,
    deleteCampaign,
    header,
    backUrl,
    openedStep,
    allowActivate = true,
}: Props) => {
    const dispatch = useAppDispatch()

    const [formValidationState, setFormValidationState] = useState<
        Record<string, boolean>
    >({
        [CampaignStepsKeys.Audience]: false,
    })

    const defaultOpenedStep = useMemo(() => {
        // if initial step is predefinied, use it
        if (openedStep) {
            return openedStep
        }

        return isEditMode
            ? CampaignStepsKeys.Audience
            : wizardConfiguration && wizardConfiguration.defaultStepOpened
            ? wizardConfiguration.defaultStepOpened
            : CampaignStepsKeys.Basics
    }, [isEditMode, wizardConfiguration, openedStep])

    const isConvertSubscriber = useIsConvertSubscriber()
    const {pristine, onChangePristine} = usePristineSteps(defaultOpenedStep)
    const chatPreviewProps = useChatPreviewProps(integration)

    const attachments = useAppSelector(getNewMessageAttachments)

    const defaultLanguage = useMemo<string>(() => {
        return getPrimaryLanguageFromChatConfig(
            (integration.toJS() as GorgiasChatIntegration).meta
        )
    }, [integration])

    const [showContentWarning, setShowContentWarning] = useState<boolean>(false)
    const [actionInProgress, setActionInProgress] = useState<string>('')
    const [campaignData, setCampaignData] = useState<Campaign>({
        id: campaign?.id,
        name: campaign?.name ?? 'Untitled campaign',
        language: campaign?.language ?? defaultLanguage,
        message_html: campaign?.message_html ?? '',
        message_text: campaign?.message_text ?? '',
        meta: campaign?.meta as Record<string, any> | undefined,
        triggers: campaign?.triggers ?? [],
        trigger_rule: campaign?.trigger_rule ?? '',
        status: campaign?.status ?? CampaignStatus.Inactive,
        is_light: !!campaign?.is_light,
        created_datetime: campaign?.created_datetime ?? null,
        updated_datetime: campaign?.updated_datetime ?? null,
    })

    const [isFormLoading, setIsFormLoading] = useState<boolean>(true)
    useEffect(() => {
        // Make sure the form is loaded only when the campaign object is ready in context
        setIsFormLoading(
            isEditMode ? Boolean(isLoading && !campaignData.id) : isLoading
        )
    }, [campaignData, isEditMode, isLoading])

    const {triggers, addTrigger, updateTrigger, deleteTrigger} =
        useManageTriggers(campaign.triggers)

    const chatMultiLanguagesEnabled =
        useFlags()[FeatureFlagKey.ChatMultiLanguages]

    useEffect(() => {
        if (actionInProgress !== '') {
            return
        }

        if (!_isEmpty(campaign)) {
            setCampaignData(
                produce(campaign, (draft) => {
                    if (chatMultiLanguagesEnabled) {
                        draft.language = campaign.language ?? defaultLanguage
                    }
                })
            )

            if (
                Array.isArray(campaign.attachments) &&
                campaign.attachments.length > 0
            ) {
                const attachments = transformCampaignAttachmentsToDetails(
                    campaign.attachments
                )

                void dispatch(
                    setNewMessageForChatCampaign({
                        channel: TicketChannel.Chat,
                        sourceType: TicketMessageSourceType.Chat,
                        attachments: fromJS(attachments),
                    })
                )

                return
            }
        }

        dispatch(
            setNewMessageForChatCampaign({
                attachments: fromJS([]),
                channel: TicketChannel.Chat,
                sourceType: TicketMessageSourceType.Chat,
            })
        )

        return () => {
            dispatch(setNewMessageForChatCampaign({}))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaign, dispatch, actionInProgress])

    const shopifyProducts = useMemo<CampaignProduct[]>(() => {
        return transformAttachmentToProduct(attachments, {
            currency: shopifyIntegration.getIn(['meta', 'currency']),
        })
    }, [attachments, shopifyIntegration])

    const discountOffers = useMemo<CampaignDiscountOffer[]>(() => {
        return transformAttachmentsToDiscountOffers(attachments)
    }, [attachments])

    const handleUpdateCampaign = useCallback(
        (key: string, payload: any) => {
            if (key === 'name') {
                setCampaignData(
                    produce((draft) => {
                        draft.name = payload
                    })
                )
            }

            if (key === 'language') {
                setCampaignData(
                    produce((draft) => {
                        draft.language = payload
                    })
                )
            }

            if (key === 'delay') {
                setCampaignData(
                    produce((draft) => {
                        if (draft.meta) {
                            draft.meta.delay = payload
                        } else {
                            draft.meta = {
                                delay: payload,
                            }
                        }
                    })
                )
            }

            if (key === 'noReply') {
                setCampaignData(
                    produce((draft) => {
                        if (draft.meta) {
                            draft.meta.noReply = payload
                        } else {
                            draft.meta = {
                                delay: 0,
                                noReply: payload,
                            }
                        }
                    })
                )
            }

            if (key === 'agent') {
                const agent = agents.find((item) => item.email === payload)
                setCampaignData(
                    produce((draft) => {
                        if (agent) {
                            const payload: CampaignAuthor = {
                                agentEmail: agent.email,
                                agentName: agent.name,
                            }

                            if (agent.meta && agent.meta?.profile_picture_url) {
                                payload['agentAvatarUrl'] = agent.meta
                                    .profile_picture_url as unknown as string
                            }

                            draft.meta = draft.meta ?? {}
                            draft.meta = {
                                ...draft.meta,
                                ...payload,
                            }
                        } else if (draft.meta) {
                            delete draft.meta.agentEmail
                            delete draft.meta.agentName
                            delete draft.meta.agentAvatarUrl
                        }
                    })
                )
            }

            if (key === 'message') {
                const content = (payload as EditorState).getCurrentContent()

                setCampaignData(
                    produce((draft) => {
                        draft.message_text = content.getPlainText()
                        draft.message_html = convertToHTML(content)
                    })
                )
            }
        },
        [agents]
    )

    const handleSaveCampaign = async (activate = false) => {
        if (!isCampaignValid) return

        if (!isEditMode && !createCampaign) {
            console.error('Cannot create campaign!')
            return
        }

        setActionInProgress(isEditMode ? 'edit' : 'create')

        try {
            const payload = createCampaignPayload({
                campaignData: campaignData,
                triggers: Object.values(triggers),
                isConvertSubscriber: isConvertSubscriber,
                chatMultiLanguagesEnabled: chatMultiLanguagesEnabled,
                shopifyIntegration: integration,
                shopifyProducts: shopifyProducts,
                discountOffers: discountOffers,
                isEditMode: isEditMode,
                isActive: activate,
            })

            if (isEditMode) {
                await updateCampaign(fromJS(payload))
            } else {
                if (createCampaign !== undefined) {
                    await createCampaign(fromJS(payload))
                }
            }
        } finally {
            setActionInProgress('')

            dispatch(
                setNewMessageForChatCampaign({
                    attachments: fromJS(attachments),
                })
            )
        }
    }

    const handleDuplicateCampaign = async () => {
        if (duplicateCampaign === undefined) return

        setActionInProgress('duplicate')

        await duplicateCampaign(fromJS(campaign)).then(() =>
            setActionInProgress('')
        )
    }

    const handleDeleteAttachment = (index: number) => {
        dispatch(deleteAttachment(index))
    }

    const handleDeleteCampaign = async () => {
        if (deleteCampaign === undefined) return

        setActionInProgress('delete')
        await deleteCampaign().then(() => setActionInProgress(''))
    }

    const handleDiscardChanges = () => {
        history.push(backUrl)
    }

    const isStepValid = (step: CampaignStepsKeys) => {
        if (step === CampaignStepsKeys.Basics) {
            return !!_trim(campaignData.name)
        }

        if (step === CampaignStepsKeys.Audience) {
            return (
                Object.keys(triggers).length > 0 &&
                formValidationState[CampaignStepsKeys.Audience]
            )
        }

        if (step === CampaignStepsKeys.Message) {
            return campaignData.message_text !== ''
        }
    }

    const isStepDisabled = (step: CampaignStepsKeys): boolean => {
        if (!wizardConfiguration) {
            return false
        }
        return wizardConfiguration?.stepConfiguration
            ? wizardConfiguration?.stepConfiguration[step]?.isDisabled ?? false
            : false
    }

    const updateSetValidation = useCallback(
        (step: CampaignStepsKeys) => (value: boolean) => {
            setFormValidationState((prevState) => ({
                ...prevState,
                [step]: value,
            }))
        },
        [setFormValidationState]
    )

    const isCampaignValid =
        isStepValid(CampaignStepsKeys.Basics) &&
        isStepValid(CampaignStepsKeys.Audience) &&
        isStepValid(CampaignStepsKeys.Message)

    const avatar: GorgiasChatAvatarSettings = useMemo(
        () => ({
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
        }),
        [integration]
    )

    const campaignDetailContext = useMemo<CampaignDetailsFormApi>(() => {
        return {
            campaign: campaignData,
            triggers,
            updateCampaign: handleUpdateCampaign,
            addTrigger,
            updateTrigger,
            deleteTrigger,
        }
    }, [
        triggers,
        campaignData,
        addTrigger,
        deleteTrigger,
        updateTrigger,
        handleUpdateCampaign,
    ])

    const formConfiguration = useMemo(
        () =>
            ({
                isEditMode,
                configuration: wizardConfiguration,
            } as CampaignFormConfigurationType),
        [isEditMode, wizardConfiguration]
    )

    const isLightCampaign = campaign?.is_light
    const isLightCampaignBannerVisible = useMemo(() => {
        return isLightCampaign && isConvertSubscriber && isShopifyStore
    }, [isLightCampaign, isConvertSubscriber, isShopifyStore])

    return (
        <IntegrationProvider
            chatIntegration={integration}
            shopifyIntegration={shopifyIntegration}
        >
            <CampaigFormConfigurationProvider value={formConfiguration}>
                <CampaignDetailsFormProvider value={campaignDetailContext}>
                    {isLightCampaignBannerVisible && (
                        <BannerNotification
                            message={
                                "You are editing a light campaign. Light campaigns don't allow advanced triggers, and are not charged in your Convert plan."
                            }
                            actionHTML={
                                <a
                                    href="https://docs.gorgias.com/en-US/search/campaign?page=1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Learn More
                                </a>
                            }
                        />
                    )}
                    <div
                        className={css.pageContainer}
                        data-testid="improved-campaign-details-page"
                    >
                        <div className={css.formWrapper}>
                            {header ? (
                                header
                            ) : (
                                <HeaderReturnButton
                                    backToHref={backUrl}
                                    title="Back to Campaigns list"
                                />
                            )}
                            {!isFormLoading && (
                                <div className={css.formContainer}>
                                    <Accordion
                                        defaultExpandedItem={defaultOpenedStep}
                                        onChange={onChangePristine}
                                    >
                                        <CampaignBasicStep
                                            count={1}
                                            key={CampaignStepsKeys.Basics}
                                            isPristine={pristine.basics}
                                            isValid={isStepValid(
                                                CampaignStepsKeys.Basics
                                            )}
                                            isDisabled={isStepDisabled(
                                                CampaignStepsKeys.Basics
                                            )}
                                        />
                                        <CampaignAudienceStep
                                            count={2}
                                            key={CampaignStepsKeys.Audience}
                                            isPristine={pristine.audience}
                                            isValid={isStepValid(
                                                CampaignStepsKeys.Audience
                                            )}
                                            isDisabled={isStepDisabled(
                                                CampaignStepsKeys.Audience
                                            )}
                                            isConvertSubscriber={
                                                isConvertSubscriber
                                            }
                                            isShopifyStore={isShopifyStore}
                                            isLightCampaign={isLightCampaign}
                                            integration={integration}
                                            onValidationChange={updateSetValidation(
                                                CampaignStepsKeys.Audience
                                            )}
                                        />
                                        <CampaignMessageStep
                                            agents={agents}
                                            count={3}
                                            key={CampaignStepsKeys.Message}
                                            isPristine={pristine.message}
                                            isValid={isStepValid(
                                                CampaignStepsKeys.Message
                                            )}
                                            isDisabled={isStepDisabled(
                                                CampaignStepsKeys.Message
                                            )}
                                            isConvertSubscriber={
                                                isConvertSubscriber
                                            }
                                            showContentWarning={
                                                showContentWarning
                                            }
                                            onDeleteAttachment={
                                                handleDeleteAttachment
                                            }
                                        />
                                    </Accordion>
                                    <div className="mt-4">
                                        <CampaignFooter
                                            integrationId={integration.get(
                                                'id'
                                            )}
                                            isCampaignValid={isCampaignValid}
                                            isLightCampaign={isLightCampaign}
                                            isShopifyStore={isShopifyStore}
                                            isOverCampaignsLimit={
                                                isOverCampaignsLimit
                                            }
                                            canCreateABVariants={
                                                canCreateABVariants
                                            }
                                            isCreateDisabled={isCreateDisabled}
                                            isUpdate={isEditMode}
                                            onSave={handleSaveCampaign}
                                            onDiscard={handleDiscardChanges}
                                            onDelete={
                                                deleteCampaign
                                                    ? handleDeleteCampaign
                                                    : undefined
                                            }
                                            onDuplicate={
                                                duplicateCampaign
                                                    ? handleDuplicateCampaign
                                                    : undefined
                                            }
                                            allowActivate={allowActivate}
                                        />
                                    </div>
                                </div>
                            )}

                            {isFormLoading && (
                                <>
                                    <div className={css.loader}>
                                        <Skeleton height={70} />
                                    </div>
                                    <div className={css.loader}>
                                        <Skeleton height={300} />
                                    </div>
                                    <div className={css.loader}>
                                        <Skeleton height={70} />
                                    </div>
                                </>
                            )}
                        </div>
                        <div>
                            {!isFormLoading && (
                                <CampaignPreview
                                    {...chatPreviewProps}
                                    translatedTexts={
                                        campaignData.language
                                            ? GORGIAS_CHAT_WIDGET_TEXTS[
                                                  campaignData.language
                                              ]
                                            : chatPreviewProps.translatedTexts
                                    }
                                    className={css.campaignPreview}
                                    products={shopifyProducts}
                                    discountOffers={discountOffers}
                                    html={sanitizeHtmlDefault(
                                        campaignData.message_html || ''
                                    )}
                                    authorName={
                                        campaignData.meta?.agentName ?? ``
                                    }
                                    authorAvatarUrl={
                                        campaignData.meta?.agentAvatarUrl ?? ''
                                    }
                                    avatar={avatar}
                                    chatTitle={integration.get('name')}
                                    mainFontFamily={
                                        chatPreviewProps.mainFontFamily ??
                                        GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT
                                    }
                                    shouldHideReplyInput={
                                        !!campaignData.meta?.noReply
                                    }
                                    onCampaignContentChange={
                                        setShowContentWarning
                                    }
                                />
                            )}
                        </div>
                    </div>
                </CampaignDetailsFormProvider>
            </CampaigFormConfigurationProvider>
        </IntegrationProvider>
    )
}
