import { UserSearchResult } from 'models/search/types'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import PhoneDeviceDialerInput from 'pages/integrations/integration/components/phone/PhoneDeviceDialerInput'

import css from './CallTransferDropdown.less'

type Props = {
    setSelectedExternalPhoneNumber: (
        phoneNumber: string,
        customer?: UserSearchResult,
    ) => void
    handleTransferCall?: () => void
    onPhoneNumberValidationChange?: (isValid: boolean) => void
}

const ExternalCallTransferDropdownContent = ({
    setSelectedExternalPhoneNumber,
    handleTransferCall,
    onPhoneNumberValidationChange,
}: Props) => {
    return (
        <DropdownBody className={css.externalDropdownBody}>
            <PhoneDeviceDialerInput
                onValueChange={setSelectedExternalPhoneNumber}
                onConfirm={handleTransferCall}
                onValidationChange={onPhoneNumberValidationChange}
            />
        </DropdownBody>
    )
}

export default ExternalCallTransferDropdownContent
