import React, {memo, useCallback, useEffect, useMemo, useState} from 'react'
import {fromJS, Map} from 'immutable'
import {produce} from 'immer'
import _uniqueId from 'lodash/uniqueId'
import {EditorState} from 'draft-js'
import trim from 'lodash/trim'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {convertToHTML} from 'utils/editor'
import {sanitizeHtmlDefault} from 'utils/html'
import {User} from 'config/types/user'
import history from 'pages/history'

import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatAvatarSettings,
} from 'models/integration/types'

import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'

import {
    deleteAttachment,
    setNewMessageForChatCampaign,
} from 'state/newMessage/actions'
import {getNewMessageAttachments} from 'state/newMessage/selectors'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import InputField from 'pages/common/forms/input/InputField'
import {Value} from 'pages/common/forms/SelectField/types'

import RichField from 'pages/common/forms/RichField/RichField'
import {GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT} from 'config/integrations/gorgias_chat'
import {createTrigger} from '../../utils/createTrigger'

import {useChatPreviewProps} from '../../hooks/useChatPreviewProps'

import GorgiasChatIntegrationPreviewContainer from '../../../GorgiasChatIntegrationPreviewContainer/GorgiasChatIntegrationPreviewContainer'

import {CampaignTriggerMap} from '../../types/CampaignTriggerMap'
import {CampaignTriggerKey} from '../../types/enums/CampaignTriggerKey.enum'
import {isDeviceTypeOperators} from '../../types/enums/DeviceTypeOperators.enum'
import {
    DeleteTriggerFn,
    UpdateTriggerFn,
} from '../../types/AdvancedTriggerBaseProps'
import {ChatCampaign} from '../../types/Campaign'
import {CampaignAuthor} from '../../types/CampaignAgent'
import {SingleCampaignInViewOperators} from '../../types/enums/SingleCampaignInViewOperators.enum'
import {CampaignProduct} from '../../types/CampaignProduct'

import {chatIsShopifyStore} from '../../utils/chatIsShopifyStore'
import {isAllowedToUpdateTrigger} from '../../utils/isAllowedToUpdateTrigger'

import CampaignPreview from '../../components/CampaignPreview'
import {CampaignMessage} from '../../components/CampaignMessage'
import {CampaignFooter} from '../../components/CampaignFooter'
import {AdvancedTriggersForm} from '../../components/AdvancedTriggersForm'
import {CampaignDetailsHeader} from '../../components/CampaignDetailsHeader'
import {AdvancedTriggersSelect} from '../../components/AdvancedTriggersSelect'
import {CampaignDisplaySettings} from '../../components/CampaignDisplaySettings'

import {replaceUrlsWithUtmUrl} from '../../utils/attachUtmParams'
import {transformProductToAttachment} from '../../utils/transformProductToAttachment'
import {transformAttachmentToProduct} from '../../utils/transformAttachmentToProduct'

import {IntegrationProvider} from '../IntegrationProvider'

import {TriggersProvider} from '../TriggersProvider'

import css from './AdvancedCampaignDetails.less'

type Props = {
    agents: User[]
    campaign: ChatCampaign
    id: string
    integration: Map<any, any>
    shopifyIntegration: Map<any, any>
    isRevenueBetaTester: boolean
    createCampaign: (form: any, integration: Map<any, any>) => Promise<unknown>
    updateCampaign: (form: any, integration: Map<any, any>) => Promise<unknown>
    deleteCampaign: (form: any, integration: Map<any, any>) => Promise<unknown>
}

