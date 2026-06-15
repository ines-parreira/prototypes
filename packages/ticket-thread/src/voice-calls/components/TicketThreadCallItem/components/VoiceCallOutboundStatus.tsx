import {
    Box,
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
    DropdownIcon,
    Text,
} from '@gorgias/axiom'
import type { VoiceCall } from '@gorgias/helpdesk-queries'

import { getOutboundDisplayStatus } from '../../../models/statusMapping'
import { VoiceCallDisplayStatus } from '../../../models/types'
import { VoiceCallCustomerLabel } from './VoiceCallCustomerLabel'
import { VoiceCallDuration } from './VoiceCallDuration'
import { VoiceCallEvents } from './VoiceCallEvents'

import css from './VoiceCallOutboundStatus.less'

type VoiceCallOutboundStatusProps = {
    voiceCall: VoiceCall
}

export function VoiceCallOutboundStatus({
    voiceCall,
}: VoiceCallOutboundStatusProps) {
    const displayStatus = getOutboundDisplayStatus(voiceCall.status)

    switch (displayStatus) {
        case VoiceCallDisplayStatus.Ringing:
            return (
                <Box
                    flexDirection="row"
                    alignItems="center"
                    className={css.flexWrapPreWrap}
                >
                    <Text as="span" color="content-neutral-secondary">
                        Waiting for{' '}
                    </Text>
                    <VoiceCallCustomerLabel
                        customerId={voiceCall.customer_id ?? 0}
                        phoneNumber={voiceCall.phone_number_destination}
                    />
                    <Text as="span" color="content-neutral-secondary">
                        ...
                    </Text>
                </Box>
            )
        case VoiceCallDisplayStatus.Failed:
            return (
                <Text color="content-error-default">
                    <Text as="span" variant="bold">
                        Failed:{' '}
                    </Text>
                    Our provider&apos;s carriers could not connect the call.
                    Possible causes include dialing a number that is no longer
                    in service, inputting a number incorrectly or dialing a
                    number with poor reputation.
                </Text>
            )
        case VoiceCallDisplayStatus.InProgress:
        case VoiceCallDisplayStatus.Answered:
            return (
                <Disclosure width="100%">
                    <DisclosureHeader
                        title={({ isExpanded }) => (
                            <Box
                                flexDirection="row"
                                alignItems="center"
                                className={css.flexWrapPreWrap}
                            >
                                <Text
                                    as="span"
                                    color="content-neutral-secondary"
                                >
                                    Answered by{' '}
                                </Text>
                                <VoiceCallCustomerLabel
                                    customerId={voiceCall.customer_id ?? 0}
                                    phoneNumber={
                                        voiceCall.phone_number_destination
                                    }
                                />
                                <Text
                                    as="span"
                                    color="content-neutral-secondary"
                                >
                                    .{' '}
                                </Text>
                                <VoiceCallDuration voiceCall={voiceCall} />
                                <DropdownIcon isOpen={isExpanded} size="sm" />
                            </Box>
                        )}
                        trailingSlot={null}
                    />
                    <DisclosurePanel pt="xs">
                        <VoiceCallEvents callId={voiceCall.id} />
                    </DisclosurePanel>
                </Disclosure>
            )
        case VoiceCallDisplayStatus.Unanswered:
            return (
                <Box
                    flexDirection="row"
                    alignItems="center"
                    className={css.flexWrapPreWrap}
                >
                    <Text as="span" color="content-error-default">
                        Unanswered by{' '}
                    </Text>
                    <VoiceCallCustomerLabel
                        customerId={voiceCall.customer_id ?? 0}
                        phoneNumber={voiceCall.phone_number_destination}
                    />
                </Box>
            )
        default:
            return null
    }
}
