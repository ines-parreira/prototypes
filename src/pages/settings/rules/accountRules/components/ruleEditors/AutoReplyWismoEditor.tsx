import React from 'react'

import _noop from 'lodash/noop'
import {fromJS, Map} from 'immutable'
import classnames from 'classnames'
import MultiSelectField from 'pages/common/forms/MultiSelectField'
import {AutoReplyWismoSettings, ManagedRulesSlugs} from 'state/rules/types'
import SetResponseTextAction from 'pages/tickets/common/macros/components/actions/SetResponseTextAction'
import RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import shopify from 'assets/img/integrations/shopify.png'

import {FakeOrderTracking} from 'pages/settings/rules/components/FakeOrderTracking'
import LinkToRecipeView from './LinkToRecipeView'
import {ManagedRuleDetailProps} from './ManagedRuleEditor'

import css from './ManagedRuleEditor.less'

export const AutoReplyWismoEditor = ({
    settings,
    onChange,
}: ManagedRuleDetailProps<AutoReplyWismoSettings>) => {
    const integrations = useAppSelector(
        getIntegrationsByTypes(IntegrationType.Shopify)
    )

    const handleChange = onChange()
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

    return (
        <>
            {integrations.size === 0 && (
                <Alert type={AlertType.Warning} icon={true} className="mb-3">
                    This rule requires at least one Shopify integration to run.
                </Alert>
            )}
            <div className={classnames(css.container, css.autoReplyWismo)}>
                <div className={css.descriptionWrapper}>
                    <h3>Rule description</h3>
                    <p>
                        Automatically respond to the common{' '}
                        <em>"Where is my order?"</em> email with tracking links
                        for the shopper's last 3 orders.
                    </p>
                    <p>
                        <LinkToRecipeView
                            recipeSlug={ManagedRulesSlugs.AutoReplyWismo}
                        >
                            You can see tickets closed by this rule anytime
                            using this link
                        </LinkToRecipeView>
                    </p>
                    <div className={css.listWrapper}>
                        <h4>Exclusion email list</h4>
                        <p>
                            Emails in the following list will never be replied
                            to by this auto reply rule.
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
                        <h4>Message body</h4>
                        <SetResponseTextAction
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
                    <div
                        className={classnames(
                            css.listWrapper,
                            css.trackingBlock
                        )}
                    >
                        <div className={css.title}>
                            <div>
                                <img
                                    src={shopify}
                                    className={css.shopifyIcon}
                                    alt="shopify logo"
                                />
                            </div>
                            <div>Tracking number information</div>
                        </div>
                        <div>
                            Order tracking link and information will be added
                            here
                        </div>
                    </div>
                    <div className={css.listWrapper}>
                        <h4>Signature</h4>
                        <SetResponseTextAction
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
                <div className={css.demo}>
                    <div className={css.topbar}>
                        <div className={css.circle} />
                        <div className={css.circle} />
                        <div className={css.circle} />
                    </div>
                    <div className={css.demoContent}>
                        <div className={css.textdata}>
                            <div>
                                <div className={css.previewLegend}>
                                    Message body
                                </div>
                                <div className={css.previewBodyWrapper}>
                                    <RichField
                                        value={{
                                            text: settings.body_text,
                                            html: settings.body_html,
                                        }}
                                        onChange={_noop}
                                        displayOnly
                                    />
                                </div>
                            </div>
                            <FakeOrderTracking />
                            <div>
                                <div className={css.previewLegend}>
                                    Signature
                                </div>
                                <div className={css.previewBodyWrapper}>
                                    <RichField
                                        value={{
                                            text: settings.signature_text,
                                            html: settings.signature_html,
                                        }}
                                        onChange={_noop}
                                        displayOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AutoReplyWismoEditor