export const AdvancedCampaignDetails = memo(
    ({
        agents,
        campaign,
        integration,
        id,
        isRevenueBetaTester = false,
        shopifyIntegration,
        createCampaign,
        updateCampaign,
        deleteCampaign,
    }: Props): JSX.Element => {
        const isUpdate = id !== 'new'
        const dispatch = useAppDispatch()

        const [showContentWarning, setShowContentWarning] =
            useState<boolean>(false)
        const [stateInitialized, setStateInitialized] = useState(false)
        const [isActionInProgress, setIsActionInProgress] =
            useState<boolean>(false)
        const [triggers, updateTriggers] = useState<CampaignTriggerMap>({})
        const [campaignName, setCampaignName] = useState<string>(
            campaign.name ?? ''
        )
        const [campaignDelay, setCampaignDelay] = useState<number>(0)
        const [campaignAgent, setCampaignAgent] = useState<CampaignAuthor>()
        const [campaignWithNoReply, setCampaignWithNoReply] = useState(false)
        const [campaignMessageHTML, setCampaignMessageHTML] =
            useState<string>('')
        const [campaignMessageText, setCampaignMessageText] =
            useState<string>('')
        const [richArea, setRichArea] = useState<RichField | null>(null)
        const chatPreviewProps = useChatPreviewProps(integration)
        const attachments = useAppSelector(getNewMessageAttachments)

        const shopifyProducts = useMemo<CampaignProduct[]>(() => {
            return transformAttachmentToProduct(attachments, {
                currency: shopifyIntegration.getIn(['meta', 'currency']),
            })
        }, [attachments, shopifyIntegration])

        // makes sure editor and preview are in sync on initial load of HTML
        useEffect(() => {
            if (richArea) richArea.focusEditor()
        }, [richArea])

        const handleAddTrigger = useCallback(
            (key: CampaignTriggerKey) => {
                const newKey = _uniqueId()
                const newTrigger = createTrigger(key)

                const isAllowedToEdit = isAllowedToUpdateTrigger(
                    newTrigger,
                    isRevenueBetaTester
                )

                if (!isAllowedToEdit) return

                updateTriggers(
                    produce(triggers, (draft) => {
                        draft[newKey] = newTrigger
                    })
                )
            },
            [isRevenueBetaTester, triggers, updateTriggers]
        )

        const handleUpdateTrigger = useCallback<UpdateTriggerFn>(
            (triggerId, payload) => {
                const currentTrigger = triggers[triggerId]
                const isAllowedToEdit = isAllowedToUpdateTrigger(
                    currentTrigger,
                    isRevenueBetaTester
                )

                if (!isAllowedToEdit) return

                updateTriggers(
                    produce(triggers, (draft) => {
                        if (draft[triggerId]) {
                            if (payload.operator) {
                                draft[triggerId].operator = payload.operator
                            }
                            if (payload.value) {
                                draft[triggerId].value = payload.value
                            }
                        }
                    })
                )
            },
            [isRevenueBetaTester, triggers, updateTriggers]
        )

        const handleDeleteTrigger = useCallback<DeleteTriggerFn>(
            (triggerId) => {
                const currentTrigger = triggers[triggerId]
                const isAllowedToEdit = isAllowedToUpdateTrigger(
                    currentTrigger,
                    isRevenueBetaTester
                )

                if (!isAllowedToEdit) return

                updateTriggers(
                    produce(triggers, (draft) => {
                        if (draft[triggerId]) {
                            delete draft[triggerId]
                        }
                    })
                )
            },
            [isRevenueBetaTester, triggers, updateTriggers]
        )

        const handleChangeMessage = useCallback(
            (value: EditorState) => {
                const content = value.getCurrentContent()

                // Nasty trick, but `handleChangeMessage` is called when the component is initialized
                if (convertToHTML(content) === '<div><br></div>') {
                    return
                }

                setCampaignMessageHTML(convertToHTML(content))
                setCampaignMessageText(content.getPlainText())
            },
            [setCampaignMessageHTML, setCampaignMessageText]
        )

        const handleChangeAgent = useCallback(
            (email: Value) => {
                const agent = agents.find((item) => item.email === email)

                if (agent) {
                    const payload: CampaignAuthor = {
                        email: agent.email,
                        name: agent.name,
                    }

                    if (agent.meta && agent.meta?.profile_picture_url) {
                        payload['avatar_url'] = agent.meta
                            .profile_picture_url as unknown as string
                    }

                    setCampaignAgent(payload)
                } else {
                    setCampaignAgent(undefined)
                }
            },
            [agents, setCampaignAgent]
        )

        const handleDeleteAttachment = (index: number) => {
            dispatch(deleteAttachment(index))
        }

        const handleToggleSingleCampaignInView = useCallback(
            (triggerId: string, value: boolean) => {
                if (value === true) {
                    const newKey = _uniqueId()
                    updateTriggers(
                        produce(triggers, (draft) => {
                            draft[newKey] = {
                                key: CampaignTriggerKey.SingleInView,
                                value: 'true',
                                operator: SingleCampaignInViewOperators.Equal,
                            }
                        })
                    )
                } else {
                    updateTriggers(
                        produce(triggers, (draft) => {
                            delete draft[triggerId]
                        })
                    )
                }
            },
            [triggers, updateTriggers]
        )

        const handleChangeDeviceType = useCallback(
            (triggerId: string, operator: string) => {
                if (isDeviceTypeOperators(operator)) {
                    updateTriggers(
                        produce(triggers, (draft) => {
                            if (triggerId) {
                                draft[triggerId] = {
                                    key: CampaignTriggerKey.DeviceType,
                                    value: 'true',
                                    operator,
                                }
                            } else {
                                const newKey = _uniqueId()
                                draft[newKey] = {
                                    key: CampaignTriggerKey.DeviceType,
                                    value: 'true',
                                    operator,
                                }
                            }
                        })
                    )
                }
            },
            [triggers, updateTriggers]
        )

        const handleChangeNoReply = useCallback(
            (value: boolean) => {
                setCampaignWithNoReply(value)
            },
            [setCampaignWithNoReply]
        )

        const handleSaveCampaign = async () => {
            setIsActionInProgress(true)

            try {
                const triggersArr = Object.values(triggers)
                const author = campaignAgent ?? undefined
                const html = replaceUrlsWithUtmUrl(
                    campaignMessageHTML,
                    campaignName
                )
                const text = campaignMessageText

                let payload: ChatCampaign = {
                    id: campaign.id,
                    message: {
                        author,
                        html,
                        text,
                    },
                    name: trim(campaignName),
                    triggers: triggersArr,
                    created_datetime: campaign?.created_datetime,
                }

                if (isRevenueBetaTester) {
                    payload = {
                        ...payload,
                        meta: {
                            ...payload?.meta,
                            delay: campaignDelay,
                            noReply: campaignWithNoReply,
                        },
                    }
                }

                if (shopifyProducts.length > 0) {
                    payload['attachments'] = shopifyProducts.map((product) => {
                        return transformProductToAttachment(product, {
                            campaignName,
                            currency: shopifyIntegration.getIn([
                                'meta',
                                'currency',
                            ]),
                        })
                    })
                }

                if (isUpdate) {
                    await updateCampaign(fromJS(payload), integration)
                } else {
                    payload['created_datetime'] = new Date().toISOString()
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

        const handleDeleteCampaign = async () => {
            await deleteCampaign(fromJS(campaign), integration)

            history.push(
                `/app/settings/integrations/${
                    integration.get('type') as string
                }/${integration.get('id') as string}/campaigns`
            )
        }

        const isCampaignValid =
            !!campaignName &&
            !!campaignMessageText &&
            Object.keys(triggers).length !== 0

        useEffect(() => {
            setStateInitialized(true)
            dispatch(
                setNewMessageForChatCampaign({
                    channel: TicketChannel.Chat,
                    sourceType: TicketMessageSourceType.Chat,
                })
            )

            return () => {
                dispatch(setNewMessageForChatCampaign({}))
            }
        }, [dispatch])

        useEffect(() => {
            if (campaign) {
                if (campaign.triggers) {
                    const nextTriggers = campaign.triggers.reduce(
                        (acc, trigger) => {
                            const id = _uniqueId()
                            return {
                                ...acc,
                                [id.toString()]: trigger,
                            }
                        },
                        {}
                    )
                    updateTriggers(nextTriggers)
                } else {
                    const nextTriggers = {
                        [_uniqueId()]: createTrigger(
                            CampaignTriggerKey.CurrentUrl
                        ),
                    }

                    updateTriggers(nextTriggers)
                }

                setCampaignName(campaign.name)

                if (campaign.meta) {
                    if (campaign.meta.delay >= 0) {
                        setCampaignDelay(campaign.meta.delay)
                    }

                    if (typeof campaign.meta.noReply === 'boolean') {
                        setCampaignWithNoReply(campaign.meta.noReply)
                    }
                }

                if (campaign.message) {
                    setCampaignMessageHTML(campaign.message.html)
                    setCampaignMessageText(campaign.message.text)
                    setCampaignAgent(campaign.message?.author ?? undefined)
                }

                if (
                    Array.isArray(campaign.attachments) &&
                    campaign.attachments.length > 0
                ) {
                    const attachments = campaign.attachments.map(
                        (attachment) => {
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
                                    variant_name:
                                        attachment.extra?.variant_name,
                                    position: attachment.extra?.position,
                                },
                            }
                        }
                    )

                    void dispatch(
                        setNewMessageForChatCampaign({
                            channel: TicketChannel.Chat,
                            sourceType: TicketMessageSourceType.Chat,
                            attachments: fromJS(attachments),
                        })
                    )
                }
            }
        }, [campaign, dispatch, isRevenueBetaTester])

        const isShopifyStore = chatIsShopifyStore(integration)
        const shouldShowContactCsm = Object.values(triggers).some(
            (trigger) => !isAllowedToUpdateTrigger(trigger, isRevenueBetaTester)
        )

        const chatTitle = integration.get('name')

        const avatar: GorgiasChatAvatarSettings = {
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
        }

        const backUrl = `/app/settings/channels/${
            integration.get('type') as string
        }/${integration.get('id') as string}/campaigns${
            (history.location.state as Record<string, string>)
                ?.previousSearch ?? ''
        }`

        return (
            <IntegrationProvider
                chatIntegration={integration}
                shopifyIntegration={shopifyIntegration}
            >
                <div data-testid="advanced-campaign-details-page">
                    <CampaignDetailsHeader
                        backToHref={backUrl}
                        isUpdate={isUpdate}
                    />

                    <GorgiasChatIntegrationPreviewContainer
                        preview={
                            richArea && (
                                <CampaignPreview
                                    {...chatPreviewProps}
                                    className={css.campaignPreview}
                                    products={shopifyProducts}
                                    html={sanitizeHtmlDefault(
                                        campaignMessageHTML
                                    )}
                                    authorName={campaignAgent?.name ?? ``}
                                    authorAvatarUrl={
                                        campaignAgent?.avatar_url ?? ''
                                    }
                                    avatar={avatar}
                                    chatTitle={chatTitle}
                                    mainFontFamily={
                                        chatPreviewProps.mainFontFamily ??
                                        GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT
                                    }
                                    shouldHideReplyInput={campaignWithNoReply}
                                    onCampaignContentChange={
                                        setShowContentWarning
                                    }
                                />
                            )
                        }
                    >
                        <div className={css.formWrapper}>
                            <div className="mb-4">
                                <InputField
                                    isRequired
                                    label="Campaign name"
                                    aria-label="Campaign name"
                                    placeholder="My new campaign"
                                    value={campaignName}
                                    onChange={setCampaignName}
                                />
                            </div>

                            <h3 className={css.section}>
                                Choose your audience
                            </h3>
                            <div className="mb-4">
                                {shouldShowContactCsm && (
                                    <Alert icon type={AlertType.Warning}>
                                        Advanced triggers are only available to
                                        Revenue subscribers.To update them,
                                        please contact your Customer Success
                                        Manager to activate this subscription.
                                    </Alert>
                                )}
                            </div>
                            <div className="mb-4">
                                <TriggersProvider
                                    triggers={triggers}
                                    onUpdateTrigger={handleUpdateTrigger}
                                    onDeleteTrigger={handleDeleteTrigger}
                                >
                                    <AdvancedTriggersForm triggers={triggers} />
                                </TriggersProvider>
                                <AdvancedTriggersSelect
                                    isShopifyStore={isShopifyStore}
                                    isRevenueBetaTester={isRevenueBetaTester}
                                    onClick={handleAddTrigger}
                                />
                            </div>

                            <CampaignDisplaySettings
                                isRevenueBetaTester={isRevenueBetaTester}
                                triggers={triggers}
                                isNoReply={campaignWithNoReply}
                                delay={campaignDelay}
                                onChangeCollision={
                                    handleToggleSingleCampaignInView
                                }
                                onChangeDelay={setCampaignDelay}
                                onChangeDeviceType={handleChangeDeviceType}
                                onChangeNoReply={handleChangeNoReply}
                            />

                            <h3 className={css.section}>Write your message</h3>
                            {stateInitialized && (
                                <CampaignMessage
                                    richAreaRef={(ref) => setRichArea(ref)}
                                    showContentWarning={showContentWarning}
                                    agents={agents}
                                    attachments={attachments}
                                    html={campaignMessageHTML}
                                    text={campaignMessageText}
                                    isRevenueBetaTester={isRevenueBetaTester}
                                    selectedAgent={campaignAgent?.email ?? ''}
                                    onSelectAgent={handleChangeAgent}
                                    onChangeMessage={handleChangeMessage}
                                    onDeleteAttachment={handleDeleteAttachment}
                                />
                            )}

                            <CampaignFooter
                                isActionInProgress={isActionInProgress}
                                isCampaignValid={isCampaignValid}
                                isUpdate={isUpdate}
                                onSave={handleSaveCampaign}
                                onDelete={handleDeleteCampaign}
                            />
                        </div>
                    </GorgiasChatIntegrationPreviewContainer>
                </div>
            </IntegrationProvider>
        )
    }
)
