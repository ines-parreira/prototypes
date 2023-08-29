import React, {useCallback} from 'react'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {StatefulAccordion} from '../../components/StatefulAccordion'
import {AdvancedTriggersForm} from '../../components/AdvancedTriggersForm'
import {AdvancedTriggersSelect} from '../../components/AdvancedTriggersSelect'
import {CampaignDisplaySettings} from '../../components/CampaignDisplaySettings'

import {isAllowedToUpdateTrigger} from '../../utils/isAllowedToUpdateTrigger'

import {useStepState} from '../../hooks/useStepState'
import {useCampaignDetailsContext} from '../../hooks/useCampaignDetailsContext'

import {CampaignTriggerKey} from '../../types/enums/CampaignTriggerKey.enum'
import {CampaignStepsKeys} from '../../types/CampaignSteps'
import {isDeviceTypeOperators} from '../../types/enums/DeviceTypeOperators.enum'
import {SingleCampaignInViewOperators} from '../../types/enums/SingleCampaignInViewOperators.enum'

import {TriggersProvider} from '../TriggersProvider'

type Props = {
    count?: number
    isPristine?: boolean
    isValid?: boolean
    isRevenueBetaTester?: boolean
    isShopifyStore?: boolean
}

export const CampaignAudienceStep = ({
    count,
    isPristine = true,
    isValid = false,
    isRevenueBetaTester,
    isShopifyStore,
}: Props) => {
    const {
        campaign,
        triggers,
        isEditMode,
        updateCampaign,
        addTrigger,
        updateTrigger,
        deleteTrigger,
    } = useCampaignDetailsContext()
    const campaignWithNoReply = campaign.meta?.noReply ?? false
    const campaignDelay = campaign.meta?.delay ?? 0
    const stateProps = useStepState({count, isPristine, isValid, isEditMode})

    const shouldShowContactCsm = Object.values(triggers).some(
        (trigger) => !isAllowedToUpdateTrigger(trigger, isRevenueBetaTester)
    )

    const handleUpdateDelay = (value: number) => updateCampaign('delay', value)

    const handleUpdateNoReply = (value: boolean) =>
        updateCampaign('noReply', value)

    const handleToggleSingleCampaignInView = useCallback(
        (triggerId: string, value: boolean) => {
            if (value === true) {
                addTrigger(CampaignTriggerKey.SingleInView, {
                    key: CampaignTriggerKey.SingleInView,
                    value: 'true',
                    operator: SingleCampaignInViewOperators.Equal,
                })
            } else {
                deleteTrigger(triggerId)
            }
        },
        [addTrigger, deleteTrigger]
    )

    const handleChangeDeviceType = useCallback(
        (triggerId: string, operator: string) => {
            if (isDeviceTypeOperators(operator)) {
                if (triggerId) {
                    updateTrigger(triggerId, {
                        value: 'true',
                        operator,
                    })
                } else {
                    addTrigger(CampaignTriggerKey.DeviceType, {
                        key: CampaignTriggerKey.DeviceType,
                        value: 'true',
                        operator,
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
            <div className="mb-4">
                {shouldShowContactCsm && (
                    <Alert icon type={AlertType.Warning}>
                        Advanced triggers are only available to Revenue
                        subscribers. To update them, please contact your
                        Customer Success Manager to activate this subscription.
                    </Alert>
                )}
            </div>
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
                    isRevenueBetaTester={isRevenueBetaTester}
                    onClick={addTrigger}
                />
            </div>

            <CampaignDisplaySettings
                isRevenueBetaTester={isRevenueBetaTester}
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
