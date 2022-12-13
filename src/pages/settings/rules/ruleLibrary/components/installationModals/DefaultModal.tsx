import React from 'react'
import classnames from 'classnames'

import {RuleTemplateRecipeSlugs} from '../../constants'

import {DefaultModalProps} from '../InstallRuleModalBody'
import css from '../RuleRecipeModal.less'
import TargetCount from './components/TargetCount'

const howItWorksText: Record<RuleTemplateRecipeSlugs, string> = {
    [RuleTemplateRecipeSlugs.AutoCloseStory]:
        'This rule closes tickets created whenever your handle is mentioned in an Instagram story. Use this rule to auto-close these tickets to save time and prioritize important support requests. Keep this rule above auto-reply rules on your rules page to prevent irrelevant billable tickets.',
    [RuleTemplateRecipeSlugs.AutoCloseSocialComments]:
        'This rule closes social comments that aren’t leads or support requests to save you time to prioritize important tickets. Keep this rule above auto-reply rules on your rules page to prevent irrelevant billable tickets.',
    [RuleTemplateRecipeSlugs.AutoTagPrimaryCategories]:
        'This rule tags tickets based on their main order-related intents, and positive or negative sentiments detected in ticket content. Use this rule to group tickets with similar intents and streamline reporting.',
    [RuleTemplateRecipeSlugs.AutoTagSubscriptionCancel]:
        'This rule tags shopper requests to cancel or change subscriptions as urgent. Use this rule to prioritize these requests for prompt support and to gather feedback.',
    [RuleTemplateRecipeSlugs.AutoTagVip]:
        'This rule tags tickets based on how much shoppers have ordered or spent in Shopify. Use this rule to pioritize and target VIP customers to drive retention and satisfaction.',
    [RuleTemplateRecipeSlugs.AutoCloseIgGiveaway]:
        'This rule closes replies to Instagram giveaways on your account to save you time and prioritize important tickets. Keep this rule above auto-reply rules on your rules page to prevent irrelevant billable tickets.',
    [RuleTemplateRecipeSlugs.AutoTagBusinessHours]:
        'This rule tags tickets created during and outside business hours. Use this rule to track support performance and monitor support coverage during vs. outside business hours.',
    [RuleTemplateRecipeSlugs.AutoTagPotentialCustomer]:
        'This rule tags questions and recommendation requests from shoppers with no past orders. Use this rule to proactively identify leads for outreach and promotions.',
    [RuleTemplateRecipeSlugs.AutoTagSocialTags]:
        'This rule tags tickets from social channels as questions or leads when the ticket content contains questions or purchase intention. Use this rule to prioritize important requests and organize tickets of similar intent to simplify reporting.',
    [RuleTemplateRecipeSlugs.AutoTagShippingStatus]:
        'This rule tags order status requests as shipped or not shipped based on a shopper’s last Shopify order. Use this rule to save response time by proactively identifying order status and inform the response.',
}

export const DefaultModal = ({
    recipeSlug,
    triggeredCount,
    viewCreationCheckbox,
}: DefaultModalProps) => (
    <div className={css.container}>
        <TargetCount count={triggeredCount} />
        <div className={css.descriptionBlock}>
            <h4>How it works</h4>
            <p>{howItWorksText[recipeSlug as RuleTemplateRecipeSlugs]}</p>
        </div>
        <div className={css.descriptionBlock}>
            <h4>Customize it</h4>
            <p>
                You can customize this rule after installing to fit your needs.
            </p>
        </div>
        <div className={classnames(css.descriptionBlock, 'mb-0')}>
            {viewCreationCheckbox()}
        </div>
    </div>
)
