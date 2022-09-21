import React, {useCallback} from 'react'
import {useParams} from 'react-router-dom'

import {
    PhoneIntegration,
    IntegrationType,
    IvrForwardCall,
} from 'models/integration/types'
import {getIntegrationsByType} from 'state/integrations/selectors'
import {getPhoneNumbers} from 'state/entities/phoneNumbers/selectors'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import useAppSelector from 'hooks/useAppSelector'

type Props = {
    value: IvrForwardCall
    onChange: (value: IvrForwardCall) => void
}

const IvrPhoneNumberSelectField = ({value, onChange}: Props): JSX.Element => {
    const phoneIntegrations = useAppSelector(
        getIntegrationsByType<PhoneIntegration>(IntegrationType.Phone)
    )
    const phoneNumbers = useAppSelector(getPhoneNumbers)
    const params = useParams<{integrationId: string}>()
    const currentIntegrationId = parseInt(params.integrationId)
    const availableIntegrations = phoneIntegrations.filter(
        (integration) =>
            integration.id !== currentIntegrationId &&
            integration.meta.twilio_phone_number_id &&
            phoneNumbers[integration.meta.twilio_phone_number_id]
    )

    const options = availableIntegrations.map((integration) => ({
        value: integration.id,
        label: integration.name,
    }))

    const currentlySelectedOption = availableIntegrations.find(
        (integration) => integration.id === value.integration_id
    )?.id

    const handleChange = useCallback(
        (integrationId) => {
            const integration = availableIntegrations.find(
                (integration) => integration.id === integrationId
            )
            if (integration) {
                const phoneNumber =
                    phoneNumbers[integration.meta.twilio_phone_number_id]
                if (phoneNumber) {
                    onChange({
                        phone_number: phoneNumber.phone_number,
                        integration_id: integration.id,
                    })
                }
            }
        },
        [availableIntegrations, phoneNumbers, onChange]
    )
    return (
        <SelectField
            placeholder="Select number"
            onChange={handleChange}
            options={options}
            value={currentlySelectedOption}
            fullWidth
        />
    )
}

export default IvrPhoneNumberSelectField
