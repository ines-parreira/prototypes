import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import TicketNavbar, { TicketNavbarOwnProps } from '../TicketNavbar'
import TicketNavbarV2 from './TicketNavbarV2'

export function TicketNavBarRevampWrapper(props: TicketNavbarOwnProps) {
    const showTicketNavbarV2 = useFlag(FeatureFlagKey.RevampNavBarUi)

    return showTicketNavbarV2 ? (
        <TicketNavbarV2 {...props} />
    ) : (
        <TicketNavbar {...props} />
    )
}
