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

export enum CommonReasonLabel {
    Other = 'Other',
    IPreferNotToSay = 'I prefer not to say',
}

export enum CancellationPrimaryReasonLabel {
    Pricing = 'Pricing & Subscription',
    DoesNotFitMyNeeds = 'Product Fit, Features & Roadmap',
    EaseOfUse = 'Ease of Use, Adoption & Value Realization',
    PerformanceAndReliability = 'Platform Performance & Reliability',
    SupportAndService = 'Support & Services Experience',
    SecurityAndCompliance = 'Security, Compliance & Legal',
}

export enum CancellationSecondaryReasonLabel {
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
            { label: CommonReasonLabel.Other },
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
            { label: CommonReasonLabel.Other },
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
            { label: CommonReasonLabel.Other },
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
            { label: CommonReasonLabel.Other },
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
            { label: CommonReasonLabel.Other },
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
