import { UserSearchResult } from 'models/search/types'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import PhoneDeviceDialerInput from 'pages/integrations/integration/components/phone/PhoneDeviceDialerInput'

type Props = {
    setSelectedExternalPhoneNumber: (
        phoneNumber: string,
        customer?: UserSearchResult,
    ) => void
    handleTransferCall?: () => void
}

const ExternalCallTransferDropdownContent = ({
    setSelectedExternalPhoneNumber,
    handleTransferCall,
}: Props) => {
    return (
        <DropdownBody>
            <PhoneDeviceDialerInput
                onValueChange={setSelectedExternalPhoneNumber}
                onConfirm={handleTransferCall}
            />
        </DropdownBody>
    )
}

export default ExternalCallTransferDropdownContent
