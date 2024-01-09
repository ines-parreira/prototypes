import React, {useState} from 'react'
import classNames from 'classnames'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import useLocalStorage from 'hooks/useLocalStorage'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import Tooltip from 'pages/common/components/Tooltip'

import css from './ContactFormMailtoReplacementSection.less'
import ContactFormMailtoReplacementSectionItem from './ContactFormMailtoReplacementSectionItem'
import {useContactFormMailtoReplacementConfig} from './useContactFormMailtoReplacementConfig'

export const ALERT_LOCAL_STORAGE_KEY = `gorgias-contact-form-alert-replace-mailto`

const UNDO_TOOLTIP_ID = 'undo-btn-tooltip'

type ContactFormMailtoReplacementSectionProps = {
    contactFormId: number
}
const ContactFormMailtoReplacementSection = ({
    contactFormId,
}: ContactFormMailtoReplacementSectionProps) => {
    const [isAlertDiscarded, setAlertDiscarded] = useLocalStorage(
        ALERT_LOCAL_STORAGE_KEY,
        true
    )

    const {emailList, upsertMailtoReplacementConfig, mailtoReplacementConfig} =
        useContactFormMailtoReplacementConfig({contactFormId})
    const [selectedEmails, setSelectedEmails] = useState<string[]>(emailList)

    const onAlertClose = () => {
        setAlertDiscarded(false)
    }

    const onAddEmails = () => {
        const previousEmails = mailtoReplacementConfig?.emails || []
        const uniqNewEmails = Array.from(
            new Set([...selectedEmails, ...previousEmails])
        )

        upsertMailtoReplacementConfig(uniqNewEmails)

        setSelectedEmails([])
    }

    const onRemoveEmail = (email: string) => {
        const newEmails = mailtoReplacementConfig?.emails.filter(
            (configEmail) => configEmail !== email
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
            <h2>Replace email links</h2>
            <p className="mb-4">
                Redirect email links (ie. mailto:support@gorgias.com) on your
                website to your Contact Form link instead to easily collect
                customer information and protect your inbox from spammers.
            </p>

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
                        <>
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
                                    )
                                )}
                            </ul>
                        </>
                    )}

                {emailList.length > 0 && (
                    <div>
                        <Button
                            isDisabled={selectedEmails.length === 0}
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
