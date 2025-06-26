import { ActiveContent, Navbar } from 'common/navigation'
import { VoiceOfCustomerNavbarView } from 'pages/stats/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerNavbarView'
import { VOICE_OF_CUSTOMER_SECTION_NAME } from 'pages/stats/voice-of-customer/constants'

export function VoiceOfCustomerNavbarContainer() {
    return (
        <Navbar
            activeContent={ActiveContent.VoiceOfCustomer}
            title={VOICE_OF_CUSTOMER_SECTION_NAME}
            headerContent={''}
        >
            <VoiceOfCustomerNavbarView />
        </Navbar>
    )
}
