import { useHelpdeskV2MS2Flag } from '@repo/feature-flags'
import {
    EditFieldsType,
    TicketInfobarTab,
    useTicketInfobarNavigation,
} from '@repo/navigation'
import { useHistory } from 'react-router-dom'

import {
    Button,
    ButtonGroup,
    Menu,
    MenuItem,
    MenuSection,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useTicketInfobarNavigationShortcuts } from '../../hooks/useTicketInfobarNavigationShortcuts'
import { InfobarNavigationContainer } from './components/InfobarNavigationContainer'
import { InfobarNavigationItem } from './components/InfobarNavigationItem'
import { InfobarToggle } from './components/TicketInfobarNavigationToggle'

type TicketInfobarNavigationProps = {
    hasAIFeedback?: boolean
    hasRecharge?: boolean
    hasTimeline?: boolean
}

export function TicketInfobarNavigation({
    hasAIFeedback,
    hasRecharge,
    hasTimeline,
}: TicketInfobarNavigationProps) {
    const {
        activeTab,
        isExpanded,
        onChangeTab,
        onToggle,
        onSetEditingWidgetType,
    } = useTicketInfobarNavigation()
    useTicketInfobarNavigationShortcuts()
    const hasUIVisionMilestone2 = useHelpdeskV2MS2Flag()
    const history = useHistory()

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
                    if (!isExpanded) {
                        onToggle()
                    }
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
                        icon="app-shopify"
                        tooltip={{
                            title: 'Shopify',
                        }}
                    />
                )}
                {hasUIVisionMilestone2 && hasRecharge && (
                    <InfobarNavigationItem
                        name={TicketInfobarTab.Recharge}
                        icon="app-recharge"
                        tooltip={{
                            title: 'Recharge',
                        }}
                    />
                )}
                {hasTimeline && (
                    <InfobarNavigationItem
                        name={TicketInfobarTab.Timeline}
                        icon="history"
                        tooltip={{
                            title: 'Customer Timeline',
                        }}
                    />
                )}
                {hasAIFeedback && (
                    <InfobarNavigationItem
                        name={TicketInfobarTab.AIFeedback}
                        icon="ai-agent-feedback"
                        tooltip={{
                            title: 'AI Feedback',
                        }}
                    />
                )}
                <InfobarNavigationItem
                    name={TicketInfobarTab.AutoQA}
                    icon="star"
                    tooltip={{
                        title: 'Auto QA',
                    }}
                />
            </ButtonGroup>
            {hasUIVisionMilestone2 && (
                <Menu
                    aria-label="Edit widget data"
                    placement="bottom left"
                    trigger={
                        <Tooltip
                            placement="left"
                            trigger={
                                <Button
                                    variant="tertiary"
                                    icon="settings"
                                    aria-label="Edit Widget data"
                                />
                            }
                        >
                            <TooltipContent title="Edit Widget data" />
                        </Tooltip>
                    }
                >
                    <MenuSection id="edit-widget-data" name="Edit widget data">
                        <MenuItem
                            label="Shopify"
                            leadingSlot="app-shopify"
                            onAction={() => {
                                onChangeTab(TicketInfobarTab.Shopify)
                                onSetEditingWidgetType(EditFieldsType.Shopify)
                            }}
                        />
                        <MenuItem
                            label="Recharge"
                            leadingSlot="app-recharge"
                            onAction={() => {
                                onChangeTab(TicketInfobarTab.Recharge)
                                onSetEditingWidgetType(EditFieldsType.Recharge)
                            }}
                        />
                        <MenuItem
                            label="Yotpo"
                            leadingSlot="channel-yotpo"
                            onAction={() => {}}
                        />
                        <MenuItem
                            label="Custom integrations"
                            leadingSlot="webhook"
                            onAction={() => {}}
                        />
                        <MenuItem
                            label="Add new app"
                            leadingSlot="add-plus"
                            onAction={() => {
                                history.push('/app/settings/integrations')
                            }}
                        />
                    </MenuSection>
                </Menu>
            )}
        </InfobarNavigationContainer>
    )
}
