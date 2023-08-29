import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Map, fromJS} from 'immutable'
import {produce} from 'immer'
import {EditorState} from 'draft-js'

import _trim from 'lodash/trim'
import _isEmpty from 'lodash/isEmpty'

import history from 'pages/history'
import {convertToHTML} from 'utils/editor'
import {sanitizeHtmlDefault} from 'utils/html'

import {User} from 'config/types/user'
import {GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT} from 'config/integrations/gorgias_chat'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatAvatarSettings,
} from 'models/integration/types'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'

import {getNewMessageAttachments} from 'state/newMessage/selectors'
import {
    deleteAttachment,
    setNewMessageForChatCampaign,
} from 'state/newMessage/actions'

import Accordion from 'pages/common/components/accordion/Accordion'
import {useIsRevenueBetaTester} from 'pages/common/hooks/useIsRevenueBetaTester'

import {transformAttachmentToProduct} from '../../utils/transformAttachmentToProduct'
import {replaceUrlsWithUtmUrl} from '../../utils/attachUtmParams'
import {transformProductToAttachment} from '../../utils/transformProductToAttachment'

import {usePristineSteps} from '../../hooks/usePristineSteps'
import {useManageTriggers} from '../../hooks/useManageTriggers'
import {useChatPreviewProps} from '../../hooks/useChatPreviewProps'

import {IntegrationProvider} from '../../containers/IntegrationProvider'
import {CampaignBasicStep} from '../../containers/CampaignBasicStep'
import {CampaignAudienceStep} from '../../containers/CampaignAudienceStep'
import {CampaignMessageStep} from '../../containers/CampaignMessageStep'

import {CampaignDetailsHeader} from '../../components/CampaignDetailsHeader'
import CampaignPreview from '../../components/CampaignPreview'
import {CampaignFooter} from '../../components/CampaignFooter'

import {ChatCampaign} from '../../types/Campaign'
import {CampaignAuthor} from '../../types/CampaignAgent'
import {CampaignStepsKeys} from '../../types/CampaignSteps'
import {CampaignProduct} from '../../types/CampaignProduct'

import {CampaignDetailsFormApi, CampaignDetailsFormContext} from './context'

import css from './style.less'

type Props = {
    agents: User[]
    campaign: ChatCampaign
    isEditMode?: boolean
    isShopifyStore?: boolean
    integration: Map<any, any>
    shopifyIntegration: Map<any, any>
    createCampaign: (form: any, integration: Map<any, any>) => Promise<unknown>
    updateCampaign: (form: any, integration: Map<any, any>) => Promise<unknown>
    deleteCampaign: (form: any, integration: Map<any, any>) => Promise<unknown>
}

