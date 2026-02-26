import React, { useState } from 'react'

import { useLocalStorage } from '@repo/hooks'
import classNames from 'classnames'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import type { ShopifyIntegration } from 'models/integration/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import IconButton from 'pages/common/components/button/IconButton'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import useShopifyThemeAppExtension from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShopifyThemeAppExtension'
import useThemeAppExtensionInstallation, {
    getGorgiasMainThemeAppExtensionId,
} from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useThemeAppExtensionInstallation'

import ContactFormMailtoReplacementSectionItem from './ContactFormMailtoReplacementSectionItem'
import { useContactFormMailtoReplacementConfig } from './useContactFormMailtoReplacementConfig'

import css from './ContactFormMailtoReplacementSection.less'

export const ALERT_LOCAL_STORAGE_KEY = `gorgias-contact-form-alert-replace-mailto`

const UNDO_TOOLTIP_ID = 'undo-btn-tooltip'

type ContactFormMailtoReplacementSectionProps = {
    contactFormId: number
    shopifyIntegration: ShopifyIntegration
}
const ContactFormMailtoReplacementSection = ({
    shopifyIntegration,
    contactFormId,
}: ContactFormMailtoReplacementSectionProps) => {
    const [isAlertDiscarded, setAlertDiscarded] = useLocalStorage(
        ALERT_LOCAL_STORAGE_KEY,
        true,
    )

    const {
        emailList,
        upsertMailtoReplacementConfig,
        mailtoReplacementConfig,
        emailsFromEmailIntegrations,
    } = useContactFormMailtoReplacementConfig({ contactFormId })
    const [selectedEmails, setSelectedEmails] = useState<string[]>(emailList)
    const onAlertClose = () => {
        setAlertDiscarded(false)
    }
    const {
        themeAppExtensionInstallationUrl,
        shouldUseThemeAppExtensionInstallation,
        themeAppExtensionEnabled,
    } = useThemeAppExtensionInstallation(shopifyIntegration)
    const { isInstalled: isThemeAppExtensionInstalled } =
        useShopifyThemeAppExtension({
            shopifyIntegration,
            appUuid: getGorgiasMainThemeAppExtensionId(),
        })

    const [wasInstallationInitiated, setWasInstallationInitiated] =
        useState(false)

    // We should use the theme app extension installation in 2 cases:
    // - 1. If it's a new Shopify integration, then `shouldUseThemeAppExtensionInstallation` will be true
    // - 2. If it's an old Shopify integration, but there are no emails to replace configured.
    //      It means that a script tag is not created, so we need to install the theme app extension
    const shouldUseThemeAppExtension =
        themeAppExtensionEnabled &&
        (shouldUseThemeAppExtensionInstallation ||
            mailtoReplacementConfig?.emails.length === 0)

    // Theme app extension is considered installed in 2 cases:
    // - 1. If it's already installed
    // - 2. If the installation was initiated (opened in a new tab). It's needed for optimistic UI
    const isThemeExtensionInstalled =
        isThemeAppExtensionInstalled || wasInstallationInitiated

    // We need to install the theme app extension if it's required and not installed yet
    const isThemeExtensionInstallationRequired =
        shouldUseThemeAppExtension && !isThemeExtensionInstalled

    const onAddEmails = () => {
        const mailtoReplacementConfigEmails =
            mailtoReplacementConfig?.emails || []
        const uniqNewEmails = Array.from(
            new Set([...selectedEmails, ...mailtoReplacementConfigEmails]),
            // Edge case: if user selects all emails and one of them was already deleted from email integration we filter them out
        ).filter((email) => emailsFromEmailIntegrations.includes(email))

        upsertMailtoReplacementConfig(uniqNewEmails)

        setSelectedEmails([])

        if (
            isThemeExtensionInstallationRequired &&
            themeAppExtensionInstallationUrl
        ) {
            window.open(
                themeAppExtensionInstallationUrl,
                '_blank',
                'noopener noreferrer',
            )
            setWasInstallationInitiated(true)
        }
    }

    const onRemoveEmail = (email: string) => {
        const newEmails = mailtoReplacementConfig?.emails.filter(
            (configEmail) => configEmail !== email,
        )

        // Preselect the email that was removed
        setSelectedEmails((prevSelectedEmails) => [
            ...prevSelectedEmails,
            email,
        ])

        if (newEmails) {
            upsertMailtoReplacementConfig(newEmails)
        }
    }

    return (
        <>
            <h2 className={css.title}>Replace email links</h2>
            <p className="mb-4">
                Redirect email links (ie. mailto:support@gorgias.com) on your
                website to your Contact Form link instead to easily collect
                customer information and protect your inbox from spammers.
            </p>

            {isThemeExtensionInstallationRequired && (
                <p className="mb-4">
                    {`To replace email links in your Shopify store, click "Replace
                    Links" then "Save" in the new Shopify window without editing
                    anything.`}
                </p>
            )}

            {isAlertDiscarded && (
                <Alert
                    type={AlertType.Info}
                    icon
                    onClose={onAlertClose}
                    className={css.alert}
                >
                    Pages with iFrames, tables, or dynamic content may require
                    manual replacement.
                </Alert>
            )}

            <div className={css.sectionContainer}>
                <div className={css.title}>
                    <h5 className="body-semibold mb-0">
                        Email links to detect{' '}
                    </h5>
                    <IconTooltip>
                        By default, we detect links on your website associated
                        with the emails integrated in Gorgias.
                    </IconTooltip>
                </div>

                {emailList.length === 0 ? (
                    <div className={classNames(css.item, css.emptyState)}>
                        No links detected
                    </div>
                ) : (
                    <ul className={css.list}>
                        {emailList.map((email) => (
                            <li
                                key={email}
                                className={css.item}
                                data-testid={`email-detected-${email}`}
                            >
                                <ContactFormMailtoReplacementSectionItem
                                    value={email}
                                    checkedItems={selectedEmails}
                                    onChange={setSelectedEmails}
                                />
                            </li>
                        ))}
                    </ul>
                )}

                {mailtoReplacementConfig &&
                    mailtoReplacementConfig.emails.length > 0 && (
                        <div className={css.replacedEmailsContainer}>
                            <h5 className="body-semibold">
                                Email links replaced
                            </h5>

                            <ul className={css.list}>
                                {mailtoReplacementConfig.emails.map(
                                    (email, key) => (
                                        <li
                                            key={email}
                                            className={css.item}
                                            data-testid={`email-replaced-${email}`}
                                        >
                                            <span>{email}</span>

                                            <IconButton
                                                onClick={() => {
                                                    onRemoveEmail(email)
                                                }}
                                                id={`${UNDO_TOOLTIP_ID}-${key}`}
                                                fillStyle="ghost"
                                                intent="secondary"
                                                data-testid={`revert-email-${email}`}
                                                title="Undo"
                                            >
                                                undo
                                            </IconButton>

                                            <Tooltip
                                                target={`${UNDO_TOOLTIP_ID}-${key}`}
                                                placement="top"
                                            >
                                                Undo
                                            </Tooltip>
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    )}

                {(isThemeExtensionInstallationRequired ||
                    emailList.length > 0) && (
                    <div>
                        <Button
                            isDisabled={
                                selectedEmails.length === 0 &&
                                !isThemeExtensionInstallationRequired
                            }
                            intent="secondary"
                            onClick={onAddEmails}
                        >
                            Replace links
                        </Button>
                    </div>
                )}
            </div>
        </>
    )
}

export default ContactFormMailtoReplacementSection
