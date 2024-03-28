import React from 'react'

import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {Sender} from 'hooks/useOutboundChannels'

import ReconnectButton from './ReconnectButton'
import css from './SenderDropDownItem.less'

const SenderDropDownItem = ({
    sender,
    onSelect,
}: {
    sender: Sender
    onSelect: (sender: Sender) => void
}) => {
    return (
        <DropdownItem
            key={sender.address}
            className={css.item}
            data-testid={`${sender.name}-item`}
            option={{
                label: sender.displayName,
                value: sender.address,
            }}
            onClick={() => onSelect(sender)}
            isDisabled={sender?.isDeactivated}
            shouldCloseOnSelect
        >
            <span className={css.label}>{sender.displayName}</span>
            {sender.isDeactivated && (
                <ReconnectButton channel={sender?.channel} />
            )}
        </DropdownItem>
    )
}

export default SenderDropDownItem
