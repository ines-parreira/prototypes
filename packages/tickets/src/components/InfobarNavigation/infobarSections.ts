import { TicketInfobarTab } from '@repo/navigation'

const INFOBAR_SECTION_ID_PREFIX = 'infobar-section-'

export const SCROLL_SNAP_TABS: ReadonlySet<TicketInfobarTab> = new Set([
    TicketInfobarTab.Customer,
    TicketInfobarTab.Shopify,
    TicketInfobarTab.Recharge,
    TicketInfobarTab.BigCommerce,
    TicketInfobarTab.Magento,
    TicketInfobarTab.WooCommerce,
    TicketInfobarTab.Smile,
    TicketInfobarTab.Yotpo,
    TicketInfobarTab.CustomIntegrations,
])

export function getInfobarSectionId(tab: TicketInfobarTab): string {
    return `${INFOBAR_SECTION_ID_PREFIX}${tab}`
}

export function getTabFromInfobarSectionId(
    sectionId: string,
): TicketInfobarTab | null {
    const tab = sectionId.slice(
        INFOBAR_SECTION_ID_PREFIX.length,
    ) as TicketInfobarTab
    return SCROLL_SNAP_TABS.has(tab) ? tab : null
}

export function scrollToInfobarSection(
    tab: TicketInfobarTab,
    behavior: ScrollBehavior = 'smooth',
): void {
    document.getElementById(getInfobarSectionId(tab))?.scrollIntoView({
        block: 'start',
        behavior,
    })
}
