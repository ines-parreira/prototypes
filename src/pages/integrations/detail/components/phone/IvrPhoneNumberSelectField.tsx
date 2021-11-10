import React, {useCallback} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {useParams} from 'react-router-dom'

import {
    PhoneIntegration,
    IntegrationType,
    IvrForwardCall,
} from '../../../../../models/integration/types'
import {RootState} from '../../../../../state/types'
import {getIntegrationsByTypes} from '../../../../../state/integrations/selectors'
import SelectField from '../../../../common/forms/SelectField/SelectField'

type OwnProps = {
    value: IvrForwardCall
    onChange: (value: IvrForwardCall) => void
}
type Props = ConnectedProps<typeof connector> & OwnProps

const IvrPhoneNumberSelectField = ({
    integrations,
    value,
    onChange,
}: Props): JSX.Element => {
    const params = useParams<{integrationId: string}>()
    const currentIntegrationId = parseInt(params.integrationId)
    const availableIntegrations = integrations.filter(
        (integration) =>
            integration.id !== currentIntegrationId &&
            integration.meta.twilio?.incoming_phone_number
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
                onChange({
                    phone_number: integration.meta.twilio?.incoming_phone_number
                        .phone_number as string,
                    integration_id: integration.id,
                })
            }
        },
        [availableIntegrations, onChange]
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

const connector = connect((state: RootState) => ({
    integrations: getIntegrationsByTypes([IntegrationType.Phone])(
        state
    ).toJS() as PhoneIntegration[],
}))

export default connector(IvrPhoneNumberSelectField)
