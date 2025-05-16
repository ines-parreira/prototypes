import { ActiveContent, Navbar } from 'common/navigation'
import { VoiceOfCustomerNavbarView } from 'pages/stats/voice-of-customer/VoiceOfCustomerNavbarView'

import { VOICE_OF_CUSTOMER_SECTION_NAME } from './utils'

export function VoiceOfCustomerNavbarContainer() {
    return (
        <Navbar
            activeContent={ActiveContent.VoiceOfCustomer}
            title={VOICE_OF_CUSTOMER_SECTION_NAME}
        >
            <VoiceOfCustomerNavbarView />
        </Navbar>
    )
}
