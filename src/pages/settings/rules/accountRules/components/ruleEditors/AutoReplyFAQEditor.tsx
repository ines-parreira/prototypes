import React, {useEffect, useState} from 'react'
import classnames from 'classnames'
import {Map, fromJS} from 'immutable'
import MultiSelectField from 'pages/common/forms/MultiSelectField'
import {AutoReplyFAQSettings} from 'state/rules/types'
import ResponseAction from 'pages/tickets/common/macros/components/actions/ResponseAction'
import {HelpCenter} from 'models/helpCenter/types'
import {MacroActionName} from 'models/macroAction/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Option, Value} from 'pages/common/forms/SelectField/types'
import useAppSelector from 'hooks/useAppSelector'
import {getActiveHelpCenterList} from 'state/entities/helpCenter/helpCenters'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {InstallationError} from 'pages/settings/rules/ruleLibrary/constants'

import {ManagedRuleDetailProps} from './ManagedRuleEditor'
import css from './ManagedRuleEditor.less'

type HelpCenterDropdownProps = {
    selectedValue: number
    helpCenters: HelpCenter[]
    onChange: (helpCenterId: Value) => void
}

const HelpCenterSelectField = ({
    selectedValue,
    helpCenters,
    onChange,
}: HelpCenterDropdownProps) => {
    const options = helpCenters.map(
        (helpCenter) =>
            ({
                value: helpCenter.id,
                label: helpCenter.name,
                text: helpCenter.name,
            } as Option)
    )
    return (
        <SelectField
            options={options}
            onChange={onChange}
            value={selectedValue}
            required={true}
            fullWidth
        />
    )
}

type Props = ManagedRuleDetailProps<AutoReplyFAQSettings> & {
    handleInstallationError: (error: InstallationError | null) => void
}

export const AutoReplyFAQEditor = ({
    settings,
    onChange,
    handleInstallationError,
}: Props) => {
    const handleChange = onChange()
    const helpCenters = useAppSelector(getActiveHelpCenterList)
    const [initialHelpCenterId] = useState(settings.help_center_id)
    useHelpCenterList({per_page: 900})

    const handleBlocklist = (block_list: string[]) => {
        if (!handleChange) {
            return
        }
        void handleChange({...settings, block_list: block_list})
    }

    const handleBodyChange = (index: number, args: Map<string, any>) => {
        if (!handleChange) {
            return
        }
        void handleChange({
            ...settings,
            body_html: args.get('body_html'),
            body_text: args.get('body_text'),
        })
    }

    const handleSignatureChange = (index: number, args: Map<string, any>) => {
        if (!handleChange) {
            return
        }
        void handleChange({
            ...settings,
            signature_html: args.get('body_html'),
            signature_text: args.get('body_text'),
        })
    }

    const handleChangeHelpCenter = (helpCenterId: Value) => {
        if (!handleChange) {
            return
        }
        void handleChange({
            ...settings,
            help_center_id: helpCenterId as number,
        })
    }

    const isHelpCenterAvailable = !!helpCenters.find(
        (helpCenter) => helpCenter.id === settings.help_center_id
    )

    const shouldDisplayHelpCenterList =
        helpCenters.length > 1 ||
        (!!helpCenters.length && !isHelpCenterAvailable) ||
        initialHelpCenterId !== settings.help_center_id

    useEffect(
        () =>
            !isHelpCenterAvailable
                ? handleInstallationError(InstallationError.NoHelpCenter)
                : handleInstallationError(null),
        [isHelpCenterAvailable, handleInstallationError]
    )

    return (
        <div className={classnames(css.container, css.autoReplyFAQ)}>
            <p>
                This rule detects shopper questions in incoming emails, replies
                with relevant articles from your help center, and closes the
                ticket. If shoppers reply, the ticket will reopen so you never
                miss a response.
            </p>
            {helpCenters.length > 1 && isHelpCenterAvailable && (
                <Alert type={AlertType.Warning} icon>
                    You have more than 1 help center. Ensure the desired help
                    center is selected below.
                </Alert>
            )}
            {!isHelpCenterAvailable && (
                <Alert type={AlertType.Error} icon>
                    Your previously selected help center was deleted or
                    deactivated. Please{' '}
                    {helpCenters.length ? 'select' : 'create'} a new one to
                    reactivate this rule.
                </Alert>
            )}
            {shouldDisplayHelpCenterList && (
                <div className={css.listWrapper}>
                    <h4>Help Center</h4>
                    <HelpCenterSelectField
                        helpCenters={helpCenters}
                        onChange={handleChangeHelpCenter}
                        selectedValue={settings.help_center_id!}
                    />
                </div>
            )}
            <div className={css.listWrapper}>
                <h4>Exclusion email list</h4>
                <p>
                    Emails in the following list will never be replied to by
                    this rule.
                </p>
                <MultiSelectField
                    allowCustomValues={true}
                    values={settings.block_list}
                    onChange={handleBlocklist}
                    className={css.blockList}
                    singular="email"
                    plural="emails"
                />
            </div>
            <div className={css.listWrapper}>
                <h4>Message above article preview</h4>
                <ResponseAction
                    type={MacroActionName.SetResponseText}
                    action={fromJS({
                        arguments: {
                            body_text: settings.body_text,
                            body_html: settings.body_html,
                        },
                    })}
                    index={0}
                    updateActionArgs={handleBodyChange}
                    ignoredVariables={['shopify', 'recharge', 'smile']}
                    toolbarOnTop
                />
            </div>
            <div className={css.listWrapper}>
                <h4>Message below article preview</h4>
                <ResponseAction
                    type={MacroActionName.SetResponseText}
                    action={fromJS({
                        arguments: {
                            body_text: settings.signature_text,
                            body_html: settings.signature_html,
                        },
                    })}
                    index={1}
                    updateActionArgs={handleSignatureChange}
                    ignoredVariables={['shopify', 'recharge', 'smile']}
                    toolbarOnTop
                />
            </div>
        </div>
    )
}

export default AutoReplyFAQEditor
