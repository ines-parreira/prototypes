import React, {Ref} from 'react'
import css from './ContactFormPreview.less'

const InputFieldPreview = ({
    label,
    placeholder,
    hasIcon,
    isBig,
}: {
    label: string
    placeholder?: string
    hasIcon?: boolean
    isBig?: boolean
}) => {
    return (
        <div className={css.fieldWrapper}>
            <div className={css.inputLabel}>
                <span>{label}</span>
                <span className={css.asterisk}>*</span>
            </div>
            {isBig ? (
                <div className={css.textArea}>
                    <span>{placeholder}</span>
                </div>
            ) : (
                <div className={css.inputField}>
                    <span>{placeholder}</span>
                    {hasIcon && (
                        <i className="material-icons">arrow_drop_down</i>
                    )}
                </div>
            )}
        </div>
    )
}

type ContactFormPreviewProps = {
    formRef?: Ref<HTMLDivElement>
}

const ContactFormPreview = ({formRef}: ContactFormPreviewProps) => {
    return (
        <div ref={formRef} className={css.container}>
            <div className={css.headerTitle}>Contact us</div>
            <div className={css.contentWrapper}>
                <InputFieldPreview label="Full name" />
                <InputFieldPreview label="Email" placeholder="your@email.com" />
                <InputFieldPreview
                    label="Subject"
                    placeholder="Select a subject"
                    hasIcon
                />
                <InputFieldPreview
                    label="Message"
                    placeholder="Write your message"
                    isBig
                />
                <div className={css.attachmentsWrapper}>
                    <div className={css.attachments}>
                        <i className="material-icons">attach_file</i>
                        <span>Attach Files</span>
                    </div>
                    <div className={css.caption}>
                        Attach up to 10 files. Max file size: 20 MB.
                    </div>
                </div>
            </div>
            <div className={css.footerSection}>
                <div className={css.sendButton}>Send</div>
                <div className={css.caption}>
                    This site is protected by reCAPTCHA Entreprise and the
                    Google
                    <span className={css.linkText}> Privacy Policy </span>
                    and
                    <span className={css.linkText}> Terms of Service </span>
                    apply.
                </div>
            </div>
        </div>
    )
}

export default ContactFormPreview
