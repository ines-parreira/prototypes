import React, { useCallback } from 'react'

import cn from 'classnames'
import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import gmailLogo from 'assets/img/integrations/gmail.svg'
import officeLogo from 'assets/img/integrations/office.svg'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import PageHeader from 'pages/common/components/PageHeader'
import { TemplateCard } from 'pages/common/components/TemplateCard'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import { getRedirectUri } from 'state/integrations/selectors'

import css from './EmailIntegrationCreate.less'

const EMAIL_FORWARDING_LINK = '/app/settings/channels/email/new/onboarding'
const HELP_DOC_LINK =
    'https://docs.gorgias.com/en-US/email-integrations-81753#find-out-who-your-provider-is'

export default function EmailIntegrationCreate() {
    const gmailRedirectUri = useAppSelector(
        getRedirectUri(IntegrationType.Gmail),
    )
    const outlookRedirectUri = useAppSelector(
        getRedirectUri(IntegrationType.Outlook),
    )

    const handleSubmit = useCallback(
        (e: React.SyntheticEvent, redirectUri: string) => {
            e.preventDefault()
            window.open(redirectUri)
        },
        [],
    )

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/channels/email">Email</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Add email address
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <SettingsPageContainer>
                <div className={css.cards}>
                    <p>
                        You will need admin access to your email provider and
                        domain settings to complete the email and domain setup.
                    </p>

                    <a
                        href={HELP_DOC_LINK}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <i className="material-icons mr-2">menu_book</i>
                        Email integrations
                    </a>

                    <div className={css.connectCards}>
                        <Link to={EMAIL_FORWARDING_LINK}>
                            <TemplateCard
                                title="Email forwarding"
                                description="Connect any email account to Gorgias inbox. Suitable for all volumes and preferred for high-volume use (500+ emails/day)."
                                icon={
                                    <i
                                        className={cn(
                                            'material-icons-outlined',
                                            css.emailIcon,
                                        )}
                                    >
                                        email
                                    </i>
                                }
                            />
                        </Link>
                        <TemplateCard
                            title="Gmail"
                            description="Connect Gmail or Google Workspace account to Gorgias inbox. Recommended only for low-volume use (under 500 emails/day)."
                            icon={
                                <img
                                    className={css.logo}
                                    src={gmailLogo}
                                    alt="gmail logo"
                                    height={32}
                                />
                            }
                            onClick={(e) => handleSubmit(e, gmailRedirectUri)}
                        />
                        <TemplateCard
                            title="Microsoft 365"
                            description="Connect Microsoft 365 account to Gorgias inbox. Recommended only for low-volume use (under 500 emails/day)."
                            icon={
                                <img
                                    className={css.logo}
                                    src={officeLogo}
                                    alt="microsoft logo"
                                    height={32}
                                />
                            }
                            onClick={(e) => handleSubmit(e, outlookRedirectUri)}
                        />
                    </div>
                </div>
            </SettingsPageContainer>
        </div>
    )
}