export const CampaignDetailsForm = ({
    agents = [],
    campaign,
    isEditMode = false,
    isShopifyStore = false,
    integration,
    shopifyIntegration,
    createCampaign,
    updateCampaign,
    deleteCampaign,
}: Props) => {
    const dispatch = useAppDispatch()

    const isRevenueBetaTester = useIsRevenueBetaTester()
    const {pristine, onChangePristine} = usePristineSteps()
    const chatPreviewProps = useChatPreviewProps(integration)

    const attachments = useAppSelector(getNewMessageAttachments)

    const [showContentWarning, setShowContentWarning] = useState<boolean>(false)
    const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false)
    const [campaignData, setCampaignData] = useState<ChatCampaign>({
        id: campaign?.id,
        name: campaign.name ?? 'Untitled campaign',
        message: {
            html: campaign?.message?.html ?? '',
            text: campaign?.message?.text ?? '',
        },
        triggers: campaign?.triggers ?? [],
        created_datetime:
            campaign?.created_datetime ?? new Date().toISOString(),
    })
    const {triggers, addTrigger, updateTrigger, deleteTrigger} =
        useManageTriggers(campaign.triggers)

    useEffect(() => {
        if (isActionInProgress) {
            return
        }

        if (!_isEmpty(campaign)) {
            setCampaignData(campaign)

            if (
                Array.isArray(campaign.attachments) &&
                campaign.attachments.length > 0
            ) {
                const attachments = campaign.attachments.map((attachment) => {
                    return {
                        content_type: attachment.contentType,
                        name: attachment.name,
                        size: attachment.size,
                        url: attachment.url,
                        extra: {
                            product_id: attachment.extra.product_id,
                            product_link: attachment.extra.product_link,
                            price: attachment.extra.price,
                            featured_image: attachment.url,
                            variant_name: attachment.extra?.variant_name,
                            position: attachment.extra?.position,
                        },
                    }
                })

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
    }, [campaign, dispatch, isActionInProgress])

    const shopifyProducts = useMemo<CampaignProduct[]>(() => {
        return transformAttachmentToProduct(attachments, {
            currency: shopifyIntegration.getIn(['meta', 'currency']),
        })
    }, [attachments, shopifyIntegration])

    const handleUpdateCampaign = useCallback(
        (key: string, payload: any) => {
            if (key === 'name') {
                setCampaignData(
                    produce((draft) => {
                        draft.name = payload
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
                                email: agent.email,
                                name: agent.name,
                            }

                            if (agent.meta && agent.meta?.profile_picture_url) {
                                payload['avatar_url'] = agent.meta
                                    .profile_picture_url as unknown as string
                            }

                            draft.message.author = payload
                        } else {
                            draft.message.author = undefined
                        }
                    })
                )
            }

            if (key === 'message') {
                const content = (payload as EditorState).getCurrentContent()
                const lastChange = (payload as EditorState).getLastChangeType()

                /**
                 *      `handleChangeMessage` is called when the component
                 *  is initialized so we need to check if there were any
                 *  actions performed on the editor.
                 */
                if (lastChange === undefined) {
                    return
                }

                setCampaignData(
                    produce((draft) => {
                        draft.message.text = content.getPlainText()
                        draft.message.html = convertToHTML(content)
                    })
                )
            }
        },
        [agents]
    )

    const handleSaveCampaign = async () => {
        setIsActionInProgress(true)

        try {
            const payload: ChatCampaign = produce(campaignData, (draft) => {
                const trimmedCampaignName = _trim(draft.name)

                draft.name = trimmedCampaignName
                draft.message.html = replaceUrlsWithUtmUrl(
                    campaignData.message.html,
                    trimmedCampaignName
                )
                draft.triggers = Object.values(triggers)

                if (shopifyProducts.length > 0) {
                    draft.attachments = shopifyProducts.map((product) => {
                        return transformProductToAttachment(product, {
                            campaignName: trimmedCampaignName,
                            currency: shopifyIntegration.getIn([
                                'meta',
                                'currency',
                            ]),
                        })
                    })
                } else {
                    draft.attachments = []
                }
            })

            if (isEditMode) {
                await updateCampaign(fromJS(payload), integration)
            } else {
                await createCampaign(fromJS(payload), integration)
            }
        } finally {
            setIsActionInProgress(false)

            dispatch(
                setNewMessageForChatCampaign({
                    attachments: fromJS(attachments),
                })
            )
        }
    }

    const handleDeleteAttachment = (index: number) => {
        dispatch(deleteAttachment(index))
    }

    const handleDeleteCampaign = async () => {
        await deleteCampaign(fromJS(campaign), integration)

        history.push(
            `/app/settings/integrations/${integration.get('type') as string}/${
                integration.get('id') as string
            }/campaigns`
        )
    }

    const isStepValid = (step: CampaignStepsKeys) => {
        if (step === CampaignStepsKeys.Basics) {
            return !!_trim(campaignData.name)
        }

        if (step === CampaignStepsKeys.Audience) {
            return Object.keys(triggers).length > 0
        }

        if (step === CampaignStepsKeys.Message) {
            return campaignData.message.text !== ''
        }
    }

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

    const backUrl = `/app/settings/channels/${
        integration.get('type') as string
    }/${integration.get('id') as string}/campaigns${
        (history.location.state as Record<string, string>)?.previousSearch ?? ''
    }`

    const context = useMemo<CampaignDetailsFormApi>(() => {
        return {
            campaign: campaignData,
            isEditMode,
            triggers,
            updateCampaign: handleUpdateCampaign,
            addTrigger,
            updateTrigger,
            deleteTrigger,
        }
    }, [
        addTrigger,
        campaignData,
        deleteTrigger,
        handleUpdateCampaign,
        isEditMode,
        triggers,
        updateTrigger,
    ])

    return (
        <IntegrationProvider
            chatIntegration={integration}
            shopifyIntegration={shopifyIntegration}
        >
            <CampaignDetailsFormContext.Provider value={context}>
                <div
                    className={css.pageContainer}
                    data-testid="improved-campaign-details-page"
                >
                    <div className={css.formWrapper}>
                        <CampaignDetailsHeader
                            backToHref={backUrl}
                            isUpdate={isEditMode}
                        />
                        <div className={css.formContainer}>
                            <Accordion
                                defaultExpandedItem={
                                    isEditMode
                                        ? CampaignStepsKeys.Audience
                                        : CampaignStepsKeys.Basics
                                }
                                onChange={onChangePristine}
                            >
                                <CampaignBasicStep
                                    count={1}
                                    isPristine={pristine.basics}
                                    isValid={isStepValid(
                                        CampaignStepsKeys.Basics
                                    )}
                                />
                                <CampaignAudienceStep
                                    count={2}
                                    isPristine={pristine.audience}
                                    isValid={isStepValid(
                                        CampaignStepsKeys.Audience
                                    )}
                                    isRevenueBetaTester={isRevenueBetaTester}
                                    isShopifyStore={isShopifyStore}
                                />
                                <CampaignMessageStep
                                    agents={agents}
                                    attachments={attachments}
                                    count={3}
                                    isPristine={pristine.message}
                                    isValid={isStepValid(
                                        CampaignStepsKeys.Message
                                    )}
                                    isRevenueBetaTester={isRevenueBetaTester}
                                    showContentWarning={showContentWarning}
                                    onDeleteAttachment={handleDeleteAttachment}
                                />
                            </Accordion>
                            <div className="mt-4">
                                <CampaignFooter
                                    isActionInProgress={isActionInProgress}
                                    isCampaignValid={
                                        isStepValid(CampaignStepsKeys.Basics) &&
                                        isStepValid(
                                            CampaignStepsKeys.Audience
                                        ) &&
                                        isStepValid(CampaignStepsKeys.Message)
                                    }
                                    isUpdate={isEditMode}
                                    onSave={handleSaveCampaign}
                                    onDelete={handleDeleteCampaign}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <CampaignPreview
                            {...chatPreviewProps}
                            className={css.campaignPreview}
                            products={shopifyProducts}
                            html={sanitizeHtmlDefault(
                                campaignData.message.html
                            )}
                            authorName={campaignData.message.author?.name ?? ``}
                            authorAvatarUrl={
                                campaignData.message.author?.avatar_url ?? ''
                            }
                            avatar={avatar}
                            chatTitle={integration.get('name')}
                            mainFontFamily={
                                chatPreviewProps.mainFontFamily ??
                                GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT
                            }
                            shouldHideReplyInput={campaignData.meta?.noReply}
                            onCampaignContentChange={setShowContentWarning}
                        />
                    </div>
                </div>
            </CampaignDetailsFormContext.Provider>
        </IntegrationProvider>
    )
}
