import React, {useCallback, useMemo} from 'react'

import {Map} from 'immutable'
import {ulid} from 'ulidx'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'

import ConvertInfoBanner from 'pages/convert/campaigns/components/ConvertInfoBanner'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {useCampaignFormContext} from 'pages/convert/campaigns/hooks/useCampaignFormContext'

import ConvertSetupBanner from 'pages/convert/campaigns/components/ConvertSetupBanner'
import {StatefulAccordion} from 'pages/convert/campaigns/components/StatefulAccordion'
import {AdvancedTriggersForm} from 'pages/convert/campaigns/components/AdvancedTriggersForm'
import {AdvancedTriggersSelect} from 'pages/convert/campaigns/components/AdvancedTriggersSelect'
import {CampaignDisplaySettings} from 'pages/convert/campaigns/components/CampaignDisplaySettings'
import {CampaignDelay} from 'pages/convert/campaigns/components/CampaignDelay'
import CampaignFrequency from 'pages/convert/campaigns/components/CampaignFrequency'
import {isAllowedToUpdateTrigger} from 'pages/convert/campaigns/utils/isAllowedToUpdateTrigger'
import useIsCampaignProritizationEnabled from 'pages/convert/common/hooks/useIsCampaignProritizationEnabled'
import {useStepState} from 'pages/convert/campaigns/hooks/useStepState'
import {useCampaignDetailsContext} from 'pages/convert/campaigns/hooks/useCampaignDetailsContext'
import {createTrigger} from 'pages/convert/campaigns/utils/createTrigger'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignStepsKeys} from 'pages/convert/campaigns/types/CampaignSteps'
import {
    CampaignDisplaysInSession,
    MinimumTimeBetweenCampaigns,
} from 'pages/convert/campaigns/types/CampaignMeta'
import {TriggersProvider} from 'pages/convert/campaigns/containers/TriggersProvider'
import {isDeviceTypeValue} from 'pages/convert/campaigns/types/enums/CampaignTriggerDeviceTypeValue.enum'

import css from './CampaignAudienceStep.less'

type Props = {
    key: CampaignStepsKeys
    count?: number
    isPristine?: boolean
    isValid?: boolean
    isDisabled?: boolean
    isConvertSubscriber?: boolean
    isShopifyStore?: boolean
    isLightCampaign?: boolean
    integration: Map<any, any>
    onValidationChange: (isValid: boolean) => void
}

