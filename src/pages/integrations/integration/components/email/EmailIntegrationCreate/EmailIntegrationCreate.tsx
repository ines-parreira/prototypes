import React, {useCallback} from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import gmailLogo from 'assets/img/integrations/gmail.svg'
import officeLogo from 'assets/img/integrations/office.svg'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import {TemplateCard} from 'pages/common/components/TemplateCard'
import settingsCss from 'pages/settings/settings.less'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import {getRedirectUri} from 'state/integrations/selectors'

import css from './EmailIntegrationCreate.less'

export default function EmailIntegrationCreate() {
    const gmailRedirectUri = useAppSelector(
        getRedirectUri(IntegrationType.Gmail)
    )
    const outlookRedirectUri = useAppSelector(
        getRedirectUri(IntegrationType.Outlook)
    )

    const handleSubmit = useCallback(
        (e: React.SyntheticEvent, redirectUri: string) => {
            e.preventDefault()
            window.open(redirectUri)
        },
        []
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
                <SettingsContent>
                    <h2 className={settingsCss.headingSection}>
                        Integrate a new support email address
                    </h2>
                    <p>
                        Integrate a new support email address to receive
                        customer emails as tickets in Gorgias. Use one-click
                        authentication for Gmail and Microsoft 365 or follow the
                        step-by-step wizard for other providers.
                    </p>
                    <a
                        href={
                            'https://docs.gorgias.com/en-US/email-integrations-81753#find-out-who-your-provider-is'
                        }
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <i className="material-icons mr-2">menu_book</i>
                        Learn which method is right for you
                    </a>

                    <div className={css.connectCards}>
                        <TemplateCard
                            title="Connect Gmail account"
                            description="Log into your Gmail or Google Workspace  account to allow Gorgias access to emails."
                            icon={
                                <img
                                    className={css.logo}
                                    src={gmailLogo}
                                    alt="gmail logo"
                                />
                            }
                            onClick={(e) => handleSubmit(e, gmailRedirectUri)}
                        />
                        <TemplateCard
                            title="Connect Microsoft account"
                            description="Log into your Microsoft365 account to allow Gorgias access to emails."
                            icon={
                                <img
                                    className={css.logo}
                                    src={officeLogo}
                                    alt="microsoft logo"
                                />
                            }
                            onClick={(e) => handleSubmit(e, outlookRedirectUri)}
                        />
                    </div>

                    <div className={css.section}>
                        <div className={css.sectionLabel}>
                            Need to connect another provider?
                        </div>
                        <p className={css.sectionDescription}>
                            Set up email forwarding from providers like Gmail
                            Alias, Google Groups, MS Exchange, Outlook Alias,
                            GoDaddy, or Zoho Mail using the setup wizard. Admin
                            access is required for configuration.
                        </p>
                    </div>

                    <Link to="/app/settings/channels/email/new/onboarding">
                        <Button type="submit" intent="secondary">
                            Get started
                        </Button>
                    </Link>
                </SettingsContent>
            </SettingsPageContainer>
        </div>
    )
}
