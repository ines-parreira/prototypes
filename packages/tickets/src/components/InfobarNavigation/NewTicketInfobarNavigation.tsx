import { useHelpdeskV2MS2Flag } from '@repo/feature-flags'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'

import { ButtonGroup } from '@gorgias/axiom'

import { useTicketInfobarNavigationShortcuts } from '../../hooks/useTicketInfobarNavigationShortcuts'
import { InfobarNavigationContainer } from './components/InfobarNavigationContainer'
import { InfobarNavigationItem } from './components/InfobarNavigationItem'
import { InfobarToggle } from './components/TicketInfobarNavigationToggle'

export function NewTicketInfobarNavigation() {
    const { activeTab, isExpanded, onChangeTab, onToggle } =
        useTicketInfobarNavigation()
    useTicketInfobarNavigationShortcuts()
    const hasUIVisionMilestone2 = useHelpdeskV2MS2Flag()

    return (
        <InfobarNavigationContainer>
            <InfobarToggle isExpanded={isExpanded} onToggle={onToggle} />
            <ButtonGroup
                size="lg"
                withoutBorder
                orientation="vertical"
                selectedKey={activeTab}
                onSelectionChange={(selectedKey: string) => {
                    onChangeTab(selectedKey as TicketInfobarTab)
                }}
            >
                <InfobarNavigationItem
                    name={TicketInfobarTab.Customer}
                    icon="customer-info"
                    tooltip={{
                        title: 'Details',
                    }}
                />
                {hasUIVisionMilestone2 && (
                    <InfobarNavigationItem
                        name={TicketInfobarTab.Shopify}
                        icon="vendor-shopify-colored"
                        tooltip={{
                            title: 'Shopify',
                        }}
                    />
                )}
                {/** Add Timeline tab here when we've worked on the logic to find the new ticket customer */}
            </ButtonGroup>
        </InfobarNavigationContainer>
    )
}
