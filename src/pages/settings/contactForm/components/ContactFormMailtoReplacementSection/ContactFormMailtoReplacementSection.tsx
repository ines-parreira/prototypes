import React from 'react'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import useLocalStorage from 'hooks/useLocalStorage'

export const ALERT_LOCAL_STORAGE_KEY = `gorgias-contact-form-alert-replace-mailto`
const ContactFormMailtoReplacementSection = () => {
    const [isAlertDiscarded, setAlertDiscarded] = useLocalStorage(
        ALERT_LOCAL_STORAGE_KEY,
        true
    )

    const onAlertCLose = () => {
        setAlertDiscarded(false)
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
                <Alert type={AlertType.Info} icon onClose={onAlertCLose}>
                    Pages with iFrames, tables, or dynamic content may require
                    manual replacement.
                </Alert>
            )}
        </>
    )
}

export default ContactFormMailtoReplacementSection
