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

export enum CancellationPrimaryReasonInternalName {
    Cost = 'cost',
    Product = 'product',
    Experience = 'experience',
    PerformanceAndReliability = 'performance_and_reliability',
    Support = 'support',
    BusinessChange = 'business_change',
    SecurityAndCompliance = 'security_and_compliance',
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

export enum CancellationSecondaryReasonInternalName {
    // Pricing & Subscription
    TooExpensiveForPerceivedValue = 'too_expensive_for_perceived_value',
    RenewalIncreaseNotApproved = 'renewal_increase_not_approved',
    CostDoesntMatchUsageLevel = 'cost_doesnt_match_usage_level',
    PricingModelDoesntFitNeeds = 'pricing_model_doesnt_fit_needs',
    LackOfSpendControl = 'lack_of_spend_control',
    LackOfPaymentTermsOrLengthTermsFlexibility = 'lack_of_payment_terms_or_length_terms_flexibility',
    InvoicingOrPaymentMethodIssues = 'invoicing_or_payment_method_issues',
    TaxesCurrencyOrFXFriction = 'taxes_currency_or_fx_friction',

    // Product Fit, Features & Roadmap
    CriticalFeaturesMissing = 'critical_features_missing',
    IntegrationGapWithKeySystems = 'integration_gap_with_key_systems',
    CustomizationOrPermissionsTooLimited = 'customization_or_permissions_too_limited',
    RoadmapTimingWontMeetNeeds = 'roadmap_timing_wont_meet_needs',
    UseCaseEvolvedBeyondProductScope = 'use_case_evolved_beyond_product_scope',
    TheProductNegativelyImpactedBusiness = 'the_product_negatively_impacted_business',

    // Ease of Use, Adoption & Value Realization
    HardToLearnOrTooComplex = 'hard_to_learn_or_too_complex',
    PoorOnboardingEnablementOrTraining = 'poor_onboarding_enablement_or_training',
    LowInternalAdoptionOrLowUtilization = 'low_internal_adoption_or_low_utilization',
    WorkflowMismatchWithTeamProcesses = 'workflow_mismatch_with_team_processes',
    DontHaveTheBandwidthToImplementOrIHaveOtherPriorities = 'dont_have_the_bandwith_to_implement_or_i_have_other_priorities',
    SlowTimeToValue = 'slow_time_to_value',
    InsufficientROIOrUnclearImpact = 'insufficient_roi_or_unclear_impact',
    NotSolvingCompanysCoreNeeds = 'not_solving_companys_core_needs',

    // Platform Performance & Reliability
    DowntimeIssuesBugsOutagesOrIncidents = 'downtime_issues_bugs_outages_or_incidents',
    SlowPerformanceAndLatencyIssues = 'slow_performance_and_latency_issues',
    DataQualityAndAccuracyIssues = 'data_quality_and_accuracy_issues',
    ScaleLimitations = 'scale_limitations',

    // Support & Services Experience
    SlowOrIneffectiveSupport = 'slow_or_ineffective_support',
    UnresolvedOpenIssues = 'unresolved_open_issues',
    LackOfSelfServeGuidanceToManageAccount = 'lack_of_self_serve_guidance_to_manage_account',
    LackOfProfessionalServicesToOptimizeAccount = 'lack_of_professional_services_to_optimize_account',
    DocumentationNotSufficient = 'documentation_not_sufficient',

    // Internal Business & Strategic Factors
    CompanyDownsizingOrClosure = 'company_downsizing_or_closure',
    MergerAndAcquisition = 'merger_and_acquisition',
    ToolConsolidationOrSwitchingToInHouseSolution = 'tool_consolidation_or_switching_to_in_house_solution',
    TeamOrOrganizationalChanges = 'team_or_organizational_changes',
    StrategicShift = 'strategic_shift',
    SeasonalPause = 'seasonal_pause',
    ProcurementPolicyBarrier = 'procurement_policy_barrier',
    BudgetReductionOrSpendingFreeze = 'budget_reduction_or_spending_freeze',

