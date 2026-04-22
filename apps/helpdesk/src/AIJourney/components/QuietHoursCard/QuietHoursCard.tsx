import { Controller, useFormContext, useWatch } from 'react-hook-form'

import {
    Box,
    Card,
    CardHeader,
    Skeleton,
    Text,
    TimeField,
} from '@gorgias/axiom'

import { formatHHMM, parseHHMM } from './quietHoursUtils'

const TIME_COLLISION_ERROR = 'Start and end times cannot be the same'
const BOTH_REQUIRED_ERROR = 'Both times must be set or both must be empty'

export const QuietHoursCard = ({ isFormReady }: { isFormReady: boolean }) => {
    const { control } = useFormContext()

    const quietHoursStart = useWatch({ control, name: 'quiet_hours_start' })
    const quietHoursEnd = useWatch({ control, name: 'quiet_hours_end' })

    const hasCollision =
        quietHoursStart !== null &&
        quietHoursEnd !== null &&
        quietHoursStart === quietHoursEnd
    const startMissingEndSet =
        quietHoursStart === null && quietHoursEnd !== null
    const endMissingStartSet =
        quietHoursEnd === null && quietHoursStart !== null

    if (!isFormReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton width={610} height={200} />
            </Box>
        )
    }

    return (
        <Card gap="lg" width={610}>
            <CardHeader
                title="Quiet hours"
                description={
                    <Text color="content-neutral-secondary">
                        AI Journey pauses SMS between the hours below, based on
                        each recipient&apos;s phone number timezone.
                    </Text>
                }
            />
            <Box flexDirection="row" gap="lg" width="fit-content">
                <Box width={111}>
                    <Controller
                        name="quiet_hours_start"
                        control={control}
                        rules={{
                            validate: (value, formValues) => {
                                if (!value && formValues.quiet_hours_end)
                                    return BOTH_REQUIRED_ERROR
                                if (
                                    value &&
                                    formValues.quiet_hours_end &&
                                    value === formValues.quiet_hours_end
                                )
                                    return TIME_COLLISION_ERROR
                                return true
                            },
                        }}
                        render={({ field }) => (
                            <TimeField
                                label="Stop sending"
                                value={parseHHMM(field.value)}
                                onChange={(timeValue) =>
                                    field.onChange(formatHHMM(timeValue))
                                }
                                isInvalid={hasCollision || startMissingEndSet}
                                error={
                                    hasCollision
                                        ? TIME_COLLISION_ERROR
                                        : startMissingEndSet
                                          ? BOTH_REQUIRED_ERROR
                                          : undefined
                                }
                            />
                        )}
                    />
                </Box>
                <Box width={111}>
                    <Controller
                        name="quiet_hours_end"
                        control={control}
                        rules={{
                            validate: (value, formValues) => {
                                if (!value && formValues.quiet_hours_start)
                                    return BOTH_REQUIRED_ERROR
                                if (
                                    value &&
                                    formValues.quiet_hours_start &&
                                    value === formValues.quiet_hours_start
                                )
                                    return TIME_COLLISION_ERROR
                                return true
                            },
                        }}
                        render={({ field }) => (
                            <TimeField
                                label="Resume sending"
                                value={parseHHMM(field.value)}
                                onChange={(timeValue) =>
                                    field.onChange(formatHHMM(timeValue))
                                }
                                isInvalid={hasCollision || endMissingStartSet}
                                error={
                                    hasCollision
                                        ? TIME_COLLISION_ERROR
                                        : endMissingStartSet
                                          ? BOTH_REQUIRED_ERROR
                                          : undefined
                                }
                            />
                        )}
                    />
                </Box>
            </Box>
        </Card>
    )
}
