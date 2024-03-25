import React, {useCallback, useMemo} from 'react'

import {Map} from 'immutable'
import {ulid} from 'ulidx'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import ConvertInfoBanner from 'pages/convert/campaigns/components/ConvertInfoBanner'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {useCampaignFormContext} from 'pages/convert/campaigns/hooks/useCampaignFormContext'

import {StatefulAccordion} from '../../components/StatefulAccordion'
import {AdvancedTriggersForm} from '../../components/AdvancedTriggersForm'
import {AdvancedTriggersSelect} from '../../components/AdvancedTriggersSelect'
import {CampaignDisplaySettings} from '../../components/CampaignDisplaySettings'

import {isAllowedToUpdateTrigger} from '../../utils/isAllowedToUpdateTrigger'

import {useStepState} from '../../hooks/useStepState'
import {useCampaignDetailsContext} from '../../hooks/useCampaignDetailsContext'

import {CampaignTriggerType} from '../../types/enums/CampaignTriggerType.enum'
import {CampaignStepsKeys} from '../../types/CampaignSteps'

import {TriggersProvider} from '../TriggersProvider'
import ConvertSetupBanner from '../../components/ConvertSetupBanner/ConvertSetupBanner'
import {AdvancedTriggersTooltip} from '../../components/AdvancedTriggersTooltip'
import {isDeviceTypeValue} from '../../types/enums/CampaignTriggerDeviceTypeValue.enum'
import {createTrigger} from '../../utils/createTrigger'

type Props = {
    count?: number
    isPristine?: boolean
    isValid?: boolean
    isConvertSubscriber?: boolean
    isShopifyStore?: boolean
    integration: Map<any, any>
}

export const CampaignAudienceStep = ({
    count,
    isPristine = true,
    isValid = false,
    isConvertSubscriber,
    isShopifyStore,
    integration,
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
    const campaignWithNoReply = campaign.meta?.noReply ?? false
    const campaignDelay = campaign.meta?.delay ?? 0
    const stateProps = useStepState({count, isPristine, isValid, isEditMode})
    const stepConfiguration = useMemo(() => {
        return getStepConfiguration(CampaignStepsKeys.Audience)
    }, [getStepConfiguration])

    const shouldShowContactCsm = Object.values(triggers).some(
        (trigger) => !isAllowedToUpdateTrigger(trigger, isConvertSubscriber)
    )

    const handleUpdateDelay = (value: number) => updateCampaign('delay', value)

    const handleUpdateNoReply = (value: boolean) =>
        updateCampaign('noReply', value)

    const handleToggleSingleCampaignInView = useCallback(
        (triggerId: string, value: boolean) => {
            if (value) {
                const singleInViewTrigger = createTrigger(
                    CampaignTriggerType.SingleInView
                )
                addTrigger(
                    CampaignTriggerType.SingleInView,
                    singleInViewTrigger
                )
            } else {
                deleteTrigger(triggerId)
            }
        },
        [addTrigger, deleteTrigger]
    )

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
                <div
                    className="mb-4 mt-4"
                    data-testid="campaign-audience-step-info-banner"
                >
                    <ConvertInfoBanner
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
                    <AdvancedTriggersForm triggers={triggers} />
                </TriggersProvider>
                <AdvancedTriggersSelect
                    isShopifyStore={isShopifyStore}
                    isConvertSubscriber={isConvertSubscriber}
                    onClick={addTrigger}
                />
                <AdvancedTriggersTooltip
                    isConvertSubscriber={isConvertSubscriber}
                />
            </div>

            <CampaignDisplaySettings
                isConvertSubscriber={isConvertSubscriber}
                triggers={triggers}
                isNoReply={campaignWithNoReply}
                delay={campaignDelay}
                onChangeCollision={handleToggleSingleCampaignInView}
                onChangeDelay={handleUpdateDelay}
                onChangeDeviceType={handleChangeDeviceType}
                onChangeNoReply={handleUpdateNoReply}
            />
        </StatefulAccordion>
    )
}