    // Security, Compliance & Legal
    DataPrivacyConcerns = 'data_privacy_concerns',
    MissingComplianceCertifications = 'missing_compliance_certifications',
    SecurityReviewNotPassed = 'security_review_not_passed',
    ContractDPAOrLegalTermsMisalignment = 'contract_dpa_or_legal_terms_misalignment',
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

export const PRIMARY_REASON_LABEL_TO_INTERNAL_NAME: Record<
    CancellationPrimaryReasonLabel,
    CancellationPrimaryReasonInternalName
> = {
    [CancellationPrimaryReasonLabel.Pricing]:
        CancellationPrimaryReasonInternalName.Cost,
    [CancellationPrimaryReasonLabel.DoesNotFitMyNeeds]:
        CancellationPrimaryReasonInternalName.Product,
    [CancellationPrimaryReasonLabel.EaseOfUse]:
        CancellationPrimaryReasonInternalName.Experience,
    [CancellationPrimaryReasonLabel.PerformanceAndReliability]:
        CancellationPrimaryReasonInternalName.PerformanceAndReliability,
    [CancellationPrimaryReasonLabel.SupportAndService]:
        CancellationPrimaryReasonInternalName.Support,
    [CancellationPrimaryReasonLabel.InternalBusinessChange]:
        CancellationPrimaryReasonInternalName.BusinessChange,
    [CancellationPrimaryReasonLabel.SecurityAndCompliance]:
        CancellationPrimaryReasonInternalName.SecurityAndCompliance,
}

export const SECONDARY_REASON_LABEL_TO_INTERNAL_NAME: Record<
    CancellationSecondaryReasonLabel,
    CancellationSecondaryReasonInternalName
> = {
    [CancellationSecondaryReasonLabel.TooExpensive]:
        CancellationSecondaryReasonInternalName.TooExpensiveForPerceivedValue,
    [CancellationSecondaryReasonLabel.RenewalNotApproved]:
        CancellationSecondaryReasonInternalName.RenewalIncreaseNotApproved,
    [CancellationSecondaryReasonLabel.CostForUsage]:
        CancellationSecondaryReasonInternalName.CostDoesntMatchUsageLevel,
    [CancellationSecondaryReasonLabel.PricingModel]:
        CancellationSecondaryReasonInternalName.PricingModelDoesntFitNeeds,
    [CancellationSecondaryReasonLabel.LackOfSpendControl]:
        CancellationSecondaryReasonInternalName.LackOfSpendControl,
    [CancellationSecondaryReasonLabel.LackOfPaymentTermsFlexibility]:
        CancellationSecondaryReasonInternalName.LackOfPaymentTermsOrLengthTermsFlexibility,
    [CancellationSecondaryReasonLabel.InvoicingOrPaymentMethodIssues]:
        CancellationSecondaryReasonInternalName.InvoicingOrPaymentMethodIssues,
    [CancellationSecondaryReasonLabel.TaxesCurrencyOrFXFriction]:
        CancellationSecondaryReasonInternalName.TaxesCurrencyOrFXFriction,
    [CancellationSecondaryReasonLabel.CriticalFeaturesMissing]:
        CancellationSecondaryReasonInternalName.CriticalFeaturesMissing,
    [CancellationSecondaryReasonLabel.IntegrationGap]:
        CancellationSecondaryReasonInternalName.IntegrationGapWithKeySystems,
    [CancellationSecondaryReasonLabel.CustomizationOrPermissionsLimited]:
        CancellationSecondaryReasonInternalName.CustomizationOrPermissionsTooLimited,
    [CancellationSecondaryReasonLabel.RoadmapTimingWontMeetNeeds]:
        CancellationSecondaryReasonInternalName.RoadmapTimingWontMeetNeeds,
    [CancellationSecondaryReasonLabel.UseCaseEvolvedBeyondProduct]:
        CancellationSecondaryReasonInternalName.UseCaseEvolvedBeyondProductScope,
    [CancellationSecondaryReasonLabel.ProductNegativelyImpactedBusiness]:
        CancellationSecondaryReasonInternalName.TheProductNegativelyImpactedBusiness,
    [CancellationSecondaryReasonLabel.HardToLearnOrTooComplex]:
        CancellationSecondaryReasonInternalName.HardToLearnOrTooComplex,
    [CancellationSecondaryReasonLabel.PoorOnboardingOrTraining]:
        CancellationSecondaryReasonInternalName.PoorOnboardingEnablementOrTraining,
    [CancellationSecondaryReasonLabel.LowInternalAdoptionOrUtilization]:
        CancellationSecondaryReasonInternalName.LowInternalAdoptionOrLowUtilization,
    [CancellationSecondaryReasonLabel.WorkflowMismatch]:
        CancellationSecondaryReasonInternalName.WorkflowMismatchWithTeamProcesses,
    [CancellationSecondaryReasonLabel.DontHaveBandwidthOrOtherPriorities]:
        CancellationSecondaryReasonInternalName.DontHaveTheBandwidthToImplementOrIHaveOtherPriorities,
    [CancellationSecondaryReasonLabel.SlowTimeToValue]:
        CancellationSecondaryReasonInternalName.SlowTimeToValue,
    [CancellationSecondaryReasonLabel.InsufficientROIOrUnclearImpact]:
        CancellationSecondaryReasonInternalName.InsufficientROIOrUnclearImpact,
    [CancellationSecondaryReasonLabel.NotSolvingCoreNeeds]:
        CancellationSecondaryReasonInternalName.NotSolvingCompanysCoreNeeds,
    [CancellationSecondaryReasonLabel.DowntimeIssuesBugsOutagesOrIncidents]:
        CancellationSecondaryReasonInternalName.DowntimeIssuesBugsOutagesOrIncidents,
    [CancellationSecondaryReasonLabel.SlowPerformanceAndLatencyIssues]:
        CancellationSecondaryReasonInternalName.SlowPerformanceAndLatencyIssues,
    [CancellationSecondaryReasonLabel.DataQualityAndAccuracyIssues]:
        CancellationSecondaryReasonInternalName.DataQualityAndAccuracyIssues,
    [CancellationSecondaryReasonLabel.ScaleLimitations]:
        CancellationSecondaryReasonInternalName.ScaleLimitations,
    [CancellationSecondaryReasonLabel.SlowOrIneffectiveSupport]:
        CancellationSecondaryReasonInternalName.SlowOrIneffectiveSupport,
    [CancellationSecondaryReasonLabel.UnresolvedOpenIssues]:
        CancellationSecondaryReasonInternalName.UnresolvedOpenIssues,
    [CancellationSecondaryReasonLabel.LackOfSelfServeGuidance]:
        CancellationSecondaryReasonInternalName.LackOfSelfServeGuidanceToManageAccount,
    [CancellationSecondaryReasonLabel.LackOfProfessionalServices]:
        CancellationSecondaryReasonInternalName.LackOfProfessionalServicesToOptimizeAccount,
    [CancellationSecondaryReasonLabel.DocumentationNotSufficient]:
        CancellationSecondaryReasonInternalName.DocumentationNotSufficient,
    [CancellationSecondaryReasonLabel.CompanyDownsizingOrClosure]:
        CancellationSecondaryReasonInternalName.CompanyDownsizingOrClosure,
    [CancellationSecondaryReasonLabel.MergerAndAcquisition]:
        CancellationSecondaryReasonInternalName.MergerAndAcquisition,
    [CancellationSecondaryReasonLabel.ToolConsolidationOrBuildingInHouseSolution]:
        CancellationSecondaryReasonInternalName.ToolConsolidationOrSwitchingToInHouseSolution,
    [CancellationSecondaryReasonLabel.TeamOrOrganizationalChanges]:
        CancellationSecondaryReasonInternalName.TeamOrOrganizationalChanges,
    [CancellationSecondaryReasonLabel.StrategicShift]:
        CancellationSecondaryReasonInternalName.StrategicShift,
    [CancellationSecondaryReasonLabel.SeasonalPause]:
        CancellationSecondaryReasonInternalName.SeasonalPause,
    [CancellationSecondaryReasonLabel.ProcurementPolicyBarrier]:
        CancellationSecondaryReasonInternalName.ProcurementPolicyBarrier,
    [CancellationSecondaryReasonLabel.BudgetReductionOrSpendingFreeze]:
        CancellationSecondaryReasonInternalName.BudgetReductionOrSpendingFreeze,
    [CancellationSecondaryReasonLabel.DataPrivacyConcerns]:
        CancellationSecondaryReasonInternalName.DataPrivacyConcerns,
    [CancellationSecondaryReasonLabel.MissingComplianceCertifications]:
        CancellationSecondaryReasonInternalName.MissingComplianceCertifications,
    [CancellationSecondaryReasonLabel.SecurityReviewNotPassed]:
        CancellationSecondaryReasonInternalName.SecurityReviewNotPassed,
    [CancellationSecondaryReasonLabel.ContractDPAOrLegalTermsMisalignment]:
        CancellationSecondaryReasonInternalName.ContractDPAOrLegalTermsMisalignment,
}

// fixme(@illia): add  actual content mapping as soon as provided by CSM team.
export const HELPDESK_REASONS_TO_CANDU_CONTENTS: ReasonsToCanduContent[] = []
