import classnames from 'classnames'

import { RuleTemplateRecipeSlugs } from '../../constants'
import type { DefaultModalProps } from '../InstallRuleModalBody'
import { AiAgentRequirements } from './components/AiAgentRequirement'
import TargetCount from './components/TargetCount'

import css from '../RuleRecipeModal.less'

const howItWorksText: Record<
    Exclude<
        RuleTemplateRecipeSlugs,
        RuleTemplateRecipeSlugs.AutoCloseSpamFilter
    >,
    string
> = {
    [RuleTemplateRecipeSlugs.AutoCloseStory]:
        'This rule closes tickets created whenever your handle is mentioned in an Instagram story. Use this rule to auto-close these tickets to save time and prioritize important support requests. Keep this rule above auto-reply rules on your rules page to prevent irrelevant billable tickets.',
    [RuleTemplateRecipeSlugs.AutoCloseSocialComments]:
        'This rule closes social comments that aren’t leads or support requests to save you time to prioritize important tickets. Keep this rule above auto-reply rules on your rules page to prevent irrelevant billable tickets.',
    [RuleTemplateRecipeSlugs.ReopenLowCSATAiAgent]:
        'This rule re-opens closed tickets handled by AI Agent when they receive a low CSAT score and adds an internal note for follow-up. Use this rule to route poor AI Agent experiences back to your team for review and recovery.',
    [RuleTemplateRecipeSlugs.AutoTagPrimaryCategories]:
        'This rule tags tickets based on their main order-related intents, and positive or negative sentiments detected in ticket content. Use this rule to group tickets with similar intents and streamline reporting.',
    [RuleTemplateRecipeSlugs.AutoTagSubscriptionCancel]:
        'This rule tags customer requests to cancel or change subscriptions as urgent. Use this rule to prioritize these requests for prompt support and to gather feedback.',
    [RuleTemplateRecipeSlugs.AutoTagVip]:
        'This rule tags tickets based on how much a customer has ordered or spent in Shopify. Use this rule to prioritize and target VIP customers to drive retention and satisfaction.',
    [RuleTemplateRecipeSlugs.AutoCloseIgGiveaway]:
        'This rule closes replies to Instagram giveaways on your account to save you time and prioritize important tickets. Keep this rule above auto-reply rules on your rules page to prevent irrelevant billable tickets.',
    [RuleTemplateRecipeSlugs.AutoTagBusinessHours]:
        'This rule tags tickets created during and outside business hours. Use this rule to track support performance and monitor support coverage during vs. outside business hours.',
    [RuleTemplateRecipeSlugs.AutoTagPotentialCustomer]:
        'This rule tags questions and recommendation requests from customers with no past orders. Use this rule to proactively identify leads for outreach and promotions.',
    [RuleTemplateRecipeSlugs.AutoTagSocialTags]:
        'This rule tags tickets from social channels as questions or leads when the ticket content contains questions or purchase intention. Use this rule to prioritize important requests and organize tickets of similar intent to simplify reporting.',
    [RuleTemplateRecipeSlugs.AutoTagShippingStatus]:
        'This rule tags order status requests as shipped or not shipped based on a shopper’s last Shopify order. Use this rule to save response time by proactively identifying order status and inform the response.',
    [RuleTemplateRecipeSlugs.AutoTagOfflineCapture]:
        'Tags chat tickets coming from the offline capture so that you can create views to separate them from live chat tickets.',
    [RuleTemplateRecipeSlugs.AutoTagAiIgnore]:
        'This rule adds the "ai_ignore" tag to tickets, which will prevent your AI Agent from answering or perform any actions (e.g. auto-tagging).<br/>You can update the conditions in order to exclude tickets coming from certain email addresses, tickets with certain tags, messages from customers that include certain words, etc.',
    [RuleTemplateRecipeSlugs.AutoTagLowCSAT]:
        'This rule tags tickets that receive a low CSAT score and sends an email notification to the admin. Use this rule to quickly identify and address customer dissatisfaction, helping to improve overall service quality and customer satisfaction.',
    [RuleTemplateRecipeSlugs.PriorityByMessageSentiments]:
        'This rule sets the priority of newly created tickets to critical when their message sentiment is identified as threatening, negative, offensive, or urgent. Use this rule to automatically escalate emotionally charged or high-risk tickets and ensure timely and appropriate support responses.',
}

export const DefaultModal = ({
    recipeSlug,
    triggeredCount,
    viewCreationCheckbox,
    aiAgentLink,
}: DefaultModalProps) => (
    <div className={css.container}>
        {recipeSlug === RuleTemplateRecipeSlugs.AutoTagAiIgnore ||
        recipeSlug === RuleTemplateRecipeSlugs.ReopenLowCSATAiAgent ? (
            <div className={css.count}>
                <div className={css.targetTitle}>
                    <AiAgentRequirements aiAgentLink={aiAgentLink} />
                </div>
            </div>
        ) : (
            <TargetCount count={triggeredCount} />
        )}
        <div className={css.descriptionBlock}>
            <h4>How it works</h4>
            <p
                dangerouslySetInnerHTML={{
                    __html: howItWorksText[
                        recipeSlug as Exclude<
                            RuleTemplateRecipeSlugs,
                            RuleTemplateRecipeSlugs.AutoCloseSpamFilter
                        >
                    ],
                }}
            />
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
