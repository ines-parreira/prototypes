import { Box } from '@gorgias/axiom'

import { SmsSenderSelect } from 'AIJourney/formFields/SmsSenderSelect/SmsSenderSelect'
import { useJourneyContext } from 'AIJourney/providers'

export const SenderPhoneNumber = () => {
    const { storeConfiguration } = useJourneyContext()

    return (
        <Box flexDirection="column" gap="xxs" width="100%">
            <SmsSenderSelect
                isRequired
                name="sms_sender_integration_id"
                label="Send from"
                caption="Shoppers will see this as the sender"
                monitoredSmsIntegrations={
                    storeConfiguration?.monitoredSmsIntegrations ?? []
                }
                getSelectedIntegrationId={(fieldValue) =>
                    (fieldValue as { id?: number | null } | null)?.id
                }
                mapOptionToFieldValue={(option) => ({
                    id: option.id,
                    label: option.phoneNumber,
                })}
            />
        </Box>
    )
}
