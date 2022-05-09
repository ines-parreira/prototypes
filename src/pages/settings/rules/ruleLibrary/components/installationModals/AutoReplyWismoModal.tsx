import React from 'react'
import classnames from 'classnames'
import Avatar from 'pages/common/components/Avatar/Avatar'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/constants'
import {FakeOrderTracking} from 'pages/settings/rules/components/FakeOrderTracking'
import {ManagedRuleModalProps} from '../InstallRuleModalBody'
import defaultModalCss from '../RuleRecipeModal.less'

import css from './ManagedRuleModal.less'

export const AutoReplyWismoModal = ({
    rule,
    triggeredCount,
    isBehindPaywall,
    renderTags,
    viewCreationCheckbox,
}: ManagedRuleModalProps) => {
    const icon = `${
        window.GORGIAS_ASSETS_URL || ''
    }/static/private/js/assets/img/icons/logo.png`

    const integrations = useAppSelector(
        getIntegrationsByTypes(IntegrationType.Shopify)
    )

    return (
        <div
            className={classnames(css.managedRule, css.autoReplyWismo, {
                [css.bordered]: isBehindPaywall,
            })}
        >
            {isBehindPaywall && (
                <div className={css.titleWrapper}>
                    <span className={css.title}>{rule.name}</span>
                    {renderTags()}
                </div>
            )}
            {integrations.size === 0 && (
                <Alert icon={true} type={AlertType.Warning} className="mb-2">
                    This rule requires a Shopify integration to run.
                </Alert>
            )}
            <div className={css.container}>
                <div className={css.description}>
                    <div className={css.count}>
                        <div className={defaultModalCss.targetTitle}>
                            target up to
                        </div>
                        <div className={defaultModalCss.targetValue}>
                            <span className={defaultModalCss.bold}>
                                {triggeredCount}
                            </span>{' '}
                            tickets/month
                        </div>
                    </div>
                    <div className={css.descriptionBlock}>
                        <h4>
                            Answer "Where is my order" request automatically
                        </h4>
                        <p>
                            This rule leverages AI to automatically detect if
                            incoming emails from shoppers are related{' '}
                            <strong>
                                to tracking or “where is my order” requests
                            </strong>
                            . When such a message is detected, the rule sends an
                            automated message providing shoppers with the
                            tracking link for their three last orders and closes
                            the ticket.
                        </p>
                    </div>
                    <div className={css.descriptionBlock}>
                        <h4>Customize your message</h4>
                        <p>
                            You can personalize your message to make it your
                            own.
                        </p>
                    </div>
                    <div className={css.descriptionBlock}>
                        <p className={css.addendum}>
                            If your customer replies to the automated message,
                            the ticket will be reopened in your backend. This
                            rule requires an active Shopify integration to work
                            correctly.
                        </p>
                    </div>
                    <div className={css.descriptionBlock}>
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
                            <Avatar name="Client name" size={28} />
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
                                <Avatar url={icon} size={28} />
                            </div>
                            <div className="ml-3">
                                <div
                                    className={classnames(
                                        css.name,
                                        css.autoResponder
                                    )}
                                >
                                    <i className="material-icons mr-1">
                                        auto_awesome
                                    </i>
                                    Auto Responder
                                </div>
                                <div>
                                    <p>Hi Client Name,</p>
                                    <p>
                                        We detected that your request might be
                                        about tracking an order status. Is that
                                        tracking information useful?
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
                    <div className={css.descriptionBlock}>
                        <p className={css.legend}>see example above</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
