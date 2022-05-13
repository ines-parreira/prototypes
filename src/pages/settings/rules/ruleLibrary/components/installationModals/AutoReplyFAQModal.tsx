import classnames from 'classnames'
import React from 'react'
import type {ManagedRuleModalProps} from '../InstallRuleModalBody'

import defaultModalCss from '../RuleRecipeModal.less'
import css from './ManagedRuleModal.less'

export const AutoReplyFAQModal = ({
    rule,
    triggeredCount,
    isBehindPaywall,
    renderTags,
    viewCreationCheckbox,
}: ManagedRuleModalProps) => {
    return (
        <div
            className={classnames(css.managedRule, css.autoReplyFAQ, {
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
                        {/* TODO: Insert description */}
                    </div>
                    <div className={css.descriptionBlock}>
                        {viewCreationCheckbox()}
                    </div>
                    <div className={css.example}>
                        <div
                            className={classnames(
                                css.exampleContainer,
                                css.bordered
                            )}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
