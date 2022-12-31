import React, {
    ComponentProps,
    useCallback,
    useEffect,
    useState,
    useImperativeHandle,
    forwardRef,
    useMemo,
} from 'react'
import {useMeasure} from 'react-use'
import {Label} from 'reactstrap'
import moment from 'moment'
import _isEqual from 'lodash/isEqual'
import classnames from 'classnames'
import {convertFromHTML, convertToHTML} from 'utils/editor'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import {activateRule} from 'models/rule/resources'
import ToggleInput from 'pages/common/forms/ToggleInput'
import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'
import RuleItemButtons from 'pages/settings/rules/components/RuleItemButtons'
import FakeTicketComponent from 'pages/settings/rules/components/FakeTicketComponent'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {ruleUpdated} from 'state/entities/rules/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import {ManagedRuleSettings, ManagedRulesSlugs} from 'state/rules/types'

import {InstallationError} from 'pages/settings/rules/ruleLibrary/constants'
import type {ManagedRuleEditorProps, EditorHandle} from '../RuleFormEditor'
import AutoCloseSpamEditor from './AutoCloseSpamEditor'
import AutoReplyWismoEditor from './AutoReplyWismoEditor'
import AutoReplyWismoDemo from './AutoReplyWismoDemo'
import AutoReplyFAQEditor from './AutoReplyFAQEditor'
import AutoReplyFAQDemo from './AutoReplyFAQDemo'

import css from './RuleEditor.less'

const forceEditorHtml = (ruleSettings: Record<string, any>) => {
    const settings = {...ruleSettings}

    Object.keys(settings)
        .filter((key) => key.endsWith('_html'))
        .forEach(
            (key) =>
                (settings[key] = convertToHTML(convertFromHTML(settings[key])))
        )

    return settings
}

type Props = {slug: ManagedRulesSlugs} & ManagedRuleEditorProps

export type ManagedRuleDetailProps<T> = {
    settings: ManagedRuleSettings<T>
    onChange: () => ((settings: ManagedRuleSettings<T>) => void) | undefined
    handleInstallationError?: (error: InstallationError | null) => void
}

export const ManagedRuleEditor = forwardRef<EditorHandle, Props>(
    (
        {
            slug,
            rule,
            handleSubmit,
            handleDelete,
            handleDirtyForm,
            isDeleting,
            isSubmitting,
        },
        ref
    ) => {
        const [measureRef, {height: editorHeight}] = useMeasure()

        const componentTypes = {
            [ManagedRulesSlugs.AutoCloseSpam]: AutoCloseSpamEditor,
            [ManagedRulesSlugs.AutoReplyWismo]: AutoReplyWismoEditor,
            [ManagedRulesSlugs.AutoReplyFAQ]: AutoReplyFAQEditor,
        }
        const demoTypes = {
            [ManagedRulesSlugs.AutoCloseSpam]: FakeTicketComponent,
            [ManagedRulesSlugs.AutoReplyWismo]: AutoReplyWismoDemo,
            [ManagedRulesSlugs.AutoReplyFAQ]: AutoReplyFAQDemo,
        }
        const Editor = componentTypes[slug]
        const Demo = demoTypes[slug]
        type SettingsType = ComponentProps<typeof Editor>['settings']
        const [settings, setSettings] = useState<SettingsType>(rule.settings)
        const [deactivatedDatetime, setDeactivatedDatetime] = useState(
            rule.deactivated_datetime
        )
        const [installationError, setInstallationError] =
            useState<InstallationError | null>()

        const dispatch = useAppDispatch()
        const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
        const hasAgentPrivileges = useHasAgentPrivileges()
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

        const submit = useCallback(() => {
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
        }, [deactivatedDatetime, rule, settings, handleSubmit])

        useImperativeHandle(ref, () => ({submit}), [submit])

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

        const originalRuleSettings = useMemo(
            () => forceEditorHtml(rule.settings),
            [rule.settings]
        )

        useEffect(() => {
            const ruleSettings = forceEditorHtml(settings)

            if (!_isEqual(originalRuleSettings, ruleSettings)) {
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
            <div className={css.container}>
                <div
                    className={css.editorContainer}
                    ref={measureRef as React.LegacyRef<HTMLDivElement>}
                >
                    <Editor
                        onChange={handleChange}
                        settings={settings}
                        handleInstallationError={setInstallationError}
                    />
                    <div className={css.toggleButtonContainer}>
                        <span>
                            <ToggleInput
                                isToggled={!deactivatedDatetime}
                                onClick={toggleActivation}
                                isDisabled={!hasAgentPrivileges}
                            />
                        </span>
                        <span>
                            <Label
                                className={classnames(
                                    css.toggleLabel,
                                    'mr-2 mb-0'
                                )}
                            >
                                Enable rule
                            </Label>
                        </span>
                    </div>

                    <RuleItemButtons
                        ruleId={rule.id}
                        canSubmit={
                            hasAgentPrivileges &&
                            !isSubmitting &&
                            hasAutomationAddOn &&
                            !installationError
                        }
                        canDuplicate={false}
                        canDelete={hasAgentPrivileges}
                        isDeleting={isDeleting}
                        onDelete={handleDelete}
                        onSubmit={submit}
                    />

                    {hasAgentPrivileges && (
                        <AutomationSubscriptionModal
                            onClose={() =>
                                setShowAutomationSubscriptionModal(false)
                            }
                            confirmLabel="Upgrade and reactivate"
                            onSubscribe={handleResubscribe}
                            isOpen={showAutomationSubscriptionModal}
                        />
                    )}
                </div>
                <div
                    className={css.demoContainer}
                    style={{height: editorHeight}}
                >
                    <Demo settings={settings} />
                </div>
            </div>
        )
    }
)

export default ManagedRuleEditor
