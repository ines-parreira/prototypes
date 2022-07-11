import React from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import MultiSelectField from 'pages/common/forms/MultiSelectField'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    AutoCloseSpamSettings,
    ManagedRuleSettings,
    ManagedRulesSlugs,
} from 'state/rules/types'
import LinkToRecipeView from './LinkToRecipeView'

import {ManagedRuleDetailProps} from './ManagedRuleEditor'

import css from './ManagedRuleEditor.less'

export const AutoCloseSpamEditor = ({
    settings,
    onChange,
}: ManagedRuleDetailProps<AutoCloseSpamSettings>) => {
    const dispatch = useAppDispatch()
    const setAllowlist = (newList: string[]) => ({
        ...settings,
        allow_list: newList,
    })
    const setBlocklist = (newList: string[]) => ({
        ...settings,
        block_list: newList,
    })

    const changeHandler = (
        newList: string[],
        otherList: string[],
        callback: (
            values: string[]
        ) => ManagedRuleSettings<AutoCloseSpamSettings>
    ) => {
        const handleChange = onChange()
        if (!handleChange) {
            return
        }
        const newValue = newList[newList.length - 1]
        if (newValue) {
            const overlap = otherList.find(
                (other) => other.includes(newValue) || newValue.includes(other)
            )
            if (overlap) {
                void dispatch(
                    notify({
                        message: `"<b>${newValue}"</b> is already included in the other list as <b>"${overlap}"</b>`,
                        status: NotificationStatus.Error,
                        allowHTML: true,
                    })
                )
                return
            }
        }
        const newSettings = callback(newList)
        void handleChange(newSettings)
    }

    return (
        <div className={css.container}>
            <h3>Rule description</h3>
            <p>
                This rules leverages machine learning to auto-close tickets
                unrelated to a customer support request.
            </p>
            <p>
                For best results, make sure that this rule is triggering before
                all other rules by putting it at the top of your rule list.
            </p>
            <p>
                <LinkToRecipeView recipeSlug={ManagedRulesSlugs.AutoCloseSpam}>
                    You can see tickets closed by this rule anytime using this
                    link
                </LinkToRecipeView>
            </p>
            <div className={css.listWrapper}>
                <h4>Accept list</h4>
                <p>
                    Emails in the following list will never be closed by this
                    auto close rule.
                </p>
                <MultiSelectField
                    allowCustomValues={true}
                    values={settings.allow_list}
                    onChange={(values) =>
                        changeHandler(
                            values,
                            settings.block_list || [],
                            setAllowlist
                        )
                    }
                    className={css.allowList}
                    singular="email"
                    plural="emails"
                />
            </div>
            <div className={css.listWrapper}>
                <h4>Block list</h4>
                <p>
                    Emails in the following list will always be closed by this
                    auto close rule.
                </p>
                <MultiSelectField
                    allowCustomValues={true}
                    values={settings.block_list}
                    onChange={(values) =>
                        changeHandler(
                            values,
                            settings.allow_list || [],
                            setBlocklist
                        )
                    }
                    className={css.blockList}
                    singular="email"
                    plural="emails"
                />
            </div>
        </div>
    )
}

export default AutoCloseSpamEditor
