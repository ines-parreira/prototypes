import React, {useEffect, useState, useMemo} from 'react'
import {Map, fromJS} from 'immutable'

import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationById} from 'state/integrations/selectors'
import {toJS} from 'utils'

import Tag from 'pages/common/components/Tag/Tag'
import {CampaignTemplate} from 'pages/convert/campaigns/templates/types'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {getNewMessageAttachments} from 'state/newMessage/selectors'
import useAppDispatch from 'hooks/useAppDispatch'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'

import {
    getPrimaryLanguageFromChatConfig,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'

import {createCampaignPayload} from 'pages/convert/campaigns/utils/createCampaignPayload'

import {sanitizeHtmlDefault} from 'utils/html'
import {CampaignDiscountOffer} from 'pages/convert/campaigns/types/CampaignDiscountOffer'
import {setNewMessageForChatCampaign} from 'state/newMessage/actions'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {CampaignProduct} from 'pages/convert/campaigns/types/CampaignProduct'
import CampaignPreview from 'pages/convert/campaigns/components/CampaignPreview'
import {useChatPreviewProps} from 'pages/convert/campaigns/hooks/useChatPreviewProps'
import SimpleCampaignEditor from 'pages/convert/onboarding/components/SimpleCampaignEditor/SimpleCampaignEditor'
import {transformAttachmentToProduct} from 'pages/convert/campaigns/utils/transformAttachmentToProduct'
import {transformAttachmentsToDiscountOffers} from 'pages/convert/campaigns/utils/transformAttachmentsToDiscountOffers'
import {transformCampaignAttachmentsToDetails} from 'pages/convert/campaigns/utils/transformCampaignAttachmentsToDetails'
import {useCreateCampaign} from 'pages/convert/campaigns/hooks/useCreateCampaign'

import {useUpdateCampaign} from 'pages/convert/campaigns/hooks/useUpdateCampaign'

import {WizardConfiguration} from 'pages/convert/campaigns/types/CampaignFormConfiguration'

import {GorgiasChatIntegration} from 'models/integration/types'
import {CampaignProductRecommendation} from 'pages/convert/campaigns/types/CampaignAttachment'
import {transformAttachmentsToProductRecommendations} from 'pages/convert/campaigns/utils/transformAttachmentsToProductRecommendations'
import {useGetPreviewProducts} from 'pages/convert/campaigns/hooks/useGetPreviewProducts'
import {ProductRecommendationBanner} from 'pages/convert/campaigns/components/ProductRecommendationBanner/ProductRecommendationBanner'

import {useUtm} from 'pages/convert/campaigns/hooks/useUtm'
import useCanAddUtm from 'pages/convert/common/hooks/useUtmFlag'
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
        getIntegrationById(integration.getIn(['meta', 'shop_integration_id']))
    )
    const attachments = useAppSelector(getNewMessageAttachments)
    const {channelConnection} = useGetOrCreateChannelConnection(
        gorgiasChatIntegration
    )
    const {mutateAsync: createCampaign} = useCreateCampaign()
    const {mutateAsync: updateCampaign} = useUpdateCampaign()

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
                campaign.attachments
            )
        }

        void dispatch(
            setNewMessageForChatCampaign({
                channel: TicketChannel.Chat,
                sourceType: TicketMessageSourceType.Chat,
                attachments: fromJS(attachments),
            })
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

    const productsToPreview = useGetPreviewProducts(
        storeIntegration,
        productRecommendations,
        shopifyProducts
    )

    const chatMultiLanguagesEnabled =
        useFlags()[FeatureFlagKey.ChatMultiLanguages]

    const updateCampaignData = (data: Campaign) => {
        setCampaign(data)
    }

    const utmProps = useUtm(channelConnection, campaign?.name || '')
    const {appliedUtmEnabled, appliedUtmQueryString} = utmProps
    const canAddUtm = useCanAddUtm(isConvertSubscriber)

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
            isActive: activate,
            isEditMode: !!campaign?.id,
            canAddUtm: canAddUtm,
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

    if (!campaign) {
        return null
    }

    return (
        <Modal isOpen={isOpen} onClose={close} size="huge">
            <ModalBody className={css.modalBody}>
                <div className={css.modalContainer}>
                    <div className={css.leftSide}>
                        <div className={css.labelContainer}>
                            <Tag color="orange" text={template.label} />
                            <Tag
                                className={css.estimationLabel}
                                color="green"
                                leadIcon={
                                    <i className="material-icons">
                                        monetization_on
                                    </i>
                                }
                                text={`Generates ${estimatedRevenue} on average`}
                            />
                        </div>

                        <h2 className={css.templateTitle}>{template.name}</h2>
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
                                    html={sanitizeHtmlDefault(
                                        campaign.message_html || ''
                                    )}
                                    authorName={campaign.meta?.agentName ?? ``}
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
    )
}

export default ConvertSimplifiedEditorModal
