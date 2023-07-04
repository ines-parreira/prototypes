import React from 'react'
import classNames from 'classnames'
import {WhatsAppMessageTemplate} from 'models/whatsAppMessageTemplates/types'
import WhatsAppMessageTemplateLine from './WhatsAppMessageTemplateLine'

import css from './WhatsAppMessageTemplateMessage.less'

type Props = {
    isPreview: boolean
    template: WhatsAppMessageTemplate
    value?: string[]
    onChange?: (value: string[]) => void
}

export default function WhatsAppMessageTemplateHeader({
    isPreview,
    template,
    value = [],
    onChange,
}: Props) {
    const header = template.components.header

    if (!header) return null

    const {type, value: headerText} = header

    if (!isPreview && type !== 'text') return null

    if (isPreview && type !== 'text') {
        const icon = mediaIcon[type]

        return (
            <div className={css.mediaPreview}>
                {icon && (
                    <i className={classNames('material-icons', css.icon)}>
                        {icon}
                    </i>
                )}
            </div>
        )
    }

    return (
        <WhatsAppMessageTemplateLine
            line={headerText}
            isPreview={isPreview}
            value={value}
            onChange={onChange}
        />
    )
}

const mediaIcon = {
    image: 'image',
    video: 'video_library',
    document: 'picture_as_pdf',
}
