import { useHelpdeskV2MS2Flag } from '@repo/feature-flags'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'

import { useTicketInfobarNavigationShortcuts } from '../../hooks/useTicketInfobarNavigationShortcuts'
import { InfobarNavigationContainer } from './components/InfobarNavigationContainer'
import { InfobarNavigationItem } from './components/InfobarNavigationItem'

export function NewTicketInfobarNavigation() {
    const { activeTab, isExpanded, onChangeTab, onToggle } =
        useTicketInfobarNavigation()
    useTicketInfobarNavigationShortcuts()
    const hasUIVisionMilestone2 = useHelpdeskV2MS2Flag()

    return (
        <InfobarNavigationContainer>
            <InfobarNavigationItem
                name="toggle"
                icon={isExpanded ? 'system-bar-collapse' : 'system-bar-expand'}
                onClick={() => onToggle()}
                tooltip={{
                    title: isExpanded ? 'Collapse' : 'Expand',
                    shortcut: ']',
                }}
            />
            <InfobarNavigationItem
                name={TicketInfobarTab.Customer}
                icon="customer-info"
                onClick={() => onChangeTab(TicketInfobarTab.Customer)}
                isActive={isExpanded && activeTab === TicketInfobarTab.Customer}
                tooltip={{
                    title: 'Details',
                }}
            />
            {hasUIVisionMilestone2 && (
                <InfobarNavigationItem
                    name={TicketInfobarTab.Shopify}
                    icon="vendor-shopify-colored"
                    onClick={() => onChangeTab(TicketInfobarTab.Shopify)}
                    isActive={
                        isExpanded && activeTab === TicketInfobarTab.Shopify
                    }
                    tooltip={{
                        title: 'Shopify',
                    }}
                />
            )}
            {/** Add Timeline tab here when we've worked on the logic to find the new ticket customer */}
        </InfobarNavigationContainer>
    )
}
