import React, { useMemo } from 'react'

import type { List, Map } from 'immutable'

export const ContactFormAttachmentContainer = (props: {
    attachment: Map<any, any>
    css: Record<string, string>
    onClose: (event: any) => void
    onEdit: () => void
}) => {
    const { attachment, css, onClose, onEdit } = props
    const flatFields = useMemo(() => {
        const flatSteps: List<Map<any, any>> = attachment.getIn([
            'extra',
            'steps',
        ])
        return flatSteps
            .map((step) =>
                (
                    (step as Map<any, any>).get('fields') as List<Map<any, any>>
                ).map(
                    (fields) => (fields as Map<any, any>).get('name') as string,
                ),
            )
            .reduce<
                string[]
            >((prev, step) => (prev || []).concat(step?.toArray() || []), [])
    }, [attachment])
    return (
        <div className={css.contactForm}>
            <div className={css.contactFormIconContainer}>
                <i className="material-icons">wysiwyg</i>
            </div>

            <div className={css.contactFormDataContainer}>
                <span className={css.contactFormDataContainerTitle}>
                    Email Capture Form
                </span>
                <span className={css.contactFormDataContainerBody}>
                    {flatFields.toString()}
                </span>
            </div>
            <div className={css.contactFormDataActionButtons}>
                <i className="material-icons" onClick={onEdit}>
                    edit
                </i>
                <i className="material-icons" onClick={onClose}>
                    close
                </i>
            </div>
        </div>
    )
}
