import classnames from 'classnames'
import React, {useEffect} from 'react'

import {assetsUrl} from 'utils'
import Avatar from 'pages/common/components/Avatar/Avatar'
import FakeFAQArticlePreview from 'pages/settings/rules/components/FakeFAQArticlePreview'
import {getActiveHelpCenterList} from 'state/entities/helpCenter/helpCenters'
import useAppSelector from 'hooks/useAppSelector'

import type {ManagedRuleModalProps} from '../InstallRuleModalBody'
import {InstallationError} from '../../constants'

import defaultModalCss from '../RuleRecipeModal.less'

import TargetCount from './components/TargetCount'

import css from './ManagedRuleModal.less'

export const AutoReplyFAQModal = ({
    triggeredCount,
    viewCreationCheckbox,
    handleInstallationError,
    handleDefaultSettings,
}: ManagedRuleModalProps) => {
    const icon = assetsUrl('/img/icons/logo.png')
    const helpCenters = useAppSelector(getActiveHelpCenterList)

    useEffect(() => {
        if (!helpCenters.length) {
            handleInstallationError(InstallationError.NoHelpCenter)
        } else {
            handleDefaultSettings({help_center_id: helpCenters[0].id})
        }
    }, [helpCenters, handleDefaultSettings, handleInstallationError])

    return (
        <div className={classnames(css.managedRule, css.autoReplyFAQ)}>
            <div className={css.container}>
                <div className={css.description}>
                    <TargetCount count={triggeredCount} />
                    <div className={defaultModalCss.descriptionBlock}>
                        <h4>How it works</h4>
                        <p>
                            This rule detects shopper questions in incoming
                            emails, replies with relevant articles from your
                            help center, and closes the ticket. If shoppers
                            reply, the ticket will reopen so you never miss a
                            response.
                        </p>
                    </div>
                    <div className={defaultModalCss.descriptionBlock}>
                        <h4>Customize it</h4>
                        <p>Personalize the message body and signature.</p>
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
                                    Hey, I'm not sure what size to order, can
                                    you help me out?
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
                                    <p>Thank you for contacting us!</p>
                                    <p>
                                        We found some articles from our help
                                        center that might provide the
                                        information you’re looking for. Click a
                                        preview below to open and read more.
                                    </p>
                                    <FakeFAQArticlePreview />
                                    <p>
                                        This is an automated message. If it does
                                        not answer your question, just reply to
                                        this message and we will get back to you
                                        as soon as possible.
                                    </p>
                                    <p>Jane Smith</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
