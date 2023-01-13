import React, {useEffect} from 'react'
import {useStateValidator, useMap} from 'react-use'
import {fromJS} from 'immutable'
import classnames from 'classnames'
import isURL from 'validator/lib/isURL'
import MultiSelectField from 'pages/common/forms/MultiSelectField'
import InputField from 'pages/common/forms/input/InputField'
import {AutoReplyReturnSettings} from 'state/rules/types'
import ResponseAction from 'pages/tickets/common/macros/components/actions/ResponseAction'
import {MacroActionName} from 'models/macroAction/types'

import {ManagedRuleDetailProps} from './ManagedRuleEditor'

import css from './ManagedRuleEditor.less'

export const AutoReplyReturnEditor = ({
    settings,
    onChange,
}: ManagedRuleDetailProps<AutoReplyReturnSettings>) => {
    const [settingsFields, {set: setSettingsField}] = useMap<
        Omit<typeof settings, 'slug'>
    >({...settings, return_portal_url: settings.return_portal_url ?? ''})

    const [[hasInvalidField, fieldsErrorMessage]] = useStateValidator<
        [boolean, {[key in keyof typeof settingsFields]: string}],
        typeof settingsFields
    >(settingsFields, (state) => {
        const errorMessage: {[key in keyof typeof settingsFields]: string} = {}
        if (
            !state.return_portal_url ||
            !isURL(state.return_portal_url, {require_protocol: false})
        ) {
            errorMessage.return_portal_url = 'Enter a valid URL.'
        } else if (
            !isURL(state.return_portal_url, {
                require_valid_protocol: true,
                require_protocol: true,
                protocols: ['http', 'https'],
            })
        ) {
            errorMessage.return_portal_url =
                'Enter a valid URL. Missing "https://" or "http://" protocol (e.g. "https://link.com" instead of "link.com")'
        }

        return [Object.keys(errorMessage).length > 0, errorMessage]
    })

    useEffect(() => {
        onChange()?.({...settings, ...settingsFields}, hasInvalidField)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settingsFields, hasInvalidField])

    return (
        <>
            <div className={classnames(css.container, css.autoReplyReturn)}>
                <p>
                    This rule detects emails related to return requests,
                    auto-replies with the link to your return portal, and
                    auto-closes the ticket. If shoppers reply, the ticket will
                    reopen so you never miss a response.
                </p>
                <div className={css.listWrapper}>
                    <InputField
                        label="Return portal URL"
                        type="url"
                        caption="Enter the URL for your return portal."
                        error={fieldsErrorMessage?.return_portal_url}
                        value={settingsFields.return_portal_url ?? ''}
                        onChange={(return_portal_url) =>
                            setSettingsField(
                                'return_portal_url',
                                return_portal_url
                            )
                        }
                        isRequired
                    />
                </div>
                <div className={css.listWrapper}>
                    <h4>Exclusion email list</h4>
                    <p>
                        This rule will never trigger on incoming emails from the
                        addresses below.
                    </p>
                    <MultiSelectField
                        allowCustomValues={true}
                        values={settingsFields.block_list}
                        onChange={(block_list) =>
                            setSettingsField('block_list', block_list)
                        }
                        className={css.allowList}
                        singular="email"
                        plural="emails"
                    />
                </div>
                <div className={css.listWrapper}>
                    <h4>Message above return portal link</h4>
                    <ResponseAction
                        type={MacroActionName.SetResponseText}
                        action={fromJS({
                            arguments: {
                                body_text: settingsFields.body_text,
                                body_html: settingsFields.body_html,
                            },
                        })}
                        index={0}
                        updateActionArgs={(index, args) => {
                            setSettingsField('body_html', args.get('body_html'))
                            setSettingsField('body_text', args.get('body_text'))
                        }}
                        ignoredVariables={['shopify']}
                        toolbarOnTop={true}
                    />
                </div>
                <div className={css.listWrapper}>
                    <h4>Message below return portal link</h4>
                    <ResponseAction
                        type={MacroActionName.SetResponseText}
                        action={fromJS({
                            arguments: {
                                body_text: settingsFields.signature_text,
                                body_html: settingsFields.signature_html,
                            },
                        })}
                        index={1}
                        updateActionArgs={(index, args) => {
                            setSettingsField(
                                'signature_html',
                                args.get('body_html')
                            )
                            setSettingsField(
                                'signature_text',
                                args.get('body_text')
                            )
                        }}
                        ignoredVariables={['shopify']}
                        toolbarOnTop={true}
                    />
                </div>
            </div>
        </>
    )
}

export default AutoReplyReturnEditor
