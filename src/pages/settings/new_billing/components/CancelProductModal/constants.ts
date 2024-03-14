import {isProduction} from 'utils/environment'
import {CancellationReason, ReasonsToCanduContent} from './types'

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
    DoesNotFitMyNeeds = "Doesn't fit my needs",
    InternalReasons = 'Internal reasons',
    PoorExperience = 'Poor experience',
    Pricing = 'Pricing',
    Product = 'Product',
}

export enum HelpdeskSecondaryReasonLabel {
    BusinessSlowingDown = 'Business slowing down',
    ClosingStore = 'Closing store',
    ConsolidatingAccounts = 'Consolidating accounts',
    GotAcquired = 'Got acquired',
    HelpdeskPricingTiers = 'Helpdesk pricing tiers',
    InadequateHelp = 'Inadequate help',
    NotAnEcommerceStore = 'Not an ecommerce store',
    TooExpensive = 'Too expensive',
    DifficultUIUX = 'Difficult UI/UX',
    OutagesAndStability = 'Outages and stability',
    IDontGetEnoughTickets = "I don't get enough tickets",
    IDontSeeTheValue = "I don't see the value",
    Features = 'Features',
}
export const HELPDESK_CANCELLATION_REASONS: CancellationReason[] = [
    {
        primaryReason: {
            label: HelpdeskPrimaryReasonLabel.DoesNotFitMyNeeds,
        },
        secondaryReasons: [
            {label: HelpdeskSecondaryReasonLabel.IDontGetEnoughTickets},
            {label: HelpdeskSecondaryReasonLabel.NotAnEcommerceStore},
            {label: CommonReasonLabel.Other},
        ],
    },
    {
        primaryReason: {label: HelpdeskPrimaryReasonLabel.InternalReasons},
        secondaryReasons: [
            {label: HelpdeskSecondaryReasonLabel.BusinessSlowingDown},
            {label: HelpdeskSecondaryReasonLabel.ClosingStore},
            {label: HelpdeskSecondaryReasonLabel.ConsolidatingAccounts},
            {label: HelpdeskSecondaryReasonLabel.GotAcquired},
            {label: CommonReasonLabel.Other},
        ],
    },
    {
        primaryReason: {label: HelpdeskPrimaryReasonLabel.PoorExperience},
        secondaryReasons: [
            {label: HelpdeskSecondaryReasonLabel.IDontSeeTheValue},
            {label: HelpdeskSecondaryReasonLabel.InadequateHelp},
            {label: CommonReasonLabel.Other},
        ],
    },
    {
        primaryReason: {label: HelpdeskPrimaryReasonLabel.Pricing},
        secondaryReasons: [
            {label: HelpdeskSecondaryReasonLabel.HelpdeskPricingTiers},
            {label: HelpdeskSecondaryReasonLabel.TooExpensive},
            {label: CommonReasonLabel.Other},
        ],
    },
    {
        primaryReason: {label: HelpdeskPrimaryReasonLabel.Product},
        secondaryReasons: [
            {label: HelpdeskSecondaryReasonLabel.DifficultUIUX},
            {label: HelpdeskSecondaryReasonLabel.Features},
            {label: HelpdeskSecondaryReasonLabel.OutagesAndStability},
            {label: CommonReasonLabel.Other},
        ],
    },
    {
        primaryReason: {label: CommonReasonLabel.IPreferNotToSay},
        secondaryReasons: [],
    },
    {
        primaryReason: {label: CommonReasonLabel.Other},
        secondaryReasons: [],
    },
]

// fixme(@illia): add  actual content mapping as soon as provided by CSM team.
export const HELPDESK_REASONS_TO_CANDU_CONTENTS: ReasonsToCanduContent[] = []
