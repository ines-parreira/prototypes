import React from 'react'

import {WhatsAppMessageTemplateCategory} from 'models/whatsAppMessageTemplates/types'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

type Props = {
    category: WhatsAppMessageTemplateCategory
}

export default function WhatsAppMessageTemplateCategoryLabel({
    category,
}: Props) {
    const {type, label} = templateCategoryToBadgeProps[category] ?? {}

    return <Badge type={type}>{label ?? category}</Badge>
}

const templateCategoryToBadgeProps = {
    [WhatsAppMessageTemplateCategory.Utility]: {
        type: ColorType.Blue,
        label: 'Utility',
    },
    [WhatsAppMessageTemplateCategory.Marketing]: {
        type: ColorType.Light,
        label: 'Marketing',
    },
    [WhatsAppMessageTemplateCategory.Authentication]: {
        type: ColorType.Grey,
        label: 'Authentication',
    },
}
