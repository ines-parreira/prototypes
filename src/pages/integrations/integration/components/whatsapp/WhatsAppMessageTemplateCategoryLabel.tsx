import React from 'react'
import {WhatsAppMessageTemplateCategory} from 'models/whatsAppMessageTemplates/types'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

type Props = {
    category: WhatsAppMessageTemplateCategory
}

export default function WhatsAppMessageTemplateCategoryLabel({
    category,
}: Props) {
    const {color, label} = templateCategoryToBadgeProps[category]

    return <Badge color={color}>{label}</Badge>
}

const templateCategoryToBadgeProps = {
    [WhatsAppMessageTemplateCategory.Utility]: {
        color: ColorType.Blue,
        label: 'Order Update',
    },
    [WhatsAppMessageTemplateCategory.Marketing]: {
        color: ColorType.Light,
        label: 'Marketing',
    },
    [WhatsAppMessageTemplateCategory.Authentication]: {
        color: ColorType.Grey,
        label: 'Authentication',
    },
}
