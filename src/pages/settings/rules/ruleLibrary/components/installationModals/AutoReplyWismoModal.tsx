import React from 'react'
import classnames from 'classnames'

import {assetsUrl} from 'utils'

import Avatar from 'pages/common/components/Avatar/Avatar'
import {FakeOrderTracking} from 'pages/settings/rules/components/FakeOrderTracking'
import {ManagedRuleModalProps} from '../InstallRuleModalBody'

import defaultModalCss from '../RuleRecipeModal.less'

import TargetCount from './components/TargetCount'

import css from './ManagedRuleModal.less'

export const AutoReplyWismoModal = ({
    triggeredCount,
    viewCreationCheckbox,
}: ManagedRuleModalProps) => {
    const icon = assetsUrl('/img/icons/logo.png')

    return (
        <div className={classnames(css.managedRule, css.autoReplyWismo)}>
            <div className={css.container}>
                <div className={css.description}>
                    <TargetCount count={triggeredCount} />
                    <div className={defaultModalCss.descriptionBlock}>
                        <h4>How it works</h4>
                        <p>
                            This rule detects emails related to order status or
                            tracking, replies with tracking links for the
                            shopper’s last 3 orders, and auto-closes the ticket.
                            If shoppers reply, the ticket will reopen so you
                            never miss a response.
                        </p>
                    </div>
                    <div className={defaultModalCss.descriptionBlock}>
                        <p className={css.addendum}>
                            This rule requires an active Shopify integration.
                        </p>
                    </div>
                    <div className={defaultModalCss.descriptionBlock}>
                        <h4>Customize it</h4>
                        <p>
                            Personalize the message and exclude email addresses
                            from this rule.
                        </p>
                    </div>
                    <div className={defaultModalCss.descriptionBlock}>
                        {viewCreationCheckbox()}
                    </div>
                </div>
                <div className={css.example}>
                    <div
                        className={classnames(
                            css.exampleContainer,
                            css.bordered
                        )}
                    >
                        <div className={css.fakeMessage}>
                            <Avatar
                                name="Client name"
                                size={28}
                                className={css.clientAvatar}
                            />
                            <div className="ml-3">
                                <div className={css.name}>Client Name</div>
                                <div>
                                    Hey, do you have a tracking number so I can
                                    double check?
                                </div>
                            </div>
                        </div>
                        <div className={css.fakeMessage}>
                            <div>
                                <Avatar
                                    url={icon}
                                    size={28}
                                    className={css.autoResponderAvatar}
                                />
                            </div>
                            <div className="ml-3">
                                <div
                                    className={classnames(
                                        css.name,
                                        css.autoResponder
                                    )}
                                >
                                    Autoresponder
                                </div>
                                <div>
                                    <p>Hi Client Name,</p>
                                    <p>
                                        It looks like you’re reaching out about
                                        your order status. Is this tracking
                                        information helpful?
                                    </p>
                                    <FakeOrderTracking />
                                    <p>
                                        If you need more help you can reply to
                                        this email and we will get back to you
                                        as soon as possible.
                                    </p>
                                    <p>Agent Name</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={defaultModalCss.descriptionBlock}>
                        <p className={css.legend}>
                            See auto-response example above
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
