import { useCallback, useEffect, useState } from 'react'

import type { DateValue, ZonedDateTime } from '@internationalized/date'
import {
    getLocalTimeZone,
    Time as TimeValue,
    today,
} from '@internationalized/date'
import { useFormContext, useWatch } from 'react-hook-form'

import {
    Banner,
    Box,
    Button,
    DateField,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    RadioCard,
    RadioGroup,
    SidePanel,
    TimeField,
} from '@gorgias/axiom'

import { UpdatableJourneyCampaignState } from 'AIJourney/constants'
import { useJourneyUpdateHandler } from 'AIJourney/hooks'
import { buildScheduledDatetime } from 'AIJourney/pages/AiJourneyOnboarding/AiJourneyOnboarding'
import type { SetupFormValues } from 'AIJourney/pages/Setup/Setup'
import { useJourneyContext } from 'AIJourney/providers'
import { getScheduleDefaults } from 'AIJourney/utils/getScheduleDefaults'

const SCHEDULE_TYPE_IMMEDIATE = 'immediate'
const SCHEDULE_TYPE_LATER = 'later'
const MAX_SCHEDULE_DAYS = 30

type Props = {
    isOpen: boolean
    onClose: () => void
}

export const ScheduleCampaignPanel = ({ isOpen, onClose }: Props) => {
    const {
        journeyData,
        currentIntegration,
        isLoading: isLoadingContext,
    } = useJourneyContext()
    const { control, setValue, getValues } = useFormContext<SetupFormValues>()
    const [isReady, setIsReady] = useState(false)

    const scheduleType = useWatch({ control, name: 'scheduleType' })
    const scheduledDate = useWatch({ control, name: 'scheduledDate' })
    const scheduledTime = useWatch({ control, name: 'scheduledTime' })

    const { handleUpdate, isLoading } = useJourneyUpdateHandler({
        integrationId: currentIntegration?.id,
        journeyId: journeyData?.id,
        entityLabel: 'campaign',
    })

    useEffect(() => {
        if (!isLoadingContext && !isReady) {
            const defaults = getScheduleDefaults(
                journeyData?.campaign?.scheduled_datetime ?? undefined,
            )
            setValue('scheduleType', defaults.scheduleType, {
                shouldDirty: false,
            })
            if (defaults.scheduledDate) {
                setValue('scheduledDate', defaults.scheduledDate, {
                    shouldDirty: false,
                })
            }
            if (defaults.scheduledTime) {
                setValue('scheduledTime', defaults.scheduledTime, {
                    shouldDirty: false,
                })
            }
            setIsReady(true)
        }
    }, [isLoadingContext, isReady, journeyData, setValue])

    const handleScheduleTypeChange = useCallback(
        (value: string) => {
            setValue('scheduleType', value as 'immediate' | 'later', {
                shouldDirty: true,
            })
        },
        [setValue],
    )

    const handleDateChange = useCallback(
        (value: ZonedDateTime | null) => {
            setValue('scheduledDate', value, { shouldDirty: true })
            if (value && !scheduledTime) {
                setValue('scheduledTime', new TimeValue(10, 0), {
                    shouldDirty: true,
                })
            }
        },
        [setValue, scheduledTime],
    )

    const handleTimeChange = useCallback(
        (value: unknown) => {
            setValue(
                'scheduledTime',
                value as SetupFormValues['scheduledTime'],
                { shouldDirty: true },
            )
        },
        [setValue],
    )

    const isDateUnavailable = useCallback((date: DateValue) => {
        const tz = getLocalTimeZone()
        const now = today(tz)
        const maxDate = now.add({ days: MAX_SCHEDULE_DAYS })
        return date.compare(now) < 0 || date.compare(maxDate) > 0
    }, [])

    const handleSendCampaign = async () => {
        const scheduledDatetime = buildScheduledDatetime(getValues)
        if (scheduleType === SCHEDULE_TYPE_LATER) {
            await handleUpdate({
                campaignState: UpdatableJourneyCampaignState.Scheduled,
                scheduledDatetime,
            })
        } else {
            await handleUpdate({
                campaignState: UpdatableJourneyCampaignState.Active,
                scheduledDatetime: null,
            })
        }
        onClose()
    }

    const isMissingAudience =
        !journeyData?.included_audience_list_ids ||
        journeyData.included_audience_list_ids.length === 0
    const isMissingMessageGuidance = !journeyData?.message_instructions
    const showWarningBanner = isMissingAudience || isMissingMessageGuidance

    const isSendDisabled =
        isLoading ||
        (scheduleType === SCHEDULE_TYPE_LATER &&
            (!scheduledDate || !scheduledTime)) ||
        showWarningBanner

    return (
        <SidePanel
            size="sm"
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <OverlayHeader title="Schedule campaign" />
            <OverlayContent>
                <Box flexDirection="column" gap="md">
                    {showWarningBanner && (
                        <Banner
                            intent="warning"
                            icon="warning-triangle"
                            isClosable={false}
                            title="Campaign is not ready to send"
                            description={
                                <ul
                                    style={{
                                        margin: 0,
                                        paddingLeft: 'var(--spacing-md)',
                                    }}
                                >
                                    {isMissingAudience && (
                                        <li>
                                            Add an audience in the Setup step
                                        </li>
                                    )}
                                    {isMissingMessageGuidance && (
                                        <li>
                                            Add message guidance in the
                                            Instructions field
                                        </li>
                                    )}
                                </ul>
                            }
                            size="md"
                        />
                    )}
                    <RadioGroup
                        value={scheduleType ?? SCHEDULE_TYPE_IMMEDIATE}
                        onChange={handleScheduleTypeChange}
                    >
                        <Box flexDirection="column" gap="sm">
                            <RadioCard
                                value={SCHEDULE_TYPE_IMMEDIATE}
                                title="Send now"
                                description="Start sending campaign immediately"
                            />
                            <RadioCard
                                value={SCHEDULE_TYPE_LATER}
                                title="Schedule"
                                description="Choose a date and time to schedule"
                            />
                        </Box>
                    </RadioGroup>
                    {scheduleType === SCHEDULE_TYPE_LATER && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 'var(--spacing-md)',
                            }}
                        >
                            <DateField
                                label="Date"
                                isRequired
                                value={scheduledDate}
                                onChange={handleDateChange}
                                isDateUnavailable={isDateUnavailable}
                            />
                            <TimeField
                                label="Time"
                                isRequired
                                value={scheduledTime}
                                onChange={handleTimeChange}
                            />
                        </div>
                    )}
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Button
                    onClick={handleSendCampaign}
                    isDisabled={isSendDisabled}
                >
                    {scheduleType === SCHEDULE_TYPE_LATER
                        ? 'Schedule campaign'
                        : 'Send campaign'}
                </Button>
            </OverlayFooter>
        </SidePanel>
    )
}
