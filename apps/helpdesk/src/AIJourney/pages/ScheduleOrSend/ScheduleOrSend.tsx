import { useCallback, useEffect, useState } from 'react'

import type { DateValue, ZonedDateTime } from '@internationalized/date'
import {
    getLocalTimeZone,
    Time as TimeValue,
    today,
} from '@internationalized/date'
import { useFormContext, useWatch } from 'react-hook-form'
import { useHistory } from 'react-router-dom'

import {
    Banner,
    Box,
    Card,
    CardHeader,
    DateField,
    Link,
    RadioCard,
    RadioGroup,
    Skeleton,
    Text,
    TimeField,
} from '@gorgias/axiom'

import { useJourneyContext } from 'AIJourney/providers'
import { getScheduleDefaults } from 'AIJourney/utils/getScheduleDefaults'

import type { SetupFormValues } from '../Setup/Setup'

const SCHEDULE_TYPE_IMMEDIATE = 'immediate'
const SCHEDULE_TYPE_LATER = 'later'
const MAX_SCHEDULE_DAYS = 30

type Props = {
    isV3Architecture?: boolean
}

export const ScheduleOrSend = ({ isV3Architecture = false }: Props) => {
    const {
        journeyData,
        isLoading: isLoadingJourneyData,
        shopName,
    } = useJourneyContext()
    const { control, setValue } = useFormContext<SetupFormValues>()
    const history = useHistory()
    const [isReady, setIsReady] = useState(false)

    const scheduleType = useWatch({ control, name: 'scheduleType' })
    const scheduledDate = useWatch({ control, name: 'scheduledDate' })
    const scheduledTime = useWatch({ control, name: 'scheduledTime' })

    useEffect(() => {
        if (!isLoadingJourneyData && !isReady) {
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
    }, [isLoadingJourneyData, isReady, journeyData, setValue])

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
                {
                    shouldDirty: true,
                },
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

    const isMissingAudience =
        !journeyData?.included_audience_list_ids ||
        journeyData.included_audience_list_ids.length === 0
    const isMissingMessageGuidance = !journeyData?.message_instructions
    const showWarningBanner = isMissingAudience || isMissingMessageGuidance

    if (!isReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton
                    width={isV3Architecture ? undefined : 680}
                    height={200}
                />
            </Box>
        )
    }

    const warningBanner = showWarningBanner ? (
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
                        <li>Add an audience in the Setup step</li>
                    )}
                    {isMissingMessageGuidance && (
                        <li>Add message guidance in the Preview step</li>
                    )}
                </ul>
            }
            size="md"
        />
    ) : null

    const radioGroup = (
        <RadioGroup
            value={scheduleType ?? SCHEDULE_TYPE_LATER}
            onChange={handleScheduleTypeChange}
            width={isV3Architecture ? '100%' : undefined}
        >
            {isV3Architecture ? (
                <Box flexDirection="column" gap="sm" width="100%">
                    <RadioCard
                        value={SCHEDULE_TYPE_LATER}
                        title="Schedule"
                        description="Pick a date and time to send"
                    />
                    <RadioCard
                        value={SCHEDULE_TYPE_IMMEDIATE}
                        title="Send now"
                        description="Send immediately"
                    />
                </Box>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 'var(--spacing-md)',
                        width: '100%',
                    }}
                >
                    <RadioCard
                        value={SCHEDULE_TYPE_LATER}
                        title="Schedule"
                        description="Pick a date and time to send"
                    />
                    <RadioCard
                        value={SCHEDULE_TYPE_IMMEDIATE}
                        title="Send now"
                        description="Send immediately"
                    />
                </div>
            )}
        </RadioGroup>
    )

    const dateTimeFields = scheduleType === SCHEDULE_TYPE_LATER && (
        <Box gap="md" paddingTop="md" width="fit-content">
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
        </Box>
    )

    const settingsLink = (
        <Text size="sm" color="content-neutral-secondary">
            The scheduled time is based on your timezone. Messages to recipients
            within their local quiet hours will be held and delivered once quiet
            hours end. You can adjust quiet hours in{' '}
            <Link
                size="sm"
                onClick={() =>
                    history.push(
                        `/app/ai-journey/${shopName}/settings#compliance`,
                    )
                }
            >
                Settings
            </Link>
            .
        </Text>
    )

    if (isV3Architecture) {
        return (
            <Box flexDirection="column" gap="md" width="100%">
                {warningBanner}
                {radioGroup}
                {dateTimeFields}
                {settingsLink}
            </Box>
        )
    }

    return (
        <>
            {warningBanner}
            <Card width={680}>
                <CardHeader title="Choose when to send" />
                {radioGroup}
                {dateTimeFields}
            </Card>
            <Box width={680}>{settingsLink}</Box>
        </>
    )
}
