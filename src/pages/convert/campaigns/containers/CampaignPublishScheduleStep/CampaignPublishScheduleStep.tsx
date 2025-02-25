/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import React, { useMemo, useState } from 'react'

import { produce } from 'immer'
import moment, { Moment } from 'moment-timezone'

import { Label } from '@gorgias/merchant-ui-kit'

import { Caption } from 'gorgias-design-system/Input/Caption'
import useAppSelector from 'hooks/useAppSelector'
import { useModalManager } from 'hooks/useModalManager'
import useUpdateEffect from 'hooks/useUpdateEffect'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import CampaignCustomSchedule from 'pages/convert/campaigns//components/CampaignCustomSchedule'
import CampaignScheduleSummary from 'pages/convert/campaigns/components/CampaignScheduleSummary'
import { StatefulAccordion } from 'pages/convert/campaigns/components/StatefulAccordion'
import { DURATION_VALUES } from 'pages/convert/campaigns/constants/labels'
import { useCampaignDetailsContext } from 'pages/convert/campaigns/hooks/useCampaignDetailsContext'
import { useCampaignFormContext } from 'pages/convert/campaigns/hooks/useCampaignFormContext'
import { useStepState } from 'pages/convert/campaigns/hooks/useStepState'
import {
    CustomScheduleSchema,
    ScheduleSchema,
} from 'pages/convert/campaigns/types/CampaignSchedule'
import { CampaignStepsKeys } from 'pages/convert/campaigns/types/CampaignSteps'
import {
    CampaignScheduleModeEnum,
    CampaignScheduleRuleValueEnum,
} from 'pages/convert/campaigns/types/enums/CampaignScheduleSettingsValues.enum'
import { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import ConvertSubscriptionModal from 'pages/convert/common/components/ConvertSubscriptionModal'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'

import CampaignSchedulePicker from './CampaignSchedulePicker'

import css from './CampaignPublishScheduleStep.less'

const DEFAULT_TIMEZONE = 'UTC'
// Note: In convert we store all dates in UTC format (without timezone info)
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss'
export const DURING_BH_TRIGGER_CAPTION_TEXT =
    "The campaign will follow the set 'business hours' trigger. To customize the timing further, remove the trigger."

type Props = {
    count: number
    isPristine?: boolean
    isValid?: boolean
    isDisabled?: boolean
    isConvertSubscriber?: boolean
    isLightCampaign?: boolean
}

export const CampaignPublishScheduleStep = ({
    count,
    isPristine = true,
    isValid = false,
    isDisabled = false,
    isConvertSubscriber = false,
    isLightCampaign = false,
}: Props) => {
    const { isEditMode } = useCampaignFormContext()
    const { campaign, updateCampaign, triggers } = useCampaignDetailsContext()
    const convertModal = useModalManager('ConvertSubscriber')

    const businessHoursSettings = useAppSelector(getBusinessHoursSettings)
    const timezone = businessHoursSettings?.data?.timezone ?? DEFAULT_TIMEZONE

    const [scheduleInnerConfiguration, setScheduleInnerConfiguration] =
        useState<ScheduleSchema>({
            start_datetime:
                campaign.schedule?.start_datetime ??
                // First get current date in TZ then get start of day and convert to definied TZ
                moment(moment.utc().tz(timezone))
                    .startOf('day')
                    .utc()
                    .format(DATETIME_FORMAT),
            end_datetime: campaign.schedule?.end_datetime ?? null,
            schedule_rule:
                campaign.schedule?.schedule_rule ??
                CampaignScheduleRuleValueEnum.AllDay,
            custom_schedule: campaign.schedule?.custom_schedule || [],
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
            (trigger) => trigger.type === CampaignTriggerType.BusinessHours,
        )
        return businessHourTrigger
    }, [triggers])

    const updateState = (newValue: ScheduleSchema) => {
        setScheduleInnerConfiguration(newValue)
        updateCampaign('schedule', newValue)
    }

    const updateCustomSchedule = (value: any) => {
        updateState({
            ...scheduleInnerConfiguration,
            custom_schedule: value,
        })
    }

    const updateScheduleRule = (value: any) => {
        updateState({
            ...scheduleInnerConfiguration,
            schedule_rule: value,
        })
    }

    const openModal = () => {
        convertModal.openModal()
    }

    const closeModal = () => {
        convertModal.closeModal()
    }

    const updateDates = ({
        startDate,
        endDate,
    }: {
        startDate?: Moment
        endDate?: Moment | null
    }) => {
        if (startDate) {
            updateState(
                produce(scheduleInnerConfiguration, (draft) => {
                    draft.start_datetime = startDate
                        .utc()
                        .format(DATETIME_FORMAT)
                    if (
                        scheduleInnerConfiguration.end_datetime &&
                        moment(
                            scheduleInnerConfiguration.end_datetime,
                        ).isBefore(draft.start_datetime)
                    ) {
                        draft.end_datetime = null
                    }
                }),
            )
        }

        if (endDate || endDate === null) {
            updateState({
                ...scheduleInnerConfiguration,
                end_datetime:
                    endDate !== null
                        ? endDate.utc().format(DATETIME_FORMAT)
                        : null,
            })
        }
    }

    useUpdateEffect(() => {
        if (campaign.publish_mode === CampaignScheduleModeEnum.PublishNow) {
            updateCampaign('schedule', null)
        } else if (
            campaign.publish_mode === CampaignScheduleModeEnum.Schedule ||
            !!campaign.schedule
        ) {
            updateCampaign('schedule', scheduleInnerConfiguration)
        }
    }, [campaign.publish_mode])

    useUpdateEffect(() => {
        if (
            scheduleInnerConfiguration.schedule_rule !==
            CampaignScheduleRuleValueEnum.Custom
        ) {
            updateState({
                ...scheduleInnerConfiguration,
                custom_schedule: [],
            })
        }
    }, [scheduleInnerConfiguration.schedule_rule])

    return (
        <>
            <StatefulAccordion
                {...stateProps}
                id={CampaignStepsKeys.PublishSchedule}
                title="Publish your campaign"
            >
                <RadioFieldSet
                    selectedValue={campaign.publish_mode as string}
                    options={[
                        {
                            value: CampaignScheduleModeEnum.PublishNow,
                            label: 'Publish now',
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
                                        <span
                                            className={
                                                css.convertSubscriberLabel
                                            }
                                            onClick={openModal}
                                        >
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
                    onChange={(value: any) =>
                        updateCampaign('publish_mode', value)
                    }
                />

                {campaign.publish_mode ===
                    CampaignScheduleModeEnum.Schedule && (
                    <>
                        <div className={css.marginTop}>
                            <CampaignSchedulePicker
                                timezone={timezone}
                                startDate={
                                    scheduleInnerConfiguration.start_datetime
                                }
                                endDate={
                                    scheduleInnerConfiguration.end_datetime
                                }
                                onChange={updateDates}
                            />
                        </div>

                        <div className={css.marginTop}>
                            <Label
                                htmlFor="schedule-rule"
                                className={css.label}
                            >
                                During
                            </Label>
                            <SelectField
                                id="schedule-rule"
                                aria-label="Scheduled duration"
                                fullWidth
                                showSelectedOption
                                value={
                                    (!!businessHourTrigger
                                        ? businessHourTrigger.value
                                        : campaign.schedule
                                              ?.schedule_rule) as string
                                }
                                onChange={updateScheduleRule}
                                options={DURATION_VALUES}
                                disabled={!!businessHourTrigger}
                            />
                            {!!businessHourTrigger && (
                                <Caption className={css.caption} isValid>
                                    {DURING_BH_TRIGGER_CAPTION_TEXT}
                                </Caption>
                            )}
                        </div>

                        {scheduleInnerConfiguration.schedule_rule ===
                            CampaignScheduleRuleValueEnum.Custom && (
                            <CampaignCustomSchedule
                                customSchedule={
                                    scheduleInnerConfiguration.custom_schedule as CustomScheduleSchema[]
                                }
                                onChange={updateCustomSchedule}
                            />
                        )}

                        <div className={css.marginTop}>
                            <CampaignScheduleSummary
                                scheduleConfiguration={
                                    scheduleInnerConfiguration
                                }
                            />
                        </div>
                    </>
                )}
            </StatefulAccordion>
            <ConvertSubscriptionModal
                canduId={'campaign-triggers-convert-modal-body'}
                isOpen={convertModal.isOpen()}
                onClose={closeModal}
                onSubscribe={closeModal}
            />
        </>
    )
}

export default CampaignPublishScheduleStep
