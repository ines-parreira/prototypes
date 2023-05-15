import React from 'react'
import {WhatsAppTemplateCategory} from 'models/integration/types'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

type Props = {
    category: WhatsAppTemplateCategory
}

export default function WhatsAppTemplateCategoryLabel({category}: Props) {
    const {color, label} = templateCategoryToBadgeProps[category]

    return <Badge color={color}>{label}</Badge>
}

const templateCategoryToBadgeProps = {
    [WhatsAppTemplateCategory.Utility]: {
        color: ColorType.Blue,
        label: 'Order Update',
    },
    [WhatsAppTemplateCategory.Marketing]: {
        color: ColorType.Light,
        label: 'Marketing',
    },
    [WhatsAppTemplateCategory.Authentication]: {
        color: ColorType.Grey,
        label: 'Authentication',
    },
}
