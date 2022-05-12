import React from 'react'

import classnames from 'classnames'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import {ManagedRuleModalProps} from '../InstallRuleModalBody'
import defaultModalCss from '../RuleRecipeModal.less'

import css from './ManagedRuleModal.less'

export const AutoCloseSpamModal = ({
    rule,
    triggeredCount,
    isBehindPaywall,
    renderTags,
    viewCreationCheckbox,
}: ManagedRuleModalProps) => {
    type FakeTicketProps = {
        title: string
        description: string
        closed: boolean
    }
    const FakeTicketComponent = ({
        title,
        description,
        closed,
    }: FakeTicketProps) => (
        <div className={css.fakeTicket}>
            <div className={css.fakeTicketTitleWrapper}>
                <span className={css.fakeTicketTitle}>{title}</span>
                {closed && (
                    <Badge
                        type={ColorType.Error}
                        className={css.fakeTicketClosed}
                    >
                        closed
                    </Badge>
                )}
            </div>
            <div className={css.fakeTicketDescription}>{description}</div>
        </div>
    )

    const fakeTickets = [
        {
            title: 'Newsletter',
            description: 'Check out our new product!',
            closed: true,
        },
        {
            title: 'Product question',
            description: 'I have ordered...',
            closed: false,
        },
        {
            title: 'Promotion! -50%...',
            description: 'Until Monday all of our products...',
            closed: true,
        },
    ]

    return (
        <div
            className={classnames(css.managedRule, css.autoCloseSpam, {
                [css.bordered]: isBehindPaywall,
            })}
        >
            {isBehindPaywall && (
                <div className={css.titleWrapper}>
                    <span className={css.title}>{rule.name}</span>
                    {renderTags()}
                </div>
            )}
            <div className={css.container}>
                <div className={css.description}>
                    <div className={css.count}>
                        <div className={defaultModalCss.targetTitle}>
                            target up to
                        </div>
                        <div className={defaultModalCss.targetValue}>
                            <span className={defaultModalCss.bold}>
                                {triggeredCount}
                            </span>{' '}
                            tickets/month
                        </div>
                    </div>
                    <div className={css.descriptionBlock}>
                        <h4>Close unwanted emails</h4>
                        <p>
                            This rule automatically checks and closes emails
                            that are not related to a customer support request
                            (e.g. newsletters, sales outreach messages...)
                        </p>
                    </div>
                    <div className={css.descriptionBlock}>
                        <h4>Allow or block some email addresses</h4>
                        <p>
                            You'll be able to add allowed email addresses and
                            blocked email addresses in the rules settings,
                            allowing a more precise control on your workflow.
                            Emails coming from the allowed or blocked lists will
                            respectively never or always be closed by this rule.
                        </p>
                    </div>
                    <div className={css.descriptionBlock}>
                        <h4>Monitor closed tickets </h4>
                        <p>
                            All the auto closed tickets are tagged with an
                            "auto-close" and "non-support-related" tags. This
                            will allow you to find them easily in case you want
                            to monitor which tickets the rule is closing.
                        </p>
                    </div>
                    <div className={css.descriptionBlock}>
                        {viewCreationCheckbox()}
                    </div>
                </div>
                <div className={classnames(css.example, css.bordered)}>
                    {fakeTickets.map((ticket: FakeTicketProps, idx) => (
                        <FakeTicketComponent key={idx} {...ticket} />
                    ))}
                </div>
            </div>
        </div>
    )
}
