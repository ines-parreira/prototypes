import { Controller, useFormContext } from 'react-hook-form'

import { Box, Card, CardHeader, Skeleton, TextField } from '@gorgias/axiom'

import { SmsSenderSelect } from 'AIJourney/formFields'
import { useJourneyContext } from 'AIJourney/providers'

export const IdentitySettingsCard = ({
    isFormReady,
}: {
    isFormReady: boolean
}) => {
    const { control } = useFormContext()
    const { storeConfiguration } = useJourneyContext()
    const monitoredSmsIntegrations =
        storeConfiguration?.monitoredSmsIntegrations ?? []

    if (!isFormReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton width={610} height={200} />
            </Box>
        )
    }

    return (
        <Card gap="lg" width={610}>
            <CardHeader title="Identity settings" />
            <Box flexDirection="column" gap="md">
                <SmsSenderSelect
                    monitoredSmsIntegrations={monitoredSmsIntegrations}
                />
                <Controller
                    name="brand_name"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label="Brand name"
                            value={field.value}
                            onChange={field.onChange}
                            caption="Shoppers will see this name as part of the greeting."
                        />
                    )}
                />
            </Box>
        </Card>
    )
}
