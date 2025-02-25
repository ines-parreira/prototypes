import React, {
    ComponentProps,
    ForwardedRef,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react'

import classnames from 'classnames'
import _isEqual from 'lodash/isEqual'
import moment from 'moment'
import { Label } from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import useMeasure from 'hooks/useMeasure'
import { activateRule } from 'models/rule/resources'
import ToggleInput from 'pages/common/forms/ToggleInput'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'
import FakeTicketComponent from 'pages/settings/rules/components/FakeTicketComponent'
import RuleItemButtons from 'pages/settings/rules/components/RuleItemButtons'
import { InstallationError } from 'pages/settings/rules/ruleLibrary/constants'
import { getHasAutomate } from 'state/billing/selectors'
import { ruleUpdated } from 'state/entities/rules/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { ManagedRuleSettings, ManagedRulesSlugs } from 'state/rules/types'
import { convertFromHTML, convertToHTML } from 'utils/editor'

import type { EditorHandle, ManagedRuleEditorProps } from '../RuleFormEditor'
import AutoCloseSpamEditor from './AutoCloseSpamEditor'
import AutoReplyFAQDemo from './AutoReplyFAQDemo'
import AutoReplyFAQEditor from './AutoReplyFAQEditor'
import AutoReplyReturnDemo from './AutoReplyReturnDemo'
import AutoReplyReturnEditor from './AutoReplyReturnEditor'
import AutoReplyWismoDemo from './AutoReplyWismoDemo'
import AutoReplyWismoEditor from './AutoReplyWismoEditor'

import css from './RuleEditor.less'

const forceEditorHtml = (ruleSettings: Record<string, any>) => {
    const settings = { ...ruleSettings }

    Object.keys(settings)
        .filter((key) => key.endsWith('_html'))
        .forEach(
            (key) =>
                (settings[key] = convertToHTML(convertFromHTML(settings[key]))),
        )

    return settings
}

type Props = { slug: ManagedRulesSlugs } & ManagedRuleEditorProps

export type ManagedRuleDetailProps<T> = {
    settings: ManagedRuleSettings<T>
    onChange: () =>
        | ((
              settings: ManagedRuleSettings<T>,
              hasInvalidField?: boolean,
          ) => void)
        | undefined
    handleInstallationError?: (error: InstallationError | null) => void
}

export const ManagedRuleEditor = (
    {
        slug,
        rule,
        handleSubmit,
        handleDelete,
        handleDirtyForm,
        isDeleting,
        isSubmitting,
    }: Props,
    ref: ForwardedRef<EditorHandle>,
) => {
    const [measureRef, { height: editorHeight }] = useMeasure()

    const componentTypes = {
        [ManagedRulesSlugs.AutoCloseSpam]: AutoCloseSpamEditor,
        [ManagedRulesSlugs.AutoReplyWismo]: AutoReplyWismoEditor,
        [ManagedRulesSlugs.AutoReplyFAQ]: AutoReplyFAQEditor,
        [ManagedRulesSlugs.AutoReplyReturn]: AutoReplyReturnEditor,
    }
    const demoTypes = {
        [ManagedRulesSlugs.AutoCloseSpam]: FakeTicketComponent,
        [ManagedRulesSlugs.AutoReplyWismo]: AutoReplyWismoDemo,
        [ManagedRulesSlugs.AutoReplyFAQ]: AutoReplyFAQDemo,
        [ManagedRulesSlugs.AutoReplyReturn]: AutoReplyReturnDemo,
    }
    const Editor = componentTypes[slug]
    const Demo = demoTypes[slug]
    type SettingsType = ComponentProps<typeof Editor>['settings']
    const [editorHasError, setEditorHasError] = useState(false)
    const [settings, setSettings] = useState<SettingsType>(rule.settings)
    const [deactivatedDatetime, setDeactivatedDatetime] = useState(
        rule.deactivated_datetime,
    )
    const [installationError, setInstallationError] =
        useState<InstallationError | null>()

    const dispatch = useAppDispatch()
    const hasAutomate =
        useAppSelector(getHasAutomate) ||
        // Treat auto close spam rule as the user having automate
        slug === ManagedRulesSlugs.AutoCloseSpam
    const hasAgentPrivileges = useHasAgentPrivileges()
    const [
        showAutomationSubscriptionModal,
        setShowAutomationSubscriptionModal,
    ] = useState(false)

    const toggleActivation = () => {
        if (
            !hasAutomate &&
            rule.settings.slug !== ManagedRulesSlugs.AutoCloseSpam
        ) {
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

        handleSubmit(
            {
                id: rule.id,
                deactivated_datetime: newDeactivatedDatetime,
                settings: {
                    ...rule.settings,
                    ...settings,
                },
            },
            editorHasError,
        )
    }, [deactivatedDatetime, rule, settings, handleSubmit, editorHasError])

    useImperativeHandle(ref, () => ({ submit }), [submit])

    const handleResubscribe = async () => {
        try {
            const res = await activateRule(rule.id)
            void dispatch(ruleUpdated(res))
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Rule activated successfully',
                }),
            )
            setDeactivatedDatetime(null)
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Unable to deactivate rule',
                }),
            )
        }
    }

    const originalRuleSettings = useMemo(
        () => forceEditorHtml(rule.settings),
        [rule.settings],
    )

    useEffect(() => {
        const ruleSettings = forceEditorHtml(settings)

        if (!_isEqual(originalRuleSettings, ruleSettings)) {
            handleDirtyForm(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings, deactivatedDatetime])

    const handleChange = () => {
        if (!hasAutomate) {
            void dispatch(
                notify({
                    message:
                        'Please upgrade to an Automate plan to edit this rule',
                    status: NotificationStatus.Error,
                }),
            )
            return
        }
        return (settings: SettingsType, hasInvalidField?: boolean) => {
            setSettings(settings)
            setEditorHasError(!!hasInvalidField)
        }
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
                            className={classnames(css.toggleLabel, 'mr-2 mb-0')}
                        >
                            Enable rule
                        </Label>
                    </span>
                </div>

                <RuleItemButtons
                    ruleId={rule.id}
                    canSubmit={
                        !editorHasError &&
                        hasAgentPrivileges &&
                        !isSubmitting &&
                        hasAutomate &&
                        !installationError
                    }
                    canDuplicate={false}
                    canDelete={hasAgentPrivileges}
                    isDeleting={isDeleting}
                    onDelete={handleDelete}
                    onSubmit={submit}
                />

                {hasAgentPrivileges && (
                    <AutomateSubscriptionModal
                        onClose={() =>
                            setShowAutomationSubscriptionModal(false)
                        }
                        confirmLabel="Upgrade and reactivate"
                        onSubscribe={handleResubscribe}
                        isOpen={showAutomationSubscriptionModal}
                    />
                )}
            </div>
            <div className={css.demoContainer} style={{ height: editorHeight }}>
                <Demo settings={settings} />
            </div>
        </div>
    )
}

export default forwardRef<EditorHandle, Props>(ManagedRuleEditor)
