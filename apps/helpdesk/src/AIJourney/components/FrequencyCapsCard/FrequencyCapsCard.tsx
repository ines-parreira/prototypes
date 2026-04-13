import { Controller, useFormContext } from 'react-hook-form'

import { Box, Card, CardHeader, Skeleton, ToggleField } from '@gorgias/axiom'

export const FrequencyCapsCard = ({
    isFormReady,
}: {
    isFormReady: boolean
}) => {
    const { control } = useFormContext()

    if (!isFormReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton width={610} height={200} />
            </Box>
        )
    }

    return (
        <Card gap="lg" width={610}>
            <CardHeader title="Frequency caps" />
            <Box flexDirection="column" gap="md">
                <Controller
                    name="texas_exclusion_enabled"
                    control={control}
                    render={({ field }) => (
                        <ToggleField
                            label="Automatically exclude Texas recipients"
                            value={field.value}
                            onChange={field.onChange}
                            caption="Texas law prohibits certain SMS marketing. Shoppers with Texas numbers won't receive your messages."
                        />
                    )}
                />
            </Box>
        </Card>
    )
}