export const CampaignAudienceStep = ({
    count,
    isPristine = true,
    isValid = false,
    isDisabled = false,
    isConvertSubscriber,
    isShopifyStore,
    isLightCampaign,
    integration,
    onValidationChange,
}: Props) => {
    const {
        campaign,
        triggers,
        updateCampaign,
        addTrigger,
        updateTrigger,
        deleteTrigger,
    } = useCampaignDetailsContext()
    const {isEditMode, getStepConfiguration} = useCampaignFormContext()
    const isCampaignProritizationEnabled = useIsCampaignProritizationEnabled()

    const campaignWithNoReply = campaign.meta?.noReply ?? false
    const campaignDelay = campaign.meta?.delay ?? 0
    const campaignMaxDisplaysInSession =
        campaign.meta?.maxCampaignDisplaysInSession
    const minimumTimeBetweenCampaigns =
        campaign.meta?.minimumTimeBetweenCampaigns

    const stateProps = useStepState({
        count,
        isPristine,
        isValid,
        isEditMode,
        isDisabled,
    })
    const stepConfiguration = useMemo(() => {
        return getStepConfiguration(CampaignStepsKeys.Audience)
    }, [getStepConfiguration])

    const shouldShowContactCsm = Object.values(triggers).some(
        (trigger) => !isAllowedToUpdateTrigger(trigger, isConvertSubscriber)
    )

    const handleUpdateDelay = (value: number) => updateCampaign('delay', value)

    const handleUpdateNoReply = (value: boolean) =>
        updateCampaign('noReply', value)

    const handleUpdateMaxDisplaysInSession = (
        value: CampaignDisplaysInSession | null
    ) => {
        updateCampaign('maxCampaignDisplaysInSession', value)
    }

    const handleUpdateMinTimeBetweenCampaigns = (
        value: MinimumTimeBetweenCampaigns | null
    ) => {
        updateCampaign('minimumTimeBetweenCampaigns', value)
    }

    const handleChangeDeviceType = useCallback(
        (triggerId: string, value: string) => {
            if (isDeviceTypeValue(value.toString())) {
                if (triggerId) {
                    updateTrigger(triggerId, {
                        id: triggerId,
                        type: CampaignTriggerType.DeviceType,
                        operator: CampaignTriggerOperator.Eq,
                        value: value,
                    })
                } else {
                    addTrigger(CampaignTriggerType.DeviceType, {
                        id: ulid(),
                        type: CampaignTriggerType.DeviceType,
                        operator: CampaignTriggerOperator.Eq,
                        value: value,
                    })
                }
            }
        },
        [addTrigger, updateTrigger]
    )

    const isConsideredLightCampaign = isLightCampaign && isShopifyStore

    const handleChangeIncognitoVisitor = useCallback(
        (triggerId: string, value: boolean | undefined) => {
            if (!triggerId && value) {
                const incognitoVisitorTrigger = createTrigger(
                    CampaignTriggerType.IncognitoVisitor
                )
                addTrigger(
                    CampaignTriggerType.IncognitoVisitor,
                    incognitoVisitorTrigger
                )
            } else if (triggerId) {
                if (value === undefined) {
                    deleteTrigger(triggerId)
                } else {
                    updateTrigger(triggerId, {
                        id: triggerId,
                        type: CampaignTriggerType.IncognitoVisitor,
                        operator: CampaignTriggerOperator.Eq,
                        value: value.toString(),
                    })
                }
            }
        },
        [addTrigger, updateTrigger, deleteTrigger]
    )

    if (isCampaignProritizationEnabled) {
        return (
            <StatefulAccordion
                {...stateProps}
                id={CampaignStepsKeys.Audience}
                title="Choose your audience"
            >
                <ConvertSetupBanner
                    classes={'mb-4'}
                    shopIntegrationId={integration.getIn([
                        'meta',
                        'shop_integration_id',
                    ])}
                    chatIntegrationId={integration.get('id')}
                />

                <Accordion defaultExpandedItem="conditions">
                    <AccordionItem highlightOnExpand={false} id="conditions">
                        <AccordionHeader>
                            <h3 className={css.header}>Conditions</h3>
                        </AccordionHeader>
                        <AccordionBody>
                            <div className="mb-4">
                                <TriggersProvider
                                    triggers={triggers}
                                    onUpdateTrigger={updateTrigger}
                                    onDeleteTrigger={deleteTrigger}
                                >
                                    <AdvancedTriggersForm
                                        triggers={triggers}
                                        onValidationChange={onValidationChange}
                                    />
                                    <AdvancedTriggersSelect
                                        isShopifyStore={isShopifyStore}
                                        isConvertSubscriber={
                                            isConvertSubscriber
                                        }
                                        isLightCampaign={
                                            isConsideredLightCampaign
                                        }
                                        onClick={addTrigger}
                                    />
                                </TriggersProvider>
                            </div>
                            <div className={css.delaySelector}>
                                <CampaignDelay
                                    delay={campaignDelay}
                                    onChangeDelay={handleUpdateDelay}
                                />
                            </div>
                        </AccordionBody>
                    </AccordionItem>
                    <AccordionItem
                        highlightOnExpand={false}
                        id="campaign-preferences"
                    >
                        <AccordionHeader>
                            <h3 className={css.header}>Campaign preferences</h3>
                        </AccordionHeader>
                        <AccordionBody>
                            {!isConsideredLightCampaign && (
                                <CampaignDisplaySettings
                                    isConvertSubscriber={isConvertSubscriber}
                                    triggers={triggers}
                                    isNoReply={campaignWithNoReply}
                                    /* deprecated */
                                    delay={campaignDelay}
                                    onChangeDelay={handleUpdateDelay}
                                    /* end deprecated */
                                    onChangeDeviceType={handleChangeDeviceType}
                                    onChangeIncognitoVisitor={
                                        handleChangeIncognitoVisitor
                                    }
                                    onChangeNoReply={handleUpdateNoReply}
                                />
                            )}

                            <CampaignFrequency
                                integrationId={integration.get('id')}
                                maximumCampaignsDisplayed={
                                    campaignMaxDisplaysInSession
                                }
                                timeBetweenCampaigns={
                                    minimumTimeBetweenCampaigns
                                }
                                onChangeTimeBetweenCampaigns={
                                    handleUpdateMinTimeBetweenCampaigns
                                }
                                onChangeMaximumCampaignDisplayed={
                                    handleUpdateMaxDisplaysInSession
                                }
                                onValidationChange={onValidationChange}
                            />
                        </AccordionBody>
                    </AccordionItem>
                </Accordion>
            </StatefulAccordion>
        )
    }

    return (
        <StatefulAccordion
            {...stateProps}
            id={CampaignStepsKeys.Audience}
            title="Choose your audience"
        >
            <ConvertSetupBanner
                classes={'mb-4'}
                shopIntegrationId={integration.getIn([
                    'meta',
                    'shop_integration_id',
                ])}
                chatIntegrationId={integration.get('id')}
            />

            <div className="mb-4">
                {shouldShowContactCsm && (
                    <Alert icon type={AlertType.Warning}>
                        Advanced triggers are only available to Convert
                        subscribers. To update them, please contact your
                        Customer Success Manager to activate this subscription.
                    </Alert>
                )}
            </div>

            {stepConfiguration && stepConfiguration.banner && (
                <div className="mb-4 mt-4">
                    <ConvertInfoBanner
                        aria-label="Banner information for campaign audience step"
                        type={stepConfiguration.banner.type}
                        text={stepConfiguration.banner.content}
                    />
                </div>
            )}

            <div className="mb-4">
                <TriggersProvider
                    triggers={triggers}
                    onUpdateTrigger={updateTrigger}
                    onDeleteTrigger={deleteTrigger}
                >
                    <AdvancedTriggersForm
                        triggers={triggers}
                        onValidationChange={onValidationChange}
                    />
                    <AdvancedTriggersSelect
                        isShopifyStore={isShopifyStore}
                        isConvertSubscriber={isConvertSubscriber}
                        isLightCampaign={isConsideredLightCampaign}
                        onClick={addTrigger}
                    />
                </TriggersProvider>
            </div>

            {!isConsideredLightCampaign && (
                <CampaignDisplaySettings
                    isConvertSubscriber={isConvertSubscriber}
                    triggers={triggers}
                    isNoReply={campaignWithNoReply}
                    delay={campaignDelay}
                    onChangeDelay={handleUpdateDelay}
                    onChangeDeviceType={handleChangeDeviceType}
                    onChangeIncognitoVisitor={handleChangeIncognitoVisitor}
                    onChangeNoReply={handleUpdateNoReply}
                />
            )}
        </StatefulAccordion>
    )
}
