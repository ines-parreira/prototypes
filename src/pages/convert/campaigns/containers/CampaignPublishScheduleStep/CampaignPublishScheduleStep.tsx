/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import React, {useState, useMemo} from 'react'
import moment from 'moment-timezone'

import {Label} from '@gorgias/ui-kit'

import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import {useCampaignDetailsContext} from 'pages/convert/campaigns/hooks/useCampaignDetailsContext'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {DURATION_VALUES} from 'pages/convert/campaigns/constants/scheduleValueLabels'
import {
    CampaignScheduleModeEnum,
    CampaignScheduleTypeValueEnum,
} from 'pages/convert/campaigns/types/enums/CampaignScheduleSettingsValues.enum'
import CampaignScheduleSummary from 'pages/convert/campaigns/components/CampaignScheduleSummary'
import CampaignCustomSchedule from 'pages/convert/campaigns//components/CampaignCustomSchedule'
import {useCampaignFormContext} from 'pages/convert/campaigns/hooks/useCampaignFormContext'
import {useStepState} from 'pages/convert/campaigns/hooks/useStepState'
import {StatefulAccordion} from 'pages/convert/campaigns/components/StatefulAccordion'
import {CampaignStepsKeys} from 'pages/convert/campaigns/types/CampaignSteps'

import CampaignSchedulePicker from './CampaignSchedulePicker'

import css from './CampaignPublishScheduleStep.less'

type Props = {
    count: number
    isPristine?: boolean
    isValid?: boolean
    isDisabled?: boolean
    isConvertSubscriber?: boolean
    isLightCampaign?: boolean
    publishMode: CampaignScheduleModeEnum
    onPublishModeChange: (value: CampaignScheduleModeEnum) => void
}

export const CampaignPublishScheduleStep = ({
    count,
    isPristine = true,
    isValid = false,
    isDisabled = false,
    isConvertSubscriber = false,
    isLightCampaign = false,
    publishMode,
    onPublishModeChange,
}: Props) => {
    const {triggers} = useCampaignDetailsContext()
    const {isEditMode} = useCampaignFormContext()

    const [scheduleConfiguration, setScheduleConfiguration] = useState<
        Record<string, any>
    >({
        startDate: moment(),
        endDate: null,
        schedule_type: CampaignScheduleTypeValueEnum.AllDay,
    })

    const stateProps = useStepState({
        count,
        isPristine,
        isValid,
        isEditMode,
        isDisabled,
    })

    const businessHourTrigger = useMemo(() => {
        const businessHourTrigger = Object.values(triggers).find(
            (trigger) => trigger.type === CampaignTriggerType.BusinessHours
        )
        return businessHourTrigger
    }, [triggers])

    const updateScheduleType = (value: any) => {
        setScheduleConfiguration({
            ...scheduleConfiguration,
            schedule_type: value,
        })
    }

    return (
        <StatefulAccordion
            {...stateProps}
            id={CampaignStepsKeys.PublishSchedule}
            title="Publish your campaign"
        >
            <RadioFieldSet
                selectedValue={publishMode}
                options={[
                    {
                        value: CampaignScheduleModeEnum.PublishNow,
                        label: 'Publish Now',
                        caption:
                            'Launch your campaign immediately to start running on your store right away',
                    },
                    {
                        value: CampaignScheduleModeEnum.SaveAndPublishLater,
                        label: 'Save and publish later',
                        caption:
                            'Save your work in progress and publish your campaign later',
                    },
                    {
                        value: CampaignScheduleModeEnum.Schedule,
                        label: (
                            <>
                                Schedule{' '}
                                {!isConvertSubscriber && (
                                    <span style={{color: '#0075FF'}}>
                                        Subscribe to Convert
                                    </span>
                                )}
                            </>
                        ),
                        caption:
                            'Plan your campaign in advance by choosing a future date and time for publication',
                        disabled: isLightCampaign || !isConvertSubscriber,
                    },
                ]}
                onChange={(value: any) => onPublishModeChange(value)}
            />

            {publishMode === CampaignScheduleModeEnum.Schedule && (
                <>
                    <div className={css.marginTop}>
                        <CampaignSchedulePicker
                            scheduleConfiguration={scheduleConfiguration}
                            onChange={setScheduleConfiguration}
                        />
                    </div>

                    <div className={css.marginTop}>
                        <Label htmlFor="scheduleType" className={css.label}>
                            During
                        </Label>
                        <SelectField
                            fullWidth
                            showSelectedOption
                            value={
                                !!businessHourTrigger
                                    ? businessHourTrigger.value
                                    : scheduleConfiguration.schedule_type
                            }
                            onChange={updateScheduleType}
                            options={DURATION_VALUES}
                            disabled={!!businessHourTrigger}
                        />
                    </div>

                    {scheduleConfiguration.schedule_type ===
                        CampaignScheduleTypeValueEnum.Custom && (
                        <CampaignCustomSchedule />
                    )}

                    <div className={css.marginTop}>
                        <CampaignScheduleSummary />
                    </div>
                </>
            )}
        </StatefulAccordion>
    )
}

export default CampaignPublishScheduleStep
