import { ActiveContent, Navbar } from 'common/navigation'
import { VOICE_OF_CUSTOMER_SECTION_NAME } from 'pages/stats/voice-of-customer/constants'
import { VoiceOfCustomerNavbarView } from 'pages/stats/voice-of-customer/VoiceOfCustomerNavbarView'

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
