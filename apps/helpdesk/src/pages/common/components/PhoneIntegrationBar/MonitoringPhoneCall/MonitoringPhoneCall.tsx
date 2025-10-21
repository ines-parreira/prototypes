import { Call } from '@twilio/voice-sdk'

import { LegacyButton as Button } from '@gorgias/axiom'

import PhoneBarContainer from '../PhoneBarContainer/PhoneBarContainer'
import PhoneBarInnerContent from '../PhoneBarInnerContent/PhoneBarInnerContent'

type Props = {
    call: Call
}

export default function MonitoringPhoneCall({ call }: Props): JSX.Element {
    return (
        <PhoneBarContainer>
            <PhoneBarInnerContent>
                <Button intent="secondary" onClick={() => call.disconnect()}>
                    <i className="material-icons mr-2">call_end</i>
                    End Call
                </Button>
            </PhoneBarInnerContent>
        </PhoneBarContainer>
    )
}
