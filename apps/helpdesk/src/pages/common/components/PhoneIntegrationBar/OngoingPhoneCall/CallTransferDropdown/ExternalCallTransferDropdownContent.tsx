import type { UserSearchResult } from 'models/search/types'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import PhoneDeviceDialerInput from 'pages/integrations/integration/components/phone/PhoneDeviceDialerInput'
import usePhoneNumbers from 'pages/integrations/integration/components/phone/usePhoneNumbers'

import css from './CallTransferDropdown.less'

type Props = {
    phoneNumber: string
    customer?: UserSearchResult
    setSelectedExternalPhoneNumber: (
        phoneNumber: string,
        customer?: UserSearchResult,
    ) => void
    handleTransferCall?: () => void
    onPhoneNumberValidationChange?: (isValid: boolean) => void
    integrationPhoneNumberId?: number
}

const ExternalCallTransferDropdownContent = ({
    phoneNumber,
    customer,
    setSelectedExternalPhoneNumber,
    handleTransferCall,
    onPhoneNumberValidationChange,
    integrationPhoneNumberId,
}: Props) => {
    const { getCountryFromPhoneNumberId } = usePhoneNumbers()

    const initialCountry = integrationPhoneNumberId
        ? getCountryFromPhoneNumberId(integrationPhoneNumberId)
        : undefined

    return (
        <DropdownBody className={css.externalDropdownBody}>
            <PhoneDeviceDialerInput
                value={{ phoneNumber, customer }}
                onValueChange={setSelectedExternalPhoneNumber}
                onConfirm={handleTransferCall}
                onValidationChange={onPhoneNumberValidationChange}
                country={initialCountry}
            />
        </DropdownBody>
    )
}

export default ExternalCallTransferDropdownContent
