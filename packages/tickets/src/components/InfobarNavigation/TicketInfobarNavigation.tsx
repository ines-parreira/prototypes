import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'

import { useHelpdeskV2MS2Flag } from '@repo/feature-flags'
import {
    EditFieldsType,
    TicketInfobarTab,
    useTicketInfobarNavigation,
} from '@repo/navigation'
import { isAdmin } from '@repo/permissions'
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
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

import { useInfobarActiveSection } from '../../hooks/useInfobarActiveSection'
import { useTicketInfobarNavigationShortcuts } from '../../hooks/useTicketInfobarNavigationShortcuts'
import { InfobarNavigationContainer } from './components/InfobarNavigationContainer'
import { InfobarNavigationDivider } from './components/InfobarNavigationDivider'
import { InfobarNavigationItem } from './components/InfobarNavigationItem'
import { TicketInfobarNavigationToggle } from './components/TicketInfobarNavigationToggle'
import {
    getInfobarSectionId,
    getTabFromInfobarSectionId,
    SCROLL_SNAP_TABS,
    scrollToInfobarSection,
} from './infobarSections'
import type { IntegrationFlags } from './integrationNavConfig'
import { INTEGRATION_NAV_CONFIG } from './integrationNavConfig'

type TicketInfobarNavigationProps = {
    hasAIFeedback?: boolean
    hasAutoQA?: boolean
    hasBigCommerce?: boolean
    hasCustomIntegrations?: boolean
    hasMagento?: boolean
    hasRecharge?: boolean
    hasShopify?: boolean
    hasSmile?: boolean
    hasWooCommerce?: boolean
    hasYotpo?: boolean
    hideWidgetEditing?: boolean
}

