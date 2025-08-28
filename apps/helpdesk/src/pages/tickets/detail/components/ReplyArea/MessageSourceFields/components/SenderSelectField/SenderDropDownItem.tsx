import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import { Sender } from 'hooks/useOutboundChannels'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DefaultIntegrationBadge from 'pages/integrations/integration/components/email/DefaultIntegrationBadge'

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
        </DropdownItem>
    )
}

export default SenderDropDownItem
