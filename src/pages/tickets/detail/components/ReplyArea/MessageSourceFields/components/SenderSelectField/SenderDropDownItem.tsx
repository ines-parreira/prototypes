import React from 'react'

import {useFlag} from 'common/flags'
import {Sender} from 'hooks/useOutboundChannels'
import DefaultIntegrationBadge from 'pages/integrations/integration/components/email/DefaultIntegrationBadge'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {FeatureFlagKey} from 'config/featureFlags'

import ReconnectButton from './ReconnectButton'
import css from './SenderDropDownItem.less'

const SenderDropDownItem = ({
    sender,
    onSelect,
}: {
    sender: Sender
    onSelect: (sender: Sender) => void
}) => {
    const isDefaultAddressFeatureEnabled = useFlag(
        FeatureFlagKey.DefaultEmailAddress,
        false
    )

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
            shouldCloseOnSelect
        >
            <span className={css.label}>
                {sender.displayName}
                {isDefaultAddressFeatureEnabled && sender?.isDefault && (
                    <DefaultIntegrationBadge />
                )}
            </span>
            {sender.isDeactivated && (
                <ReconnectButton channel={sender?.channel} />
            )}
        </DropdownItem>
    )
}

export default SenderDropDownItem
