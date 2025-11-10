import { isProduction } from '@repo/utils'

import { CancellationReason, ReasonsToCanduContent } from './types'

export const CHURN_MITIGATION_OFFER_ZAPIER_URL = isProduction()
    ? 'https://hooks.zapier.com/hooks/catch/11610441/30s3nqr/'
    : 'https://hooks.zapier.com/hooks/catch/11610441/30s63w9/'
export enum CancellationFlowStep {
    productFeaturesFOMO,
    cancellationReasons,
    churnMitigationOffer,
    cancellationSummary,
}

export enum CommonReasonLabel {
    Other = 'Other',
    IPreferNotToSay = 'I prefer not to say',
}

export enum HelpdeskPrimaryReasonLabel {
    Pricing = 'Pricing & Subscription',
    DoesNotFitMyNeeds = 'Product Fit, Features & Roadmap',
    EaseOfUse = 'Ease of Use, Adoption & Value Realization',
    PerformanceAndReliability = 'Platform Performance & Reliability',
    SupportAndService = 'Support & Services Experience',
    SecurityAndCompliance = 'Security, Compliance & Legal',
}

export enum HelpdeskSecondaryReasonLabel {
    // Pricing & Subscription
    TooExpensive = 'Too expensive for perceived value',
    RenewalNotApproved = 'Renewal increase not approved',
    CostForUsage = "Cost doesn't match usage level",
    PricingModel = "Pricing model doesn't fit my needs",
    LackOfSpendControl = 'Lack of spend control',
    LackOfPaymentTermsFlexibility = 'Lack of payment terms or length terms flexibility',
    InvoicingOrPaymentMethodIssues = 'Invoicing or payment method issues',
    TaxesCurrencyOrFXFriction = 'Taxes, currency, or FX friction',

    // Product Fit, Features & Roadmap
    CriticalFeaturesMissing = 'Critical features missing',
    IntegrationGap = 'Integration gap with key systems',
    CustomizationOrPermissionsLimited = 'Customization or permissions too limited',
    RoadmapTimingWontMeetNeeds = "Roadmap timing won't meet needs",
    UseCaseEvolvedBeyondProduct = 'Use case evolved beyond product scope',
    ProductNegativelyImpactedBusiness = 'The product negatively impacted my business',

    // Ease of Use, Adoption & Value Realization
    HardToLearnOrTooComplex = 'Hard to learn or too complex',
    PoorOnboardingOrTraining = 'Poor onboarding, enablement or training',
    LowInternalAdoptionOrUtilization = 'Low internal adoption or low utilization',
    WorkflowMismatch = 'Workflow mismatch with team processes',
    DontHaveBandwidthOrOtherPriorities = "Don't have the bandwidth to implement or I have other priorities",
    SlowTimeToValue = 'Slow time-to-value',
    InsufficientROIOrUnclearImpact = 'Insufficient ROI or unclear impact',
    NotSolvingCoreNeeds = "Not solving company's core needs",

    // Platform Performance & Reliability
    DowntimeIssuesBugsOutagesOrIncidents = 'Downtime issues, bugs, outages, or incidents',
    SlowPerformanceAndLatencyIssues = 'Slow performance and latency issues',
    DataQualityAndAccuracyIssues = 'Data quality and accuracy issues',
    ScaleLimitations = 'Scale limitations',

    // Support & Services Experience
    SlowOrIneffectiveSupport = 'Slow or ineffective support',
    UnresolvedOpenIssues = 'Unresolved open issues',
    LackOfSelfServeGuidance = 'Lack of self-serve guidance to manage my account',
    LackOfProfessionalServices = 'Lack of Professional Services to optimize my account',
    DocumentationNotSufficient = 'Documentation not sufficient',

