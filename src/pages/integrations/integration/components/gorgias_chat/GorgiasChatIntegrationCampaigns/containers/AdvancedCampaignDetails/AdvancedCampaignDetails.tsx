import React, {memo, useCallback, useEffect, useState} from 'react'
import {fromJS, Map} from 'immutable'
import produce from 'immer'
import _uniqueId from 'lodash/uniqueId'
import {EditorState} from 'draft-js'

import {convertToHTML} from 'utils/editor'
import {sanitizeHtmlDefault} from 'utils/html'
import {User} from 'config/types/user'
import history from 'pages/history'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import InputField from 'pages/common/forms/input/InputField'
import {Value} from 'pages/common/forms/SelectField/types'

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

import {chatIsShopifyStore} from '../../utils/chatIsShopifyStore'
import {isAllowedToUpdateTrigger} from '../../utils/isAllowedToUpdateTrigger'

import {TriggersProvider} from '../TriggersProvider'

import CampaignPreview from '../../components/CampaignPreview'
import {CampaignMessage} from '../../components/CampaignMessage'
import {CampaignFooter} from '../../components/CampaignFooter'
import {AdvancedTriggersForm} from '../../components/AdvancedTriggersForm'
import {CampaignDetailsHeader} from '../../components/CampaignDetailsHeader'
import {AdvancedTriggersSelect} from '../../components/AdvancedTriggersSelect'
import {CampaignDisplaySettings} from '../../components/CampaignDisplaySettings'

import {SingleCampaignInViewOperators} from '../../types/enums/SingleCampaignInViewOperators.enum'

import css from './AdvancedCampaignDetails.less'

type Props = {
    agents: User[]
    campaign: ChatCampaign
    id: string
    integration: Map<any, any>
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
        createCampaign,
        updateCampaign,
        deleteCampaign,
    }: Props): JSX.Element => {
        const isUpdate = id !== 'new'

        const [stateInitialized, setStateInitialialized] = useState(false)
        const [isActionInProgress, setIsActionInProgress] =
            useState<boolean>(false)
        const [triggers, updateTriggers] = useState<CampaignTriggerMap>({})
        const [campaignName, setCampaignName] = useState<string>(
            campaign.name ?? ''
        )
        const [campaignDelay, setCampaignDelay] = useState<number>()
        const [campaignAgent, setCampaignAgent] = useState<CampaignAuthor>()
        const [campaignMessageHTML, setCampaignMessageHTML] =
            useState<string>('')
        const [campaignMessageText, setCampaignMessageText] =
            useState<string>('')
        const chatPreviewProps = useChatPreviewProps(integration)

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

        const handleSaveCampaign = async () => {
            setIsActionInProgress(true)

            try {
                const triggersArr = Object.values(triggers)
                const author = campaignAgent ?? undefined
                const html = campaignMessageHTML
                const text = campaignMessageText

                let payload: ChatCampaign = {
                    id: campaign.id,
                    message: {
                        author,
                        html,
                        text,
                    },
                    name: campaignName,
                    triggers: triggersArr,
                }

                if (campaignDelay && campaignDelay >= 0) {
                    payload = {
                        ...payload,
                        meta: {
                            ...payload?.meta,
                            delay: campaignDelay,
                        },
                    }
                }

                if (isUpdate) {
                    await updateCampaign(fromJS(payload), integration)
                } else {
                    await createCampaign(fromJS(payload), integration)
                }
            } finally {
                setIsActionInProgress(false)
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
            campaignName !== '' &&
            campaignMessageText !== '' &&
            Object.keys(triggers).length !== 0

        useEffect(() => {
            setStateInitialialized(true)
        }, [])

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

                if (campaign.meta && campaign.meta.delay >= 0) {
                    setCampaignDelay(campaign.meta.delay)
                }

                if (campaign.message) {
                    setCampaignMessageHTML(campaign.message.html)
                    setCampaignMessageText(campaign.message.text)
                    setCampaignAgent(campaign.message?.author ?? undefined)
                }
            }
        }, [campaign, isRevenueBetaTester])

        const isShopifyStore = chatIsShopifyStore(integration)
        const shouldShowContactCsm = Object.values(triggers).some(
            (trigger) => !isAllowedToUpdateTrigger(trigger, isRevenueBetaTester)
        )

        return (
            <div data-testid="advanced-campaign-details-page">
                <CampaignDetailsHeader
                    backToHref={`/app/settings/channels/${
                        integration.get('type') as string
                    }/${integration.get('id') as string}/campaigns`}
                    isUpdate={isUpdate}
                />

                <GorgiasChatIntegrationPreviewContainer
                    preview={
                        <CampaignPreview
                            {...chatPreviewProps}
                            html={sanitizeHtmlDefault(campaignMessageHTML)}
                            authorName={campaignAgent?.name ?? ``}
                            authorAvatarUrl={campaignAgent?.avatar_url ?? ''}
                        />
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

                        <h3 className={css.section}>Choose your audience</h3>
                        <div className="mb-4">
                            {shouldShowContactCsm && (
                                <Alert icon type={AlertType.Warning}>
                                    Advanced triggers are only available to
                                    Revenue subscribers.To update them, please
                                    contact your Customer Success Manager to
                                    activate this subscription.
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
                            delay={campaignDelay}
                            onChangeCollision={handleToggleSingleCampaignInView}
                            onChangeDelay={setCampaignDelay}
                            onChangeDeviceType={handleChangeDeviceType}
                        />

                        <h3 className={css.section}>Write your message</h3>
                        {stateInitialized && (
                            <CampaignMessage
                                agents={agents}
                                html={campaignMessageHTML}
                                text={campaignMessageText}
                                selectedAgent={campaignAgent?.email ?? ''}
                                onSelectAgent={handleChangeAgent}
                                onChangeMessage={handleChangeMessage}
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
        )
    }
)
