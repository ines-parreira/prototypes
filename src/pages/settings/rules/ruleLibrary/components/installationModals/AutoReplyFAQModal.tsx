import classnames from 'classnames'
import React, {useEffect} from 'react'
import Avatar from 'pages/common/components/Avatar/Avatar'
import FakeFAQArticlePreview from 'pages/settings/rules/components/FakeFAQArticlePreview'
import {getActiveHelpCenterList} from 'state/entities/helpCenter/helpCenters'
import useAppSelector from 'hooks/useAppSelector'
import defaultModalCss from '../RuleRecipeModal.less'
import type {ManagedRuleModalProps} from '../InstallRuleModalBody'
import {InstallationError} from '../../constants'
import css from './ManagedRuleModal.less'

export const AutoReplyFAQModal = ({
    rule,
    triggeredCount,
    isBehindPaywall,
    renderTags,
    viewCreationCheckbox,
    handleInstallationError,
    handleDefaultSettings,
}: ManagedRuleModalProps) => {
    const icon = `${
        window.GORGIAS_ASSETS_URL || ''
    }/static/private/js/assets/img/icons/logo.png`
    const helpCenters = useAppSelector(getActiveHelpCenterList)

    useEffect(() => {
        if (!helpCenters.length) {
            handleInstallationError(InstallationError.NoHelpCenter)
        } else {
            handleDefaultSettings({help_center_id: helpCenters[0].id})
            handleInstallationError(null)
        }
    }, [helpCenters, handleDefaultSettings, handleInstallationError])

    return (
        <div
            className={classnames(css.managedRule, css.autoReplyFAQ, {
                [css.bordered]: isBehindPaywall,
            })}
        >
            {isBehindPaywall && (
                <div className={css.titleWrapper}>
                    <span className={css.title}>{rule.name}</span>
                    {renderTags()}
                </div>
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
                        <h4>Help shoppers find answers faster</h4>
                        <p>
                            This rule automatically identifies incoming
                            questions via email and replies with relevant
                            article suggestions from your help center.
                        </p>
                    </div>
                    <div className={css.descriptionBlock}>
                        <h4>Customize the message</h4>
                        <p>
                            Personalize your message to align with your brand.
                        </p>
                    </div>
                    <div className={css.descriptionBlock}>
                        <p className={css.addendum}>
                            If your customer replies to this message, it will
                            reappear as a regular ticket.
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
                                    Hey, I'm not sure what size to order, can
                                    you help me out?
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
                                    <p>Thank you for contacting us!</p>
                                    <p>
                                        We found an article from our help center
                                        that might provide the information
                                        you’re looking for. Click the preview
                                        below to open and read more.
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
