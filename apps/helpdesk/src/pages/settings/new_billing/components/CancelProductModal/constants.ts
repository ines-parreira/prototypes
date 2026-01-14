import { isProduction } from '@repo/utils'

import type { CancellationReason, ReasonsToCanduContent } from './types'

export const CHURN_MITIGATION_OFFER_ZAPIER_URL = isProduction()
    ? 'https://hooks.zapier.com/hooks/catch/11610441/30s3nqr/'
    : 'https://hooks.zapier.com/hooks/catch/11610441/30s63w9/'
export enum CancellationFlowStep {
    productFeaturesFOMO,
    cancellationReasons,
    churnMitigationOffer,
    cancellationSummary,
}

export enum CancellationPrimaryReasonLabel {
    Pricing = "Pricing or subscription didn't work for us",
    DoesNotFitMyNeeds = "The product didn't fully meet our needs",
    EaseOfUse = "We didn't get enough value or traction from the product",
    PerformanceAndReliability = 'We had reliability or performance issues',
    SupportAndService = "Support or services didn't meet our expectations",
    InternalBusinessChange = 'Changes in our business or priorities',
    SecurityAndCompliance = 'Security, compliance, or legal requirements',
}

export enum CancellationSecondaryReasonLabel {
    // Pricing & Subscription
    TooExpensive = 'Too expensive for the value we got',
    RenewalNotApproved = "Our budget couldn't accommodate the renewal price",
    CostForUsage = "Cost didn't match how much we actually used it",
    PricingModel = "The pricing model didn't fit how we work",
    LackOfSpendControl = 'Hard to predict or control our spending',
    LackOfPaymentTermsFlexibility = 'Needed more flexible payment or contract terms',
    InvoicingOrPaymentMethodIssues = 'Issues with invoicing or payment methods',
    TaxesCurrencyOrFXFriction = 'Issues with taxes, currency, or exchange rates',

    // Product Fit, Features & Roadmap
    CriticalFeaturesMissing = 'Missing features we needed',
    IntegrationGap = "Didn't integrate with the tools we use",
    CustomizationOrPermissionsLimited = 'Not enough customization or permission controls',
    RoadmapTimingWontMeetNeeds = "Upcoming features won't arrive in time for us",
    UseCaseEvolvedBeyondProduct = 'Our needs grew beyond what the product can do',
    ProductNegativelyImpactedBusiness = "The product didn't perform well or caused issues for our business",

    // Ease of Use, Adoption & Value Realization
    HardToLearnOrTooComplex = 'Hard to learn or too complex',
    PoorOnboardingOrTraining = "Onboarding or training didn't set us up for success",
    LowInternalAdoptionOrUtilization = "Our team didn't adopt it or don't use it enough",
    WorkflowMismatch = "Didn't fit how our team works",
    DontHaveBandwidthOrOtherPriorities = "We didn't have time to implement it properly",
    SlowTimeToValue = 'Took too long to see results',
    InsufficientROIOrUnclearImpact = "The value or impact wasn't clear",
    NotSolvingCoreNeeds = "Wasn't solving our core problems",

    // Platform Performance & Reliability
    DowntimeIssuesBugsOutagesOrIncidents = 'Too many bugs, outages, or downtime',
    SlowPerformanceAndLatencyIssues = 'Too slow or laggy',
    DataQualityAndAccuracyIssues = 'Data quality or accuracy problems',
    ScaleLimitations = "Couldn't scale with our needs",

    // Support & Services Experience
    SlowOrIneffectiveSupport = "Support was too slow or didn't solve our issues",
    UnresolvedOpenIssues = 'Had issues that never got resolved',
    LackOfSelfServeGuidance = 'Not enough self-serve resources to manage our account',
    LackOfProfessionalServices = 'Needed more hands-on help to optimize our setup',
    DocumentationNotSufficient = "Documentation wasn't enough",

    // Internal Business & Strategic Factors
    CompanyDownsizingOrClosure = 'Our company downsized or closed',
    MergerAndAcquisition = 'Merger or acquisition',
    ToolConsolidationOrBuildingInHouseSolution = 'Consolidating tools or building in-house',
    TeamOrOrganizationalChanges = 'Team or organizational changes',
    StrategicShift = 'Our business focus changed',
    SeasonalPause = 'Seasonal pause',
    ProcurementPolicyBarrier = "Procurement policy didn't allow it",
    BudgetReductionOrSpendingFreeze = 'Budget cuts or spending freeze',

