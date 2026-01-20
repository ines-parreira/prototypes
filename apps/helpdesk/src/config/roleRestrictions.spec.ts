import { PageSection, SectionPageHeader } from './pages'
import { roleRestrictionConfigs } from './roleRestrictions'

describe('roleRestrictionConfigs', () => {
    describe('Configuration completeness', () => {
        it('should have a configuration for every PageSection', () => {
            const allPageSections = Object.values(PageSection)
            const configuredSections = Object.keys(roleRestrictionConfigs)

            expect(configuredSections).toHaveLength(allPageSections.length)

            allPageSections.forEach((section) => {
                expect(roleRestrictionConfigs).toHaveProperty(section)
            })
        })

        it('should have a pageHeader for every configured section', () => {
            Object.entries(roleRestrictionConfigs).forEach(([, config]) => {
                expect(config.pageHeader).toBeDefined()
                expect(typeof config.pageHeader).toBe('string')
            })
        })
    })

    describe('Specific page section configurations', () => {
        it('should have correct configuration for Access', () => {
            expect(roleRestrictionConfigs[PageSection.Access]).toEqual({
                pageHeader: SectionPageHeader.Access,
            })
        })

        it('should have correct configuration for Api', () => {
            expect(roleRestrictionConfigs[PageSection.Api]).toEqual({
                pageHeader: SectionPageHeader.Api,
            })
        })

        it('should have correct configuration for Audit', () => {
            expect(roleRestrictionConfigs[PageSection.Audit]).toEqual({
                pageHeader: SectionPageHeader.Audit,
            })
        })

        it('should have correct configuration for BusinessHours', () => {
            expect(roleRestrictionConfigs[PageSection.BusinessHours]).toEqual({
                pageHeader: SectionPageHeader.BusinessHours,
            })
        })

        it('should have correct configuration for Channels', () => {
            expect(roleRestrictionConfigs[PageSection.Channels]).toEqual({
                pageHeader: SectionPageHeader.Channels,
            })
        })

        it('should have correct configuration for ConditionalFields', () => {
            expect(
                roleRestrictionConfigs[PageSection.ConditionalFields],
            ).toEqual({
                pageHeader: SectionPageHeader.ConditionalFields,
            })
        })

        it('should have correct configuration for CustomerFields', () => {
            expect(roleRestrictionConfigs[PageSection.CustomerFields]).toEqual({
                pageHeader: SectionPageHeader.CustomerFields,
            })
        })

        it('should have correct configuration for HelpCenter', () => {
            expect(roleRestrictionConfigs[PageSection.HelpCenter]).toEqual({
                pageHeader: SectionPageHeader.HelpCenter,
            })
        })

        it('should have correct configuration for HistoricalImports', () => {
            expect(
                roleRestrictionConfigs[PageSection.HistoricalImports],
            ).toEqual({
                pageHeader: SectionPageHeader.HistoricalImports,
            })
        })

        it('should have correct configuration for ImportZendesk', () => {
            expect(roleRestrictionConfigs[PageSection.ImportZendesk]).toEqual({
                pageHeader: SectionPageHeader.ImportZendesk,
            })
        })

        it('should have correct configuration for ImportEmail', () => {
            expect(roleRestrictionConfigs[PageSection.ImportEmail]).toEqual({
                pageHeader: SectionPageHeader.ImportEmail,
            })
        })

        it('should have correct configuration for ImportPhoneNumber', () => {
            expect(
                roleRestrictionConfigs[PageSection.ImportPhoneNumber],
            ).toEqual({
                pageHeader: SectionPageHeader.ImportPhoneNumber,
            })
        })

        it('should have correct configuration for Integrations', () => {
            expect(roleRestrictionConfigs[PageSection.Integrations]).toEqual({
                pageHeader: SectionPageHeader.Integrations,
            })
        })

        it('should have correct configuration for Macros', () => {
            expect(roleRestrictionConfigs[PageSection.Macros]).toEqual({
                pageHeader: SectionPageHeader.Macros,
            })
        })

        it('should have correct configuration for ManageTags', () => {
            expect(roleRestrictionConfigs[PageSection.ManageTags]).toEqual({
                pageHeader: SectionPageHeader.ManageTags,
            })
        })

        it('should have correct configuration for PhoneNumbers', () => {
            expect(roleRestrictionConfigs[PageSection.PhoneNumbers]).toEqual({
                pageHeader: SectionPageHeader.PhoneNumbers,
            })
        })

        it('should have correct configuration for Rules', () => {
            expect(roleRestrictionConfigs[PageSection.Rules]).toEqual({
                pageHeader: SectionPageHeader.Rules,
            })
        })

        it('should have correct configuration for SatisfactionSurveys', () => {
            expect(
                roleRestrictionConfigs[PageSection.SatisfactionSurveys],
            ).toEqual({
                pageHeader: SectionPageHeader.SatisfactionSurveys,
            })
        })

        it('should have correct configuration for SelfService', () => {
            expect(roleRestrictionConfigs[PageSection.SelfService]).toEqual({
                pageHeader: SectionPageHeader.SelfService,
            })
        })

        it('should have correct configuration for SidebarSettings', () => {
            expect(roleRestrictionConfigs[PageSection.SidebarSettings]).toEqual(
                {
                    pageHeader: SectionPageHeader.SidebarSettings,
                },
            )
        })

        it('should have correct configuration for StoreManagement', () => {
            expect(roleRestrictionConfigs[PageSection.StoreManagement]).toEqual(
                {
                    pageHeader: SectionPageHeader.StoreManagement,
                },
            )
        })

        it('should have correct configuration for StoreDetails', () => {
            expect(roleRestrictionConfigs[PageSection.StoreDetails]).toEqual({
                pageHeader: SectionPageHeader.StoreDetails,
            })
        })

        it('should have correct configuration for SLAPolicies', () => {
            expect(roleRestrictionConfigs[PageSection.SLAPolicies]).toEqual({
                pageHeader: SectionPageHeader.SLAPolicies,
            })
        })

        it('should have correct configuration for Teams', () => {
            expect(roleRestrictionConfigs[PageSection.Teams]).toEqual({
                pageHeader: SectionPageHeader.Teams,
            })
        })

        it('should have correct configuration for TicketAssignment', () => {
            expect(
                roleRestrictionConfigs[PageSection.TicketAssignment],
            ).toEqual({
                pageHeader: SectionPageHeader.TicketAssignment,
            })
        })

        it('should have correct configuration for TicketFields', () => {
            expect(roleRestrictionConfigs[PageSection.TicketFields]).toEqual({
                pageHeader: SectionPageHeader.TicketFields,
            })
        })

        it('should have correct configuration for Users', () => {
            expect(roleRestrictionConfigs[PageSection.Users]).toEqual({
                pageHeader: SectionPageHeader.Users,
            })
        })

        it('should have correct configuration for NewBilling', () => {
            expect(roleRestrictionConfigs[PageSection.NewBilling]).toEqual({
                pageHeader: SectionPageHeader.NewBilling,
            })
        })

        it('should have correct configuration for CreateShopifyCharge', () => {
            expect(
                roleRestrictionConfigs[PageSection.CreateShopifyCharge],
            ).toEqual({
                pageHeader: SectionPageHeader.CreateShopifyCharge,
            })
        })

        it('should have correct configuration for CreditShopifyBillingIntegration', () => {
            expect(
                roleRestrictionConfigs[
                    PageSection.CreditShopifyBillingIntegration
                ],
            ).toEqual({
                pageHeader: SectionPageHeader.CreditShopifyBillingIntegration,
            })
        })

        it('should have correct configuration for RemoveShopifyBilling', () => {
            expect(
                roleRestrictionConfigs[PageSection.RemoveShopifyBilling],
            ).toEqual({
                pageHeader: SectionPageHeader.RemoveShopifyBilling,
            })
        })

        it('should have correct configuration for UpdatePaymentTerms', () => {
            expect(
                roleRestrictionConfigs[PageSection.UpdatePaymentTerms],
            ).toEqual({
                pageHeader: SectionPageHeader.UpdatePaymentTerms,
            })
        })

        it('should have correct configuration for TwilioSubaccountStatus', () => {
            expect(
                roleRestrictionConfigs[PageSection.TwilioSubaccountStatus],
            ).toEqual({
                pageHeader: SectionPageHeader.TwilioSubaccountStatus,
            })
        })
    })

    describe('Type safety', () => {
        it('should only contain valid PageSection keys', () => {
            const configKeys = Object.keys(roleRestrictionConfigs)
            const validSections = Object.values(PageSection)

            configKeys.forEach((key) => {
                expect(validSections).toContain(key)
            })
        })

        it('should only contain valid SectionPageHeader values', () => {
            const validHeaders = Object.values(SectionPageHeader)

            Object.values(roleRestrictionConfigs).forEach((config) => {
                expect(validHeaders).toContain(config.pageHeader)
            })
        })
    })

    describe('Configuration structure', () => {
        it('should have consistent configuration object structure', () => {
            Object.entries(roleRestrictionConfigs).forEach(([, config]) => {
                expect(config).toHaveProperty('pageHeader')
                expect(Object.keys(config)).toHaveLength(1)
            })
        })

        it('should be a read-only configuration object', () => {
            const originalConfig = { ...roleRestrictionConfigs }

            expect(() => {
                ;(roleRestrictionConfigs as any).NewSection = {
                    pageHeader: 'Test',
                }
            }).toThrow()

            expect(roleRestrictionConfigs).toEqual(originalConfig)
        })
    })

    describe('Import-related configurations', () => {
        it('should have all import-related page sections configured', () => {
            expect(
                roleRestrictionConfigs[PageSection.HistoricalImports],
            ).toBeDefined()
            expect(
                roleRestrictionConfigs[PageSection.ImportZendesk],
            ).toBeDefined()
            expect(
                roleRestrictionConfigs[PageSection.ImportEmail],
            ).toBeDefined()
            expect(
                roleRestrictionConfigs[PageSection.ImportPhoneNumber],
            ).toBeDefined()
        })

        it('should have correct headers for import-related sections', () => {
            expect(
                roleRestrictionConfigs[PageSection.HistoricalImports]
                    .pageHeader,
            ).toBe(SectionPageHeader.HistoricalImports)
            expect(
                roleRestrictionConfigs[PageSection.ImportZendesk].pageHeader,
            ).toBe(SectionPageHeader.ImportZendesk)
            expect(
                roleRestrictionConfigs[PageSection.ImportEmail].pageHeader,
            ).toBe(SectionPageHeader.ImportEmail)
            expect(
                roleRestrictionConfigs[PageSection.ImportPhoneNumber]
                    .pageHeader,
            ).toBe(SectionPageHeader.ImportPhoneNumber)
        })
    })
})
