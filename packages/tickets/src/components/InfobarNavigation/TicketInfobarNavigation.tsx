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
    hasBigCommerce?: boolean
    hasMagento?: boolean
    hasRecharge?: boolean
    hasShopify?: boolean
    hasSmile?: boolean
    hasTimeline?: boolean
    hasWooCommerce?: boolean
    hasYotpo?: boolean
}

export function TicketInfobarNavigation({
    hasAIFeedback,
    hasBigCommerce,
    hasMagento,
    hasRecharge,
    hasShopify,
    hasSmile,
    hasTimeline,
    hasWooCommerce,
    hasYotpo,
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
                {hasUIVisionMilestone2 && hasShopify && (
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
                {hasUIVisionMilestone2 && hasBigCommerce && (
                    <InfobarNavigationItem
                        name={TicketInfobarTab.BigCommerce}
                        icon="app-bicommerce"
                        tooltip={{
                            title: 'BigCommerce',
                        }}
                    />
                )}
                {hasUIVisionMilestone2 && hasMagento && (
                    <InfobarNavigationItem
                        name={TicketInfobarTab.Magento}
                        icon="app-magento"
                        tooltip={{
                            title: 'Magento',
                        }}
                    />
                )}
                {hasUIVisionMilestone2 && hasWooCommerce && (
                    <InfobarNavigationItem
                        name={TicketInfobarTab.WooCommerce}
                        icon="app-woo"
                        tooltip={{
                            title: 'WooCommerce',
                        }}
                    />
                )}
                {hasUIVisionMilestone2 && hasSmile && (
                    <InfobarNavigationItem
                        name={TicketInfobarTab.Smile}
                        icon="emoji-smile"
                        tooltip={{
                            title: 'Smile',
                        }}
                    />
                )}
                {hasUIVisionMilestone2 && hasYotpo && (
                    <InfobarNavigationItem
                        name={TicketInfobarTab.Yotpo}
                        icon="app-yotpo"
                        tooltip={{
                            title: 'Yotpo',
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
                        {hasShopify && (
                            <MenuItem
                                label="Shopify"
                                leadingSlot="app-shopify"
                                onAction={() => {
                                    onChangeTab(TicketInfobarTab.Shopify)
                                    onSetEditingWidgetType(
                                        EditFieldsType.Shopify,
                                    )
                                }}
                            />
                        )}
                        {hasRecharge && (
                            <MenuItem
                                label="Recharge"
                                leadingSlot="app-recharge"
                                onAction={() => {
                                    onChangeTab(TicketInfobarTab.Recharge)
                                    onSetEditingWidgetType(
                                        EditFieldsType.Recharge,
                                    )
                                }}
                            />
                        )}
                        {hasBigCommerce && (
                            <MenuItem
                                label="BigCommerce"
                                leadingSlot="app-bicommerce"
                                onAction={() => {
                                    onChangeTab(TicketInfobarTab.BigCommerce)
                                    onSetEditingWidgetType(
                                        EditFieldsType.Bigcommerce,
                                    )
                                }}
                            />
                        )}
                        {hasMagento && (
                            <MenuItem
                                label="Magento"
                                leadingSlot="app-magento"
                                onAction={() => {
                                    onChangeTab(TicketInfobarTab.Magento)
                                    onSetEditingWidgetType(
                                        EditFieldsType.Magento,
                                    )
                                }}
                            />
                        )}
                        {hasWooCommerce && (
                            <MenuItem
                                label="WooCommerce"
                                leadingSlot="app-woo"
                                onAction={() => {
                                    onChangeTab(TicketInfobarTab.WooCommerce)
                                    onSetEditingWidgetType(
                                        EditFieldsType.Woocommerce,
                                    )
                                }}
                            />
                        )}
                        {hasSmile && (
                            <MenuItem
                                label="Smile"
                                leadingSlot="emoji-smile"
                                onAction={() => {
                                    onChangeTab(TicketInfobarTab.Smile)
                                    onSetEditingWidgetType(EditFieldsType.Smile)
                                }}
                            />
                        )}
                        {hasYotpo && (
                            <MenuItem
                                label="Yotpo"
                                leadingSlot="app-yotpo"
                                onAction={() => {
                                    onChangeTab(TicketInfobarTab.Yotpo)
                                    onSetEditingWidgetType(EditFieldsType.Yotpo)
                                }}
                            />
                        )}
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
