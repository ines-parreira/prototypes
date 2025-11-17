import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { produce } from 'immer'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { Badge, BadgeIcon, LegacyButton as Button } from '@gorgias/axiom'

import { TicketChannel, TicketMessageSourceType } from 'business/types/ticket'
import {
    getPrimaryLanguageFromChatConfig,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import { useFlag } from 'core/flags'
import { useConvertGeneralSettings } from 'domains/reporting/pages/convert/hooks/useConvertGeneralSettings'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { GorgiasChatIntegration } from 'models/integration/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import CampaignPreview from 'pages/convert/campaigns/components/CampaignPreview'
import { findContactCaptureForm } from 'pages/convert/campaigns/components/ContactCaptureForm/utils'
import { ProductRecommendationBanner } from 'pages/convert/campaigns/components/ProductRecommendationBanner/ProductRecommendationBanner'
import { useChatPreviewProps } from 'pages/convert/campaigns/hooks/useChatPreviewProps'
import { useCreateCampaign } from 'pages/convert/campaigns/hooks/useCreateCampaign'
import { useGetPreviewProducts } from 'pages/convert/campaigns/hooks/useGetPreviewProducts'
import { useManageTriggers } from 'pages/convert/campaigns/hooks/useManageTriggers'
import { useUpdateCampaign } from 'pages/convert/campaigns/hooks/useUpdateCampaign'
import { useUtm } from 'pages/convert/campaigns/hooks/useUtm'
import type { CampaignDetailsFormApi } from 'pages/convert/campaigns/providers/CampaignDetailsForm/context'
import { CampaignDetailsFormProvider } from 'pages/convert/campaigns/providers/CampaignDetailsForm/context'
import type { CampaignTemplate } from 'pages/convert/campaigns/templates/types'
import type { Campaign } from 'pages/convert/campaigns/types/Campaign'
import type {
    CampaignContactFormAttachment,
    CampaignFormExtra,
    CampaignProductRecommendation,
} from 'pages/convert/campaigns/types/CampaignAttachment'
import type { CampaignDiscountOffer } from 'pages/convert/campaigns/types/CampaignDiscountOffer'
import type { WizardConfiguration } from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import type { CampaignProduct } from 'pages/convert/campaigns/types/CampaignProduct'
import { createCampaignPayload } from 'pages/convert/campaigns/utils/createCampaignPayload'
import { transformAttachmentsToContactCaptureForms } from 'pages/convert/campaigns/utils/transformAttachmentsToContactCaptureForms'
import { transformAttachmentsToDiscountOffers } from 'pages/convert/campaigns/utils/transformAttachmentsToDiscountOffers'
import { transformAttachmentsToProductRecommendations } from 'pages/convert/campaigns/utils/transformAttachmentsToProductRecommendations'
import { transformAttachmentToProduct } from 'pages/convert/campaigns/utils/transformAttachmentToProduct'
import { transformCampaignAttachmentsToDetails } from 'pages/convert/campaigns/utils/transformCampaignAttachmentsToDetails'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import SimpleCampaignEditor from 'pages/convert/onboarding/components/SimpleCampaignEditor/SimpleCampaignEditor'
import { getIntegrationById } from 'state/integrations/selectors'
import { setNewMessageForChatCampaign } from 'state/newMessage/actions'
import { getNewMessageAttachments } from 'state/newMessage/selectors'
import { toJS } from 'utils'
import { sanitizeHtmlDefault } from 'utils/html'

import css from './ConvertSimplifiedEditorModal.less'

type Props = {
    isOpen: boolean
    template: CampaignTemplate
    campaign: Campaign | undefined
    integration: Map<any, any>
    estimatedRevenue: any
    onClose: () => void
}

const ConvertSimplifiedEditorModal: React.FC<Props> = (props) => {
    const {
        isOpen,
        onClose,
        template,
        estimatedRevenue,
        integration,
        campaign: existingCampaign,
    } = props

    const gorgiasChatIntegration = integration.toJS() as GorgiasChatIntegration

    const [campaign, setCampaign] = useState<Campaign>()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const dispatch = useAppDispatch()
    const isConvertSubscriber = useIsConvertSubscriber()
    const chatPreviewProps = useChatPreviewProps(integration)
    const storeIntegration = useAppSelector(
        getIntegrationById(integration.getIn(['meta', 'shop_integration_id'])),
    )
    const attachments = useAppSelector(getNewMessageAttachments)
    const { channelConnection } = useGetOrCreateChannelConnection(
        gorgiasChatIntegration,
    )
    const { mutateAsync: createCampaign } = useCreateCampaign()
    const { mutateAsync: updateCampaign } = useUpdateCampaign()

    const defaultLanguage = useMemo<string>(() => {
        return getPrimaryLanguageFromChatConfig(gorgiasChatIntegration.meta)
    }, [gorgiasChatIntegration])

    const loadAttachments = (campaign: Campaign) => {
        let attachments: any[] = []

        if (
            Array.isArray(campaign.attachments) &&
            campaign.attachments.length > 0
        ) {
            attachments = transformCampaignAttachmentsToDetails(
                campaign.attachments,
            )
        }

        void dispatch(
            setNewMessageForChatCampaign({
                channel: TicketChannel.Chat,
                sourceType: TicketMessageSourceType.Chat,
                attachments: fromJS(attachments),
            }),
        )
    }

    useEffect(() => {
        // After opening the modal, build campaigns. This will solve issue with reusing trigger IDs
        if (!isOpen) {
            return
        }

        if (existingCampaign) {
            setCampaign(existingCampaign)
            loadAttachments(existingCampaign)
            return
        }

        template
            .getConfiguration(storeIntegration, integration)
            .then((draftCampaign) => {
                draftCampaign.language = defaultLanguage

                setCampaign(draftCampaign as Campaign)
                loadAttachments(draftCampaign as Campaign)
            })
            .catch((e) => {
                console.error(e)
            })

        return () => {
            dispatch(setNewMessageForChatCampaign({}))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    const wizardConfiguration: WizardConfiguration = useMemo(() => {
        if (template && template?.getWizardConfiguration) {
            return template.getWizardConfiguration()
        }
        return {} as WizardConfiguration
    }, [template])

    const shopifyProducts = useMemo<CampaignProduct[]>(() => {
        return transformAttachmentToProduct(attachments, {
            currency: storeIntegration.getIn(['meta', 'currency']),
        })
    }, [attachments, storeIntegration])

    const discountOffers = useMemo<CampaignDiscountOffer[]>(() => {
        return transformAttachmentsToDiscountOffers(attachments)
    }, [attachments])

    const productRecommendations = useMemo<
        CampaignProductRecommendation[]
    >(() => {
        return transformAttachmentsToProductRecommendations(attachments)
    }, [attachments])

    const contactForm = useMemo<CampaignContactFormAttachment[]>(
        () => transformAttachmentsToContactCaptureForms(attachments),
        [attachments],
    )

    const productRecommendationScenario = useMemo(() => {
        return productRecommendations.length > 0
            ? productRecommendations[0].extra.scenario
            : null
    }, [productRecommendations])

    const productsToPreview = useGetPreviewProducts(
        storeIntegration,
        productRecommendations,
        shopifyProducts,
    )

    const contactCaptureForm = useMemo<CampaignFormExtra | undefined>(() => {
        return findContactCaptureForm(attachments)
    }, [attachments])

    const chatMultiLanguagesEnabled = useFlag(FeatureFlagKey.ChatMultiLanguages)

    const updateCampaignData = useCallback((data: Campaign) => {
        setCampaign(data)
    }, [])

    const utmProps = useUtm(channelConnection, campaign?.name || '')
    const { appliedUtmEnabled, appliedUtmQueryString } = utmProps

    const { emailDisclaimer: emailDisclaimerSettings } =
        useConvertGeneralSettings(gorgiasChatIntegration)

    const onSubmit = async (activate = false) => {
        if (!campaign || !channelConnection) {
            return
        }

        setIsLoading(true)

        const payload = createCampaignPayload({
            campaignData: campaign,
            triggers: campaign.triggers,
            isConvertSubscriber: isConvertSubscriber,
            chatMultiLanguagesEnabled: chatMultiLanguagesEnabled,
            shopifyIntegration: integration,
            shopifyProducts: shopifyProducts,
            discountOffers: discountOffers,
            productRecommendations: productRecommendations,
            contactForm: contactForm,
            isActive: activate,
            canChangeStatus: !campaign?.id,
            utmEnabled: appliedUtmEnabled,
            utmQueryString: appliedUtmQueryString,
        })

        try {
            if (!campaign?.id) {
                await createCampaign([
                    undefined,
                    {
                        ...toJS(payload),
                        channel_connection_id: channelConnection.id,
                    },
                ])
            } else {
                await updateCampaign([
                    undefined,
                    {
                        campaign_id: campaign.id,
                        channelConnectionId: channelConnection.id,
                    },
                    toJS(payload),
                ])
            }
        } finally {
            setIsLoading(false)
        }

        onClose()
    }

    const { triggers } = useManageTriggers(campaign?.triggers)

    const handleUpdateCampaign = useCallback(
        (key: string, payload: any) => {
            if (key === 'copySuggestion') {
                setCampaign((campaign) =>
                    produce(campaign, (draft: Campaign) => {
                        if (draft.meta) {
                            draft.meta.copySuggestion = payload
                        } else {
                            draft.meta = {
                                delay: 0,
                                copySuggestion: payload,
                            }
                        }
                    }),
                )
            }
        },
        [setCampaign],
    )

    const campaignDetailContext = useMemo<CampaignDetailsFormApi>(() => {
        return {
            campaign: campaign || existingCampaign || ({} as Campaign),
            triggers,
            updateCampaign: handleUpdateCampaign,
            addTrigger: () => null,
            updateTrigger: () => null,
            deleteTrigger: () => null,
        }
    }, [triggers, campaign, existingCampaign, handleUpdateCampaign])

    if (!campaign) {
        return null
    }

    return (
        <CampaignDetailsFormProvider value={campaignDetailContext}>
            <Modal isOpen={isOpen} onClose={close} size="huge">
                <ModalBody className={css.modalBody}>
                    <div className={css.modalContainer}>
                        <div className={css.leftSide}>
                            <div className={css.labelContainer}>
                                <Badge
                                    type={'light-warning'}
                                    corner="square"
                                    upperCase={false}
                                >
                                    {template.label}
                                </Badge>
                                <Badge
                                    className={css.estimationLabel}
                                    type={'light-success'}
                                    corner="square"
                                    upperCase={false}
                                >
                                    <BadgeIcon
                                        icon={
                                            <i className="material-icons">
                                                monetization_on
                                            </i>
                                        }
                                    />

                                    {`Generates ${estimatedRevenue} on average`}
                                </Badge>
                            </div>

                            <h2 className={css.templateTitle}>
                                {template.name}
                            </h2>
                            <div>{template.description}</div>

                            <div className={css.editor}>
                                <SimpleCampaignEditor
                                    campaign={campaign}
                                    onCampaignUpdate={updateCampaignData}
                                    isConvertSubscriber={isConvertSubscriber}
                                    integration={integration}
                                    shopifyIntegration={storeIntegration}
                                    wizardConfiguration={wizardConfiguration}
                                    utmConfiguration={utmProps}
                                />
                            </div>

                            <div className={css.section}>
                                <div className={css.disclaimer}>
                                    <span>
                                        You can further customize this campaign
                                        after finishing the setup.
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={css.rightSide}>
                            {campaign && (
                                <>
                                    {!!productRecommendations.length && (
                                        <ProductRecommendationBanner
                                            scenario={
                                                productRecommendationScenario
                                            }
                                            className={css.recommendationBanner}
                                        />
                                    )}
                                    <CampaignPreview
                                        {...chatPreviewProps}
                                        translatedTexts={
                                            campaign.language
                                                ? GORGIAS_CHAT_WIDGET_TEXTS[
                                                      campaign.language
                                                  ]
                                                : chatPreviewProps.translatedTexts
                                        }
                                        className={css.campaignPreview}
                                        products={productsToPreview}
                                        discountOffers={discountOffers}
                                        contactCaptureForm={contactCaptureForm}
                                        html={sanitizeHtmlDefault(
                                            campaign.message_html || '',
                                        )}
                                        authorName={
                                            campaign.meta?.agentName ?? ``
                                        }
                                        authorAvatarUrl={
                                            campaign.meta?.agentAvatarUrl ?? ''
                                        }
                                        chatTitle={integration.get('name')}
                                        mainFontFamily={
                                            chatPreviewProps.mainFontFamily ??
                                            GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT
                                        }
                                        shouldHideReplyInput={
                                            !!campaign.meta?.noReply
                                        }
                                        onCampaignContentChange={() => {}}
                                        emailDisclaimerSettings={
                                            emailDisclaimerSettings
                                        }
                                        defaultLanguage={defaultLanguage}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <div className={css.footer}>
                        <Button
                            onClick={onClose}
                            intent="secondary"
                            className={css.forceLeft}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => onSubmit()}
                            className={css.marginRight}
                            isLoading={isLoading}
                            fillStyle="ghost"
                            intent="primary"
                        >
                            Save
                        </Button>
                        <Button
                            onClick={() => onSubmit(true)}
                            isLoading={isLoading}
                        >
                            Save & Publish
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </CampaignDetailsFormProvider>
    )
}

export default ConvertSimplifiedEditorModal
