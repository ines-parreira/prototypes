import { useFormContext, useWatch } from 'react-hook-form'

import {
    Box,
    Card,
    CardHeader,
    Icon,
    Skeleton,
    ToggleField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { KlaviyoPermissionBanner } from 'AIJourney/components/KlaviyoPermissionBanner/KlaviyoPermissionBanner'
import { AudienceSelect } from 'AIJourney/formFields'
import { useJourneyContext } from 'AIJourney/providers'

type Props = {
    isFormReady: boolean
    isV3Architecture?: boolean
    isAudienceRequired?: boolean
}

export const AudienceCard = ({
    isFormReady,
    isV3Architecture = false,
    isAudienceRequired = false,
}: Props) => {
    const { currentIntegration, shopName } = useJourneyContext()
    const { control, setValue } = useFormContext()

    const isAudienceEnabled =
        useWatch({ control, name: 'narrow_audience_enabled' }) ?? false

    const handleAudienceToggle = (value: boolean) => {
        setValue('narrow_audience_enabled', value, { shouldDirty: true })
    }

    if (!isFormReady) {
        return (
            <Box flexDirection="column" gap="lg">
                <Skeleton
                    width={isV3Architecture ? undefined : 680}
                    height={200}
                />
            </Box>
        )
    }

    if (isV3Architecture) {
        if (isAudienceRequired) {
            return (
                <Box flexDirection="column" gap="sm" width="100%">
                    <KlaviyoPermissionBanner
                        integrationId={currentIntegration?.id}
                        settingsUrl={`/app/ai-journey/${shopName}/settings/integrations`}
                    />
                    <AudienceSelect type="include" isRequired />
                    <AudienceSelect type="exclude" />
                </Box>
            )
        }

        return (
            <Box flexDirection="column" gap="xs" width="100%">
                <Box flexDirection="row" alignItems="center" gap="xxs">
                    <ToggleField
                        value={isAudienceEnabled}
                        onChange={handleAudienceToggle}
                        label="Narrow down audience"
                        aria-label="Narrow down audience"
                    />
                    <span>
                        <Tooltip delay={0} trigger={<Icon name="info" />}>
                            <TooltipContent title="By default, every shopper who triggers this flow gets the message. Add filters to target a specific group." />
                        </Tooltip>
                    </span>
                </Box>
                {isAudienceEnabled && (
                    <Box flexDirection="column" gap="sm" width="100%">
                        <KlaviyoPermissionBanner
                            integrationId={currentIntegration?.id}
                            settingsUrl={`/app/ai-journey/${shopName}/settings/integrations`}
                        />
                        <AudienceSelect type="include" />
                        <AudienceSelect type="exclude" />
                    </Box>
                )}
            </Box>
        )
    }

    return (
        <Card width={680}>
            <Box flexDirection="column" gap="md">
                <CardHeader title="Audience" />
                <KlaviyoPermissionBanner
                    integrationId={currentIntegration?.id}
                    settingsUrl={`/app/ai-journey/${shopName}/settings/integrations`}
                />
                <AudienceSelect
                    type="include"
                    isRequired={isAudienceRequired}
                />
                <AudienceSelect type="exclude" />
            </Box>
        </Card>
    )
}
