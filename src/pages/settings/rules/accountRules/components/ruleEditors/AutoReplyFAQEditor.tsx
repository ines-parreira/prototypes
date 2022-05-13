import React from 'react'
import classnames from 'classnames'
import MultiSelectField from 'pages/common/forms/MultiSelectField'
import {AutoReplyFAQSettings, ManagedRulesSlugs} from 'state/rules/types'
import LinkToRecipeView from './LinkToRecipeView'

import {ManagedRuleDetailProps} from './ManagedRuleEditor'
import css from './ManagedRuleEditor.less'

export const AutoReplyFAQEditor = ({
    settings,
    onChange,
}: ManagedRuleDetailProps<AutoReplyFAQSettings>) => {
    const handleChange = onChange()

    const handleBlocklist = (block_list: string[]) => {
        if (!handleChange) {
            return
        }
        void handleChange({...settings, block_list: block_list})
    }
    return (
        <div className={classnames(css.container, css.autoReplyWismo)}>
            <div className={css.descriptionWrapper}>
                <h3>Rule description</h3>
                <p>
                    <LinkToRecipeView
                        recipeSlug={ManagedRulesSlugs.AutoReplyFAQ}
                    >
                        You can see tickets closed by this rule anytime using
                        this link
                    </LinkToRecipeView>
                </p>
                <div className={css.listWrapper}>
                    <h4>Exclusion email list</h4>
                    <p>
                        Emails in the following list will never be replied to by
                        this auto reply rule.
                    </p>
                    <MultiSelectField
                        allowCustomValues={true}
                        values={settings.block_list}
                        onChange={handleBlocklist}
                        className={css.blockList}
                    />
                </div>
                <div className={css.demo}></div>
            </div>
        </div>
    )
}

export default AutoReplyFAQEditor
