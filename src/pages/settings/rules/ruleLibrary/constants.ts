import {RuleRecipeTag} from 'models/ruleRecipe/types'

export enum InstallationError {
    MaxRulesReached = 'max-rule-reached',
    NoHelpCenter = 'no-help-center',
}

export const InstallationErrorMessage = {
    [InstallationError.NoHelpCenter]:
        'This rule requires an active Help Center.',
    [InstallationError.MaxRulesReached]:
        'You’ve reached the maximum number of rules. Delete an existing rule to install this one.',
}

export const tagColors: {
    [key: string]: {color: string; backgroundColor: string}
} = {
    [RuleRecipeTag.AUTO_TAG]: {color: '#00796B', backgroundColor: '#EAFFEF'},
    [RuleRecipeTag.AUTO_CLOSE]: {color: '#9411B5', backgroundColor: '#EDEAFF'},
    [RuleRecipeTag.AUTO_REPLY]: {color: '#3373DB', backgroundColor: '#F6F9FF'},
}

export enum RuleTemplateRecipeSlugs {
    AutoCloseStory = 'auto-close-story-recipe',
    AutoCloseSocialComments = 'auto-close-social-comments-recipe',
    AutoTagPrimaryCategories = 'auto-tag-primary-categories',
    AutoTagSubscriptionCancel = 'auto-tag-subscription-cancel-recipe',
    AutoTagVip = 'auto-tag-vip-recipe',
    AutoCloseIgGiveaway = 'auto-close-ig-givewaway-recipe',
    AutoTagBusinessHours = 'auto-tag-business-hours-recipe',
    AutoTagPotentialCustomer = 'auto-tag-potential-customer-recipe',
    AutoTagSocialTags = 'auto-tag-social-tags',
    AutoTagShippingStatus = 'auto-tag-shipping-status',
}
