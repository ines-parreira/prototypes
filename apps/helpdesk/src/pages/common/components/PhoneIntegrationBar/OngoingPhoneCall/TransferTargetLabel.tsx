import VoiceCallAgentLabel from '../../VoiceCallAgentLabel/VoiceCallAgentLabel'
import VoiceCallCustomerLabel from '../../VoiceCallCustomerLabel/VoiceCallCustomerLabel'
import { TransferTarget, TransferType } from './types'

import css from './OngoingPhoneCall.less'

type TransferTargetLabelProps = {
    transferringTo: TransferTarget
}

export const TransferTargetLabel = ({
    transferringTo,
}: TransferTargetLabelProps) => (
    <>
        {transferringTo.type === TransferType.Agent && (
            <div className={css.callerDetails}>
                Transferring call to
                <VoiceCallAgentLabel agentId={transferringTo.id} />
            </div>
        )}
        {transferringTo.type === TransferType.External && (
            <div className={css.callerDetails}>
                Transferring call to
                {transferringTo.customer ? (
                    <VoiceCallCustomerLabel
                        customerId={transferringTo.customer.id}
                        customerName={transferringTo.customer.name}
                        phoneNumber={transferringTo.value}
                        showBothNameAndPhone
                    />
                ) : (
                    <b>{transferringTo.value}</b>
                )}
            </div>
        )}
    </>
)
