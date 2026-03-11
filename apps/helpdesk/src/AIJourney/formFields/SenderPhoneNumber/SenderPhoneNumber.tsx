import { Controller, useFormContext } from 'react-hook-form'

import { Box, ListItem, SelectField } from '@gorgias/axiom'

import { useAiJourneyPhoneList } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'

type optionType = {
    id: number | undefined
    label: string | undefined
}

export const SenderPhoneNumber = () => {
    const { control } = useFormContext()
    const { storeConfiguration } = useJourneyContext()

    const { marketingCapabilityPhoneNumbers } = useAiJourneyPhoneList(
        storeConfiguration?.monitoredSmsIntegrations ?? [],
    )

    const phoneNumberOptions: optionType[] =
        marketingCapabilityPhoneNumbers.map((phone) => ({
            id: phone.integrations[0].id,
            label: phone.phone_number_friendly,
        }))

    return (
        <Box flexDirection="column" gap="xxs">
            <Controller
                name="sms_sender_integration_id"
                control={control}
                render={({ field }) => {
                    const currentPhoneNumber =
                        marketingCapabilityPhoneNumbers.find(
                            (phoneNumber) =>
                                phoneNumber.integrations.find(
                                    (integration) => integration.type === 'sms',
                                )?.id === field.value,
                        )

                    const currentPhoneNumberOtion = {
                        id: currentPhoneNumber?.integrations[0].id,
                        label: currentPhoneNumber?.phone_number_friendly,
                    }

                    return (
                        <SelectField
                            isRequired
                            label="Send from"
                            caption="Shoppers will see this as the sender"
                            placeholder="Select phone number"
                            items={phoneNumberOptions}
                            value={field.value ?? currentPhoneNumberOtion}
                            onChange={field.onChange}
                        >
                            {(option: optionType) => (
                                <ListItem
                                    key={`phone-number-option-${option.id}`}
                                    label={option.label}
                                />
                            )}
                        </SelectField>
                    )
                }}
            />
        </Box>
    )
}
