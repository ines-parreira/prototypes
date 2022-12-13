import React from 'react'

import classnames from 'classnames'

import FakeTicketComponent from 'pages/settings/rules/components/FakeTicketComponent'

import {ManagedRuleModalProps} from '../InstallRuleModalBody'

import defaultModalCss from '../RuleRecipeModal.less'

import TargetCount from './components/TargetCount'

import css from './ManagedRuleModal.less'

export const AutoCloseSpamModal = ({
    triggeredCount,
    viewCreationCheckbox,
}: ManagedRuleModalProps) => (
    <div className={classnames(css.managedRule, css.autoCloseSpam)}>
        <div className={css.container}>
            <div className={css.description}>
                <TargetCount count={triggeredCount} />
                <div className={defaultModalCss.descriptionBlock}>
                    <h4>How it works</h4>
                    <p>
                        This rule detects and closes irrelevant emails that
                        don’t require a response like newsletters and spam to
                        save time spent filtering through tickets. Keep this
                        rule at the top of your rules to ensure it always
                        triggers first and prevents irrelevant billable tickets
                        from being created.
                    </p>
                </div>
                <div className={defaultModalCss.descriptionBlock}>
                    <h4>Customize it</h4>
                    <p>
                        You can exclude email addresses from this rule, and
                        ensure this rule always triggers on incoming emails from
                        certain email addresses.
                    </p>
                </div>
                <div className={defaultModalCss.descriptionBlock}>
                    {viewCreationCheckbox()}
                </div>
            </div>
            <FakeTicketComponent />
        </div>
    </div>
)
