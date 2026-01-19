import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { Call } from '@twilio/voice-sdk'

import { Box, Button, LegacyButton, Text } from '@gorgias/axiom'

import { useCallStatus } from 'hooks/integrations/phone/useCallStatus'
import PhoneBarCallerDetailsContainer from 'pages/common/components/PhoneIntegrationBar/PhoneBarCallerDetailsContainer/PhoneBarCallerDetailsContainer'
import PhoneCustomerName from 'pages/common/components/PhoneIntegrationBar/PhoneCustomerName/PhoneCustomerName'
import PhoneInfobarWrapper from 'pages/common/components/PhoneIntegrationBar/PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneIntegrationName from 'pages/common/components/PhoneIntegrationBar/PhoneIntegrationName/PhoneIntegrationName'

import { useConnectionParameters } from '../hooks'
import PhoneBarContainer from '../PhoneBarContainer/PhoneBarContainer'
import PhoneBarInnerContent from '../PhoneBarInnerContent/PhoneBarInnerContent'

import css from './OutgoingPhoneCall.less'

type Props = {
    call: Call
}

export default function OutgoingPhoneCall({ call }: Props): JSX.Element {
    const { integrationId, customerName, customerPhoneNumber } =
        useConnectionParameters(call)
    const status = useCallStatus(call)
    const applyCallBarRestyling = useFlag(FeatureFlagKey.CallBarRestyling)

    if (applyCallBarRestyling) {
        return (
            <PhoneBarContainer>
                <PhoneBarInnerContent>
                    <PhoneBarCallerDetailsContainer>
                        <Box gap="lg" alignItems="center">
                            <PhoneIntegrationName
                                integrationId={integrationId}
                                primary
                            />
                            <PhoneCustomerName
                                name={customerName}
                                phoneNumber={customerPhoneNumber}
                            />
                        </Box>
                    </PhoneBarCallerDetailsContainer>
                    <Button
                        intent="destructive"
                        aria-label="End phone call"
                        onClick={() => call.disconnect()}
                        leadingSlot="comm-phone-end"
                    >
                        End Call
                    </Button>
                </PhoneBarInnerContent>
                <PhoneInfobarWrapper>
                    <Text variant="bold">Outgoing call...</Text>
                </PhoneInfobarWrapper>
            </PhoneBarContainer>
        )
    }

    return (
        <PhoneBarContainer isHighlighted>
            <PhoneBarInnerContent>
                <PhoneBarCallerDetailsContainer>
                    <Box gap="xs" alignItems="center">
                        <PhoneIntegrationName
                            integrationId={integrationId}
                            primary
                        />
                        <span>Outgoing call to</span>
                        <PhoneCustomerName
                            name={customerName}
                            phoneNumber={customerPhoneNumber}
                        />
                    </Box>
                </PhoneBarCallerDetailsContainer>

                <LegacyButton
                    intent="secondary"
                    className={css.end}
                    onClick={() => call.disconnect()}
                >
                    <i className="material-icons mr-2">call_end</i>
                    End Call
                </LegacyButton>
            </PhoneBarInnerContent>
            <PhoneInfobarWrapper primary>
                <span className="text-capitalize">{status}...</span>
            </PhoneInfobarWrapper>
        </PhoneBarContainer>
    )
}
