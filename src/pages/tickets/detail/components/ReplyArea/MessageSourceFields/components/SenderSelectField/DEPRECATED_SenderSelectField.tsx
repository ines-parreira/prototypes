import React from 'react'
import classnames from 'classnames'
import {SourceAddress} from 'models/ticket/types'
import {useSendersForSelectedChannel} from 'hooks/useOutboundChannels'

import {humanizeAddress} from 'state/ticket/utils'
import css from './DEPRECATED_SenderSelectField.less'

type Props = {
    tabIndex?: number
}

const SenderSelectField = ({tabIndex}: Props) => {
    const {selectedSender, selectedChannel, senders, selectSender} =
        useSendersForSelectedChannel()

    return (
        <div className={css.field}>
            <i className={classnames('material-icons', css.arrow)}>
                keyboard_arrow_down
            </i>
            <select
                className={css.select}
                value={selectedSender?.address}
                onChange={(event) => {
                    const sender = senders.find(
                        (sender) => sender.address === event.target.value
                    )
                    if (sender) {
                        selectSender(sender)
                    }
                }}
                tabIndex={tabIndex}
            >
                {senders
                    .filter((sender) => !sender?.isDeactivated)
                    .map((sender: SourceAddress) => (
                        <option key={sender.address} value={sender.address}>
                            {sender.name}{' '}
                            {sender.address &&
                                `(${humanizeAddress(
                                    sender.address,
                                    selectedChannel
                                )})`}
                        </option>
                    ))}
            </select>
        </div>
    )
}

export default SenderSelectField