export function TicketInfobarNavigation({
    hasAIFeedback,
    hasAutoQA = true,
    hasBigCommerce,
    hasCustomIntegrations,
    hasMagento,
    hasRecharge,
    hasShopify,
    hasSmile,
    hasWooCommerce,
    hasYotpo,
    hideWidgetEditing = false,
}: TicketInfobarNavigationProps) {
    const {
        activeTab,
        isExpanded,
        editingWidgetType,
        onChangeTab,
        onToggle,
        onSetEditingWidgetType,
    } = useTicketInfobarNavigation()
    const isEditing = editingWidgetType != null
    useTicketInfobarNavigationShortcuts()
    const hasUIVisionMilestone2 = useHelpdeskV2MS2Flag()
    const history = useHistory()
    const { data: currentUser } = useGetCurrentUser({
        query: {
            select: (data) => data.data,
        },
    })

    const integrationFlags: IntegrationFlags = useMemo(
        () => ({
            hasShopify: !!hasShopify,
            hasRecharge: !!hasRecharge,
            hasBigCommerce: !!hasBigCommerce,
            hasMagento: !!hasMagento,
            hasWooCommerce: !!hasWooCommerce,
            hasSmile: !!hasSmile,
            hasYotpo: !!hasYotpo,
            hasCustomIntegrations: !!hasCustomIntegrations,
        }),
        [
            hasShopify,
            hasRecharge,
            hasBigCommerce,
            hasMagento,
            hasWooCommerce,
            hasSmile,
            hasYotpo,
            hasCustomIntegrations,
        ],
    )

    const visibleIntegrations = useMemo(
        () =>
            INTEGRATION_NAV_CONFIG.filter(
                (config) => integrationFlags[config.flagKey],
            ),
        [integrationFlags],
    )

    const visibleScrollSnapTabs = useMemo(
        () => [
            TicketInfobarTab.Customer,
            ...(hasUIVisionMilestone2
                ? visibleIntegrations.map((config) => config.tab)
                : []),
        ],
        [hasUIVisionMilestone2, visibleIntegrations],
    )

    const sectionIds = useMemo(
        () => visibleScrollSnapTabs.map(getInfobarSectionId),
        [visibleScrollSnapTabs],
    )

    const handleSectionInView = useCallback(
        (sectionId: string) => {
            const tab = getTabFromInfobarSectionId(sectionId)
            if (tab && tab !== activeTab) {
                onChangeTab(tab)
            }
        },
        [activeTab, onChangeTab],
    )

    useInfobarActiveSection({
        sectionIds,
        onChange: handleSectionInView,
        enabled: !isEditing && SCROLL_SNAP_TABS.has(activeTab),
    })

    const prevActiveTabRef = useRef<TicketInfobarTab | null>(null)
    useLayoutEffect(() => {
        const wasOnSnap =
            prevActiveTabRef.current != null &&
            SCROLL_SNAP_TABS.has(prevActiveTabRef.current)
        if (!wasOnSnap && SCROLL_SNAP_TABS.has(activeTab)) {
            scrollToInfobarSection(activeTab, 'instant')
        }
        prevActiveTabRef.current = activeTab
    }, [activeTab])

    const handleSelectionChange = useCallback(
        (selectedKey: string) => {
            const tab = selectedKey as TicketInfobarTab
            const wasOnSnap = SCROLL_SNAP_TABS.has(activeTab)
            onChangeTab(tab)
            if (!isExpanded) {
                onToggle()
            }
            if (wasOnSnap && SCROLL_SNAP_TABS.has(tab)) {
                scrollToInfobarSection(tab, 'instant')
            }
            if (isEditing) {
                const config = INTEGRATION_NAV_CONFIG.find((c) => c.tab === tab)
                if (config) {
                    onSetEditingWidgetType(config.editFieldsType)
                }
            }
        },
        [
            activeTab,
            isEditing,
            isExpanded,
            onChangeTab,
            onToggle,
            onSetEditingWidgetType,
        ],
    )

    const handleCustomIntegrationsAction = useCallback(() => {
        onChangeTab(TicketInfobarTab.CustomIntegrations)
        onSetEditingWidgetType(EditFieldsType.Custom)
    }, [onChangeTab, onSetEditingWidgetType])

    return (
        <InfobarNavigationContainer>
            {!isEditing && (
                <TicketInfobarNavigationToggle
                    isExpanded={isExpanded}
                    onToggle={onToggle}
                />
            )}
            <ButtonGroup
                size="lg"
                withoutBorder
                orientation="vertical"
                selectedKey={activeTab}
                onSelectionChange={handleSelectionChange}
            >
                {!isEditing && (
                    <InfobarNavigationItem
                        name={TicketInfobarTab.Customer}
                        icon="customer-info"
                        tooltip={{
                            title: 'Details',
                        }}
                    />
                )}
                {hasUIVisionMilestone2 &&
                    visibleIntegrations.map((config) => (
                        <InfobarNavigationItem
                            key={config.tab}
                            name={config.tab}
                            icon={config.icon}
                            tooltip={{ title: config.label }}
                        />
                    ))}
                {!isEditing && hasAIFeedback && (
                    <>
                        <InfobarNavigationDivider />
                        <InfobarNavigationItem
                            name={TicketInfobarTab.AIFeedback}
                            icon="ai-agent-feedback"
                            tooltip={{
                                title: 'AI Feedback',
                            }}
                        />
                    </>
                )}
                {!isEditing && hasAutoQA && (
                    <>
                        <InfobarNavigationDivider />
                        <InfobarNavigationItem
                            name={TicketInfobarTab.AutoQA}
                            icon="star"
                            tooltip={{
                                title: 'Auto QA',
                            }}
                        />
                    </>
                )}
                {hasUIVisionMilestone2 &&
                    !isEditing &&
                    currentUser &&
                    isAdmin(currentUser) && <InfobarNavigationDivider />}
            </ButtonGroup>
            {hasUIVisionMilestone2 &&
                !isEditing &&
                currentUser &&
                isAdmin(currentUser) && (
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
                        <MenuSection
                            id="edit-widget-data"
                            name="Edit widget data"
                        >
                            {!hideWidgetEditing &&
                                visibleIntegrations.map((config) => (
                                    <MenuItem
                                        key={config.tab}
                                        label={config.menuLabel ?? config.label}
                                        leadingSlot={config.icon}
                                        onAction={() => {
                                            onChangeTab(config.tab)
                                            onSetEditingWidgetType(
                                                config.editFieldsType,
                                            )
                                        }}
                                    />
                                ))}
                            {!hideWidgetEditing && (
                                <MenuItem
                                    label="Add new widget"
                                    leadingSlot="add-plus"
                                    onAction={handleCustomIntegrationsAction}
                                />
                            )}
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