    // Security, Compliance & Legal
    DataPrivacyConcerns = 'Data privacy concerns',
    MissingComplianceCertifications = 'Missing certifications we required (SOC 2, HIPAA, GDPR, etc.)',
    SecurityReviewNotPassed = "Didn't pass our security review",
    ContractDPAOrLegalTermsMisalignment = "Contract or legal terms didn't work for us",
}
export const ProductCancellationReasons: CancellationReason[] = [
    {
        primaryReason: { label: CancellationPrimaryReasonLabel.Pricing },
        secondaryReasons: [
            { label: CancellationSecondaryReasonLabel.TooExpensive },
            { label: CancellationSecondaryReasonLabel.RenewalNotApproved },
            { label: CancellationSecondaryReasonLabel.CostForUsage },
            { label: CancellationSecondaryReasonLabel.PricingModel },
            { label: CancellationSecondaryReasonLabel.LackOfSpendControl },
            {
                label: CancellationSecondaryReasonLabel.LackOfPaymentTermsFlexibility,
            },
            {
                label: CancellationSecondaryReasonLabel.InvoicingOrPaymentMethodIssues,
            },
            {
                label: CancellationSecondaryReasonLabel.TaxesCurrencyOrFXFriction,
            },
        ],
    },
    {
        primaryReason: {
            label: CancellationPrimaryReasonLabel.DoesNotFitMyNeeds,
        },
        secondaryReasons: [
            { label: CancellationSecondaryReasonLabel.CriticalFeaturesMissing },
            { label: CancellationSecondaryReasonLabel.IntegrationGap },
            {
                label: CancellationSecondaryReasonLabel.CustomizationOrPermissionsLimited,
            },
            {
                label: CancellationSecondaryReasonLabel.RoadmapTimingWontMeetNeeds,
            },
            {
                label: CancellationSecondaryReasonLabel.UseCaseEvolvedBeyondProduct,
            },
            {
                label: CancellationSecondaryReasonLabel.ProductNegativelyImpactedBusiness,
            },
        ],
    },
    {
        primaryReason: {
            label: CancellationPrimaryReasonLabel.EaseOfUse,
        },
        secondaryReasons: [
            { label: CancellationSecondaryReasonLabel.HardToLearnOrTooComplex },
            {
                label: CancellationSecondaryReasonLabel.PoorOnboardingOrTraining,
            },
            {
                label: CancellationSecondaryReasonLabel.LowInternalAdoptionOrUtilization,
            },
            { label: CancellationSecondaryReasonLabel.WorkflowMismatch },
            {
                label: CancellationSecondaryReasonLabel.DontHaveBandwidthOrOtherPriorities,
            },
            { label: CancellationSecondaryReasonLabel.SlowTimeToValue },
            {
                label: CancellationSecondaryReasonLabel.InsufficientROIOrUnclearImpact,
            },
            { label: CancellationSecondaryReasonLabel.NotSolvingCoreNeeds },
        ],
    },
    {
        primaryReason: {
            label: CancellationPrimaryReasonLabel.PerformanceAndReliability,
        },
        secondaryReasons: [
            {
                label: CancellationSecondaryReasonLabel.DowntimeIssuesBugsOutagesOrIncidents,
            },
            {
                label: CancellationSecondaryReasonLabel.SlowPerformanceAndLatencyIssues,
            },
            {
                label: CancellationSecondaryReasonLabel.DataQualityAndAccuracyIssues,
            },
            { label: CancellationSecondaryReasonLabel.ScaleLimitations },
        ],
    },
    {
        primaryReason: {
            label: CancellationPrimaryReasonLabel.SupportAndService,
        },
        secondaryReasons: [
            {
                label: CancellationSecondaryReasonLabel.SlowOrIneffectiveSupport,
            },
            { label: CancellationSecondaryReasonLabel.UnresolvedOpenIssues },
            { label: CancellationSecondaryReasonLabel.LackOfSelfServeGuidance },
            {
                label: CancellationSecondaryReasonLabel.LackOfProfessionalServices,
            },
            {
                label: CancellationSecondaryReasonLabel.DocumentationNotSufficient,
            },
        ],
    },
    {
        primaryReason: {
            label: CancellationPrimaryReasonLabel.InternalBusinessChange,
        },
        secondaryReasons: [
            {
                label: CancellationSecondaryReasonLabel.CompanyDownsizingOrClosure,
            },
            { label: CancellationSecondaryReasonLabel.MergerAndAcquisition },
            {
                label: CancellationSecondaryReasonLabel.ToolConsolidationOrBuildingInHouseSolution,
            },
            {
                label: CancellationSecondaryReasonLabel.TeamOrOrganizationalChanges,
            },
            { label: CancellationSecondaryReasonLabel.StrategicShift },
            { label: CancellationSecondaryReasonLabel.SeasonalPause },
            {
                label: CancellationSecondaryReasonLabel.ProcurementPolicyBarrier,
            },
            {
                label: CancellationSecondaryReasonLabel.BudgetReductionOrSpendingFreeze,
            },
        ],
    },
    {
        primaryReason: {
            label: CancellationPrimaryReasonLabel.SecurityAndCompliance,
        },
        secondaryReasons: [
            { label: CancellationSecondaryReasonLabel.DataPrivacyConcerns },
            {
                label: CancellationSecondaryReasonLabel.MissingComplianceCertifications,
            },
            { label: CancellationSecondaryReasonLabel.SecurityReviewNotPassed },
            {
                label: CancellationSecondaryReasonLabel.ContractDPAOrLegalTermsMisalignment,
            },
        ],
    },
]

// fixme(@illia): add  actual content mapping as soon as provided by CSM team.
export const HELPDESK_REASONS_TO_CANDU_CONTENTS: ReasonsToCanduContent[] = []
