import { Button } from '@gorgias/axiom'

import PhoneDeviceDialerInput from 'pages/integrations/integration/components/phone/PhoneDeviceDialerInput'

import PhoneDeviceDialerIntegrationSelect from './PhoneDeviceDialerIntegrationSelect'
import usePhoneDeviceDialer from './usePhoneDeviceDialer'

import css from './PhoneDevice.less'

type Props = {
    onCallInitiated: () => void
}

export default function PhoneDeviceDialer({ onCallInitiated }: Props) {
    const {
        isPhoneNumberValid,
        setIsPhoneNumberValid,
        setSelectedNumberAndCustomer,
        country,
        setCountry,
        phoneIntegrations,
        selectedIntegration,
        setSelectedIntegration,
        handleCall,
    } = usePhoneDeviceDialer({ onCallInitiated })

    return (
        <div className={css.dialerWrapper}>
            <PhoneDeviceDialerInput
                onValueChange={setSelectedNumberAndCustomer}
                onValidationChange={setIsPhoneNumberValid}
                onConfirm={handleCall}
                country={country}
                onCountryChange={setCountry}
            />

            <div className={css.buttons}>
                <PhoneDeviceDialerIntegrationSelect
                    value={selectedIntegration}
                    options={phoneIntegrations}
                    onChange={setSelectedIntegration}
                />
                <Button onClick={handleCall} isDisabled={!isPhoneNumberValid}>
                    Call
                </Button>
            </div>
        </div>
    )
}
