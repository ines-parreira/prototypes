import React, {useEffect, useRef} from 'react'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'
import ContactFormPreview from 'pages/settings/contactForm/components/ContactFormPreview'
import trackIcon from '../../../../../assets/img/self-service/track.svg'
import returnIcon from '../../../../../assets/img/self-service/return.svg'
import cancelIcon from '../../../../../assets/img/self-service/cancel.svg'
import reportIssueIcon from '../../../../../assets/img/self-service/report-issue.svg'
import {HELP_CENTER_TEXTS} from '../../../../../config/helpCenter'
import useWorkflowsEntrypoints from './hooks/useWorkflowsEntrypoints'
import css from './SelfServiceStandaloneContactFormHomePage.less'
import {useSelfServicePreviewContext} from './SelfServicePreviewContext'
import OrderManagementFlowItemPreview from './OrderManagementFlowItemPreview'

const WorkflowItem = ({label}: {label: string}) => (
    <div className={css.workflowItem}>
        <div className={css.flowLabel}>{label}</div>
        <i className={classnames('material-icons', css.flowChevron)}>
            keyboard_arrow_right
        </i>
    </div>
)

type SelfServiceStandaloneContactFormHomepageProps = {
    locale: string
    formIsHidden: boolean
    scrollToView?: boolean
}

const SelfServiceStandaloneContactFormHomePage = ({
    locale,
    formIsHidden,
    scrollToView,
}: SelfServiceStandaloneContactFormHomepageProps) => {
    const history = useHistory()
    const workflowsEntrypoints = useWorkflowsEntrypoints(locale)
    const {selfServiceConfiguration, hoveredOrderManagementFlow} =
        useSelfServicePreviewContext()
    const isOrderManagementEnabled =
        selfServiceConfiguration?.cancelOrderPolicy.enabled ||
        selfServiceConfiguration?.reportIssuePolicy.enabled ||
        selfServiceConfiguration?.returnOrderPolicy.enabled ||
        selfServiceConfiguration?.trackOrderPolicy.enabled
    const hasAutomateEnabled =
        isOrderManagementEnabled ||
        (workflowsEntrypoints && workflowsEntrypoints.length > 0)

    const helpCenterTexts = HELP_CENTER_TEXTS[locale]
    const isInitialEntry = history?.length === 1

    const formRef = useRef<HTMLDivElement>(null)
    const contactUsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollToView) {
            if (formIsHidden === true) {
                if (contactUsRef.current) {
                    contactUsRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    })
                }
            } else {
                if (formRef.current) {
                    formRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    })
                }
            }
        }
    }, [formIsHidden, scrollToView])

    return (
        <div
            className={classnames(css.contactFormContainer, {
                [css.isInitialEntry]: isInitialEntry,
            })}
        >
            {hasAutomateEnabled && (
                <div className={css.contactFormItemsContainer}>
                    {workflowsEntrypoints.map((entrypoint) => (
                        <div
                            key={entrypoint.workflow_id}
                            className={css.listGroupItem}
                        >
                            <WorkflowItem label={entrypoint.label} />
                        </div>
                    ))}
                    {selfServiceConfiguration?.trackOrderPolicy.enabled && (
                        <OrderManagementFlowItemPreview
                            icon={trackIcon}
                            isHighlighted={
                                hoveredOrderManagementFlow ===
                                'trackOrderPolicy'
                            }
                        >
                            {helpCenterTexts.manageOrdersLabelTrackOrder}
                        </OrderManagementFlowItemPreview>
                    )}
                    {selfServiceConfiguration?.returnOrderPolicy.enabled && (
                        <OrderManagementFlowItemPreview
                            icon={returnIcon}
                            isHighlighted={
                                hoveredOrderManagementFlow ===
                                'returnOrderPolicy'
                            }
                        >
                            {helpCenterTexts.manageOrdersLabelReturnOrder}
                        </OrderManagementFlowItemPreview>
                    )}
                    {selfServiceConfiguration?.cancelOrderPolicy.enabled && (
                        <OrderManagementFlowItemPreview
                            icon={cancelIcon}
                            isHighlighted={
                                hoveredOrderManagementFlow ===
                                'cancelOrderPolicy'
                            }
                        >
                            {helpCenterTexts.manageOrdersLabelCancelOrder}
                        </OrderManagementFlowItemPreview>
                    )}
                    {selfServiceConfiguration?.reportIssuePolicy.enabled && (
                        <OrderManagementFlowItemPreview
                            icon={reportIssueIcon}
                            isHighlighted={
                                hoveredOrderManagementFlow ===
                                'reportIssuePolicy'
                            }
                        >
                            {helpCenterTexts.manageOrdersLabelReportIssue}
                        </OrderManagementFlowItemPreview>
                    )}
                    {formIsHidden && (
                        <div ref={contactUsRef} className={css.listGroupItem}>
                            <WorkflowItem label="Contact Us" />
                        </div>
                    )}
                </div>
            )}
            {(!formIsHidden || (formIsHidden && !hasAutomateEnabled)) && (
                <ContactFormPreview formRef={formRef} />
            )}
        </div>
    )
}

export default SelfServiceStandaloneContactFormHomePage
