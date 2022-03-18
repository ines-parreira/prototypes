import React from 'react'
import _noop from 'lodash/noop'

import RuleEditor from 'pages/settings/rules/components/RuleEditor'
import {DefaultModalProps} from '../InstallRuleModalBody'
import css from '../RuleRecipeModal.less'

export const DefaultModal = ({
    triggeredCount,
    handleRule,
    rule,
}: DefaultModalProps) => {
    return (
        <>
            <div className={css.modalBody}>
                <div className={css.modalDescription}>
                    This is a template rule. You can see below the detail of the
                    rule that will be installed on your account. You can always
                    modify this rule like any other rule once installed to
                    better suit your needs!
                </div>
                <div>
                    <div className={css.targetTitle}>target up to</div>
                    <div className={css.targetValue}>
                        <span className={css.bold}>{triggeredCount}</span>{' '}
                        tickets/month
                    </div>
                </div>
            </div>
            <div className={css.ruleEditorContainer}>
                <RuleEditor
                    ruleDraft={rule}
                    actions={handleRule}
                    handleEventChanges={_noop}
                    className={css.ruleEditor}
                />
            </div>
        </>
    )
}
