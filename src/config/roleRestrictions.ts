import {PageSection, SectionPageHeader} from './pages'

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
    [PageSection.Billing]: {
        pageHeader: SectionPageHeader.Billing,
    },
    [PageSection.Integrations]: {
        pageHeader: SectionPageHeader.Integrations,
    },
    [PageSection.Macros]: {
        pageHeader: SectionPageHeader.Macros,
    },
    [PageSection.Rules]: {
        pageHeader: SectionPageHeader.Rules,
    },
    [PageSection.ManageTags]: {
        pageHeader: SectionPageHeader.ManageTags,
    },
    [PageSection.Users]: {
        pageHeader: SectionPageHeader.Users,
    },
    [PageSection.Audit]: {
        pageHeader: SectionPageHeader.Audit,
    },
    [PageSection.Access]: {
        pageHeader: SectionPageHeader.Access,
    },
    [PageSection.SatisfactionSurveys]: {
        pageHeader: SectionPageHeader.SatisfactionSurveys,
    },
    [PageSection.BusinessHours]: {
        pageHeader: SectionPageHeader.BusinessHours,
    },
    [PageSection.TicketAssignment]: {
        pageHeader: SectionPageHeader.TicketAssignment,
    },
    [PageSection.PhoneNumbers]: {
        pageHeader: SectionPageHeader.PhoneNumbers,
    },
    [PageSection.HelpCenter]: {
        pageHeader: SectionPageHeader.HelpCenter,
    },
    [PageSection.SelfService]: {
        pageHeader: SectionPageHeader.SelfService,
    },
    [PageSection.Teams]: {
        pageHeader: SectionPageHeader.Teams,
    },
    [PageSection.ImportData]: {
        pageHeader: SectionPageHeader.ImportData,
    },
    [PageSection.ImportPhoneNumber]: {
        pageHeader: SectionPageHeader.ImportPhoneNumber,
    },
    [PageSection.TwilioSubaccountStatus]: {
        pageHeader: SectionPageHeader.TwilioSubaccountStatus,
    },
}
