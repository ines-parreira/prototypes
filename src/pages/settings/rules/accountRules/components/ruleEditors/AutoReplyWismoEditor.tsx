import React from 'react'

import {fromJS, Map} from 'immutable'
import classnames from 'classnames'
import MultiSelectField from 'pages/common/forms/MultiSelectField'
import {AutoReplyWismoSettings} from 'state/rules/types'
import ResponseAction from 'pages/tickets/common/macros/components/actions/ResponseAction'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationsByType} from 'state/integrations/selectors'
import {IntegrationType, ShopifyIntegration} from 'models/integration/types'
import {MacroActionName} from 'models/macroAction/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {ManagedRuleDetailProps} from './ManagedRuleEditor'

import css from './ManagedRuleEditor.less'

export const AutoReplyWismoEditor = ({
    settings,
    onChange,
}: ManagedRuleDetailProps<AutoReplyWismoSettings>) => {
    const integrations = useAppSelector(
        getIntegrationsByType<ShopifyIntegration>(IntegrationType.Shopify)
    )

    const handleBlocklist = (block_list: string[]) => {
        void onChange()?.({...settings, block_list: block_list})
    }

    const handleBodyChange = (index: number, args: Map<string, any>) => {
        void onChange()?.({
            ...settings,
            body_html: args.get('body_html'),
            body_text: args.get('body_text'),
        })
    }

    const handleSignatureChange = (index: number, args: Map<string, any>) => {
        void onChange()?.({
            ...settings,
            signature_html: args.get('body_html'),
            signature_text: args.get('body_text'),
        })
    }

    return (
        <>
            {integrations.length === 0 && (
                <Alert type={AlertType.Warning} icon={true} className="mb-3">
                    This rule requires at least one Shopify integration to run.
                </Alert>
            )}
            <div className={classnames(css.container, css.autoReplyWismo)}>
                <p>
                    This rule detects emails related to order status or
                    tracking, replies with tracking links for the shopper’s last
                    3 orders, and auto-closes the ticket. If shoppers reply, the
                    ticket will reopen so you never miss a response.
                </p>
                <div className={css.listWrapper}>
                    <h4>Exclusion email list</h4>
                    <p>
                        This rule will never trigger on incoming emails from the
                        addresses below.
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
                    <h4>Message above tracking links</h4>
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
                        ignoredVariables={['shopify']}
                        toolbarOnTop={true}
                    />
                </div>
                <div className={css.listWrapper}>
                    <h4>Message below tracking links</h4>
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
                        ignoredVariables={['shopify']}
                        toolbarOnTop={true}
                    />
                </div>
            </div>
        </>
    )
}

export default AutoReplyWismoEditor
