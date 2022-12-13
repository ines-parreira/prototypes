import React from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import MultiSelectField from 'pages/common/forms/MultiSelectField'
import Alert from 'pages/common/components/Alert/Alert'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {AutoCloseSpamSettings, ManagedRuleSettings} from 'state/rules/types'

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
            <p className="mb-4">
                This rule detects and closes irrelevant emails that don’t
                require a response such as newsletters and spam to save you time
                filtering through tickets.
            </p>
            <Alert icon>
                Keep this rule at the top of your rules to ensure it triggers
                first, preventing irrelevant billable tickets.
            </Alert>
            <div className={css.listWrapper}>
                <h4>Email exclusion list</h4>
                <p>
                    This rule will never trigger on incoming emails from the
                    addresses below.
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
                <h4>Always apply list</h4>
                <p>
                    Emails in the following list will <b>always be closed</b> by
                    this rule.
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