    // Security, Compliance & Legal
    DataPrivacyConcerns = 'Data privacy concerns',
    MissingComplianceCertifications = 'Missing compliance certifications (SOC 2, HIPAA, GDPR, etc.)',
    SecurityReviewNotPassed = 'Security review not passed',
    ContractDPAOrLegalTermsMisalignment = 'Contract, DPA, or legal terms misalignment',
}
export const HELPDESK_CANCELLATION_REASONS: CancellationReason[] = [
    {
        primaryReason: { label: HelpdeskPrimaryReasonLabel.Pricing },
        secondaryReasons: [
            { label: HelpdeskSecondaryReasonLabel.TooExpensive },
            { label: HelpdeskSecondaryReasonLabel.RenewalNotApproved },
            { label: HelpdeskSecondaryReasonLabel.CostForUsage },
            { label: HelpdeskSecondaryReasonLabel.PricingModel },
            { label: HelpdeskSecondaryReasonLabel.LackOfSpendControl },
            {
                label: HelpdeskSecondaryReasonLabel.LackOfPaymentTermsFlexibility,
            },
            {
                label: HelpdeskSecondaryReasonLabel.InvoicingOrPaymentMethodIssues,
            },
            { label: HelpdeskSecondaryReasonLabel.TaxesCurrencyOrFXFriction },
            { label: CommonReasonLabel.Other },
        ],
    },
    {
        primaryReason: {
            label: HelpdeskPrimaryReasonLabel.DoesNotFitMyNeeds,
        },
        secondaryReasons: [
            { label: HelpdeskSecondaryReasonLabel.CriticalFeaturesMissing },
            { label: HelpdeskSecondaryReasonLabel.IntegrationGap },
            {
                label: HelpdeskSecondaryReasonLabel.CustomizationOrPermissionsLimited,
            },
            {
                label: HelpdeskSecondaryReasonLabel.RoadmapTimingWontMeetNeeds,
            },
            {
                label: HelpdeskSecondaryReasonLabel.UseCaseEvolvedBeyondProduct,
            },
            {
                label: HelpdeskSecondaryReasonLabel.ProductNegativelyImpactedBusiness,
            },
            { label: CommonReasonLabel.Other },
        ],
    },
    {
        primaryReason: {
            label: HelpdeskPrimaryReasonLabel.EaseOfUse,
        },
        secondaryReasons: [
            { label: HelpdeskSecondaryReasonLabel.HardToLearnOrTooComplex },
            { label: HelpdeskSecondaryReasonLabel.PoorOnboardingOrTraining },
            {
                label: HelpdeskSecondaryReasonLabel.LowInternalAdoptionOrUtilization,
            },
            { label: HelpdeskSecondaryReasonLabel.WorkflowMismatch },
            {
                label: HelpdeskSecondaryReasonLabel.DontHaveBandwidthOrOtherPriorities,
            },
            { label: HelpdeskSecondaryReasonLabel.SlowTimeToValue },
            {
                label: HelpdeskSecondaryReasonLabel.InsufficientROIOrUnclearImpact,
            },
            { label: HelpdeskSecondaryReasonLabel.NotSolvingCoreNeeds },
            { label: CommonReasonLabel.Other },
        ],
    },
    {
        primaryReason: {
            label: HelpdeskPrimaryReasonLabel.PerformanceAndReliability,
        },
        secondaryReasons: [
            {
                label: HelpdeskSecondaryReasonLabel.DowntimeIssuesBugsOutagesOrIncidents,
            },
            {
                label: HelpdeskSecondaryReasonLabel.SlowPerformanceAndLatencyIssues,
            },
            {
                label: HelpdeskSecondaryReasonLabel.DataQualityAndAccuracyIssues,
            },
            { label: HelpdeskSecondaryReasonLabel.ScaleLimitations },
            { label: CommonReasonLabel.Other },
        ],
    },
    {
        primaryReason: {
            label: HelpdeskPrimaryReasonLabel.SupportAndService,
        },
        secondaryReasons: [
            { label: HelpdeskSecondaryReasonLabel.SlowOrIneffectiveSupport },
            { label: HelpdeskSecondaryReasonLabel.UnresolvedOpenIssues },
            { label: HelpdeskSecondaryReasonLabel.LackOfSelfServeGuidance },
            {
                label: HelpdeskSecondaryReasonLabel.LackOfProfessionalServices,
            },
            { label: HelpdeskSecondaryReasonLabel.DocumentationNotSufficient },
            { label: CommonReasonLabel.Other },
        ],
    },
    {
        primaryReason: {
            label: HelpdeskPrimaryReasonLabel.SecurityAndCompliance,
        },
        secondaryReasons: [
            { label: HelpdeskSecondaryReasonLabel.DataPrivacyConcerns },
            {
                label: HelpdeskSecondaryReasonLabel.MissingComplianceCertifications,
            },
            { label: HelpdeskSecondaryReasonLabel.SecurityReviewNotPassed },
            {
                label: HelpdeskSecondaryReasonLabel.ContractDPAOrLegalTermsMisalignment,
            },
            { label: CommonReasonLabel.Other },
        ],
    },
    {
        primaryReason: { label: CommonReasonLabel.IPreferNotToSay },
        secondaryReasons: [],
    },
    {
        primaryReason: { label: CommonReasonLabel.Other },
        secondaryReasons: [],
    },
]

// fixme(@illia): add  actual content mapping as soon as provided by CSM team.
export const HELPDESK_REASONS_TO_CANDU_CONTENTS: ReasonsToCanduContent[] = []
