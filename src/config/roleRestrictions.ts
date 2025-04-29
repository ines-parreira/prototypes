import { PageSection, SectionPageHeader } from './pages'

export type RoleRestrictionConfig = {
    pageHeader?: SectionPageHeader
}

// This config is likely to expand in the future
// to include media content in the role restriction pages
// If not, usages can be swapped by simple header passing
export const roleRestrictionConfigs: Record<
    PageSection,
    RoleRestrictionConfig
> = {
    // TODO(@Irinel) remove this when new billing is fully released
    [PageSection.NewBilling]: { pageHeader: SectionPageHeader.NewBilling },
    [PageSection.Access]: { pageHeader: SectionPageHeader.Access },
    [PageSection.Api]: { pageHeader: SectionPageHeader.Api },
    [PageSection.Audit]: { pageHeader: SectionPageHeader.Audit },
    [PageSection.BusinessHours]: {
        pageHeader: SectionPageHeader.BusinessHours,
    },
    [PageSection.Channels]: { pageHeader: SectionPageHeader.Channels },
    [PageSection.ConditionalFields]: {
        pageHeader: SectionPageHeader.ConditionalFields,
    },
    [PageSection.CreateShopifyCharge]: {
        pageHeader: SectionPageHeader.CreateShopifyCharge,
    },
    [PageSection.CreditShopifyBillingIntegration]: {
        pageHeader: SectionPageHeader.CreditShopifyBillingIntegration,
    },
    [PageSection.CustomerFields]: {
        pageHeader: SectionPageHeader.CustomerFields,
    },
    [PageSection.HelpCenter]: { pageHeader: SectionPageHeader.HelpCenter },
    [PageSection.ImportData]: { pageHeader: SectionPageHeader.ImportData },
    [PageSection.ImportPhoneNumber]: {
        pageHeader: SectionPageHeader.ImportPhoneNumber,
    },
    [PageSection.Integrations]: { pageHeader: SectionPageHeader.Integrations },
    [PageSection.Macros]: { pageHeader: SectionPageHeader.Macros },
    [PageSection.ManageTags]: { pageHeader: SectionPageHeader.ManageTags },
    [PageSection.PhoneNumbers]: { pageHeader: SectionPageHeader.PhoneNumbers },
    [PageSection.RemoveShopifyBilling]: {
        pageHeader: SectionPageHeader.RemoveShopifyBilling,
    },
    [PageSection.Rules]: { pageHeader: SectionPageHeader.Rules },
    [PageSection.UpdatePaymentTerms]: {
        pageHeader: SectionPageHeader.UpdatePaymentTerms,
    },
    [PageSection.SatisfactionSurveys]: {
        pageHeader: SectionPageHeader.SatisfactionSurveys,
    },
    [PageSection.SelfService]: { pageHeader: SectionPageHeader.SelfService },
    [PageSection.SidebarSettings]: {
        pageHeader: SectionPageHeader.SidebarSettings,
    },
    [PageSection.StoreManagement]: {
        pageHeader: SectionPageHeader.StoreManagement,
    },
    [PageSection.SLAPolicies]: { pageHeader: SectionPageHeader.SLAPolicies },
    [PageSection.Teams]: { pageHeader: SectionPageHeader.Teams },
    [PageSection.TicketAssignment]: {
        pageHeader: SectionPageHeader.TicketAssignment,
    },
    [PageSection.TicketFields]: { pageHeader: SectionPageHeader.TicketFields },
    [PageSection.TwilioSubaccountStatus]: {
        pageHeader: SectionPageHeader.TwilioSubaccountStatus,
    },
    [PageSection.Users]: { pageHeader: SectionPageHeader.Users },
}
