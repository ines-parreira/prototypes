import React from 'react'
import classnames from 'classnames'

import {assetsUrl} from 'utils'

import Avatar from 'pages/common/components/Avatar/Avatar'
import Button from 'pages/common/components/button/Button'

import {ManagedRuleModalProps} from '../InstallRuleModalBody'

import defaultModalCss from '../RuleRecipeModal.less'

import TargetCount from './components/TargetCount'

import css from './ManagedRuleModal.less'

export const AutoReplyReturnModal = ({
    triggeredCount,
    viewCreationCheckbox,
}: ManagedRuleModalProps) => {
    const icon = assetsUrl('/img/icons/logo.png')

    return (
        <div className={classnames(css.managedRule, css.autoReplyReturn)}>
            <div className={css.container}>
                <div className={css.description}>
                    <TargetCount count={triggeredCount} />
                    <div className={defaultModalCss.descriptionBlock}>
                        <h4>How it works</h4>
                        <p>
                            This rule detects emails related to return requests,
                            auto-replies with the link to your return portal,
                            and auto-closes the ticket. If shoppers reply, the
                            ticket will reopen so you never miss a response.
                        </p>
                    </div>
                    <div className={defaultModalCss.descriptionBlock}>
                        <h4>Customize it</h4>
                        <p>
                            Personalize the message body and signature, and
                            connect your returns integration.
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
                                    Hi, I want to return my order. Can you help
                                    me?
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
                                    <p className="mb-0">
                                        It looks like you'd like to return your
                                        order. Access our return portal below to
                                        start a return.
                                    </p>
                                    <Button className={css.button}>
                                        Start a return
                                    </Button>
                                    <p>
                                        This is an automated message. If you
                                        need more help, just reply to this
                                        message and we will get back to you as
                                        soon as possible.
                                    </p>
                                    <p>Agent Name</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className={css.legend}>
                        See auto-response example above
                    </p>
                </div>
            </div>
        </div>
    )
}
