import React, {ComponentProps, useEffect, useState} from 'react'
import {Label} from 'reactstrap'
import moment from 'moment'

import classnames from 'classnames'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {activateRule} from 'models/rule/resources'
import ToggleInput from 'pages/common/forms/ToggleInput'
import AutomationSubscriptionModal from 'pages/settings/billing/automation/AutomationSubscriptionModal'
import RuleItemButtons from 'pages/settings/rules/components/RuleItemButtons'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {ruleUpdated} from 'state/entities/rules/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import {ManagedRuleSettings, ManagedRulesSlugs} from 'state/rules/types'

import type {ManagedRuleEditorProps} from '../RuleFormEditor'
import AutoCloseSpamEditor from './AutoCloseSpamEditor'

import css from './RuleEditor.less'

type Props = {slug: ManagedRulesSlugs} & ManagedRuleEditorProps

export type ManagedRuleDetailProps<T> = {
    settings: ManagedRuleSettings<T>
    onChange: () => ((settings: ManagedRuleSettings<T>) => void) | undefined
}

export const ManagedRuleEditor = ({
    slug,
    rule,
    handleSubmit,
    handleDelete,
    handleDirtyForm,
    isDeleting,
    isSubmitting,
}: Props) => {
    const componentTypes = {
        [ManagedRulesSlugs.AutoCloseSpam]: AutoCloseSpamEditor,
    }
    const Editor = componentTypes[slug]
    type SettingsType = ComponentProps<typeof Editor>['settings']
    const [settings, setSettings] = useState<SettingsType>(rule.settings)
    const [deactivatedDatetime, setDeactivatedDatetime] = useState(
        rule.deactivated_datetime
    )

    const dispatch = useAppDispatch()
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const [
        showAutomationSubscriptionModal,
        setShowAutomationSubscriptionModal,
    ] = useState(false)

    const toggleActivation = () => {
        if (!hasAutomationAddOn) {
            setShowAutomationSubscriptionModal(true)
            return
        }
        if (deactivatedDatetime) {
            setDeactivatedDatetime(null)
        } else {
            setDeactivatedDatetime(moment.utc().toISOString())
        }
    }

    const submit = () => {
        const newDeactivatedDatetime =
            !deactivatedDatetime === !rule.deactivated_datetime
                ? rule.deactivated_datetime
                : deactivatedDatetime

        handleSubmit({
            id: rule.id,
            deactivated_datetime: newDeactivatedDatetime,
            settings: {
                ...rule.settings,
                ...settings,
            },
        })
    }

    const handleResubscribe = async () => {
        try {
            const res = await activateRule(rule.id)
            void dispatch(ruleUpdated(res))
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Rule activated successfully',
                })
            )
            setDeactivatedDatetime(null)
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Unable to deactivate rule',
                })
            )
        }
    }

    useEffect(() => {
        if (
            rule.settings !== settings &&
            !rule.deactivated_datetime !== !deactivatedDatetime
        ) {
            handleDirtyForm(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings, deactivatedDatetime])

    const handleChange = () => {
        if (!hasAutomationAddOn) {
            void dispatch(
                notify({
                    message:
                        'Please upgrade to an automation add-on plan to edit this rule',
                    status: NotificationStatus.Error,
                })
            )
            return
        }
        return (settings: SettingsType) => setSettings(settings)
    }

    return (
        <div>
            <Editor onChange={handleChange} settings={settings} />
            <div className={css.toggleButtonContainer}>
                <span>
                    <ToggleInput
                        isToggled={!deactivatedDatetime}
                        onClick={toggleActivation}
                    />
                </span>
                <span>
                    <Label className={classnames(css.toggleLabel, 'mr-2')}>
                        Enable rule
                    </Label>
                </span>
            </div>

            <RuleItemButtons
                ruleId={rule.id}
                canSubmit={!isSubmitting && hasAutomationAddOn}
                canDuplicate={false}
                isDeleting={isDeleting}
                onDelete={handleDelete}
                onSubmit={submit}
            />

            <AutomationSubscriptionModal
                onClose={() => setShowAutomationSubscriptionModal(false)}
                confirmLabel="Upgrade and reactivate"
                onSubscribe={handleResubscribe}
                isOpen={showAutomationSubscriptionModal}
            />
        </div>
    )
}

export default ManagedRuleEditor
