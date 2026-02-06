import { useHelpdeskV2MS2Flag } from '@repo/feature-flags'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'

import { useTicketInfobarNavigationShortcuts } from '../../hooks/useTicketInfobarNavigationShortcuts'
import { InfobarNavigationContainer } from './components/InfobarNavigationContainer'
import { InfobarNavigationItem } from './components/InfobarNavigationItem'

type Props = {
    hasAIFeedback?: boolean
    hasTimeline?: boolean
}

export function TicketInfobarNavigation({ hasAIFeedback, hasTimeline }: Props) {
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
            {hasTimeline && (
                <InfobarNavigationItem
                    name={TicketInfobarTab.Timeline}
                    icon="history"
                    onClick={() => onChangeTab(TicketInfobarTab.Timeline)}
                    isActive={
                        isExpanded && activeTab === TicketInfobarTab.Timeline
                    }
                    tooltip={{
                        title: 'Customer Timeline',
                    }}
                />
            )}
            {hasAIFeedback && (
                <InfobarNavigationItem
                    name={TicketInfobarTab.AIFeedback}
                    icon="ai-agent-feedback"
                    onClick={() => onChangeTab(TicketInfobarTab.AIFeedback)}
                    isActive={
                        isExpanded && activeTab === TicketInfobarTab.AIFeedback
                    }
                    tooltip={{
                        title: 'AI Feedback',
                    }}
                />
            )}
            <InfobarNavigationItem
                name={TicketInfobarTab.AutoQA}
                icon="star"
                onClick={() => onChangeTab(TicketInfobarTab.AutoQA)}
                isActive={isExpanded && activeTab === TicketInfobarTab.AutoQA}
                tooltip={{
                    title: 'Auto QA',
                }}
            />
        </InfobarNavigationContainer>
    )
}
