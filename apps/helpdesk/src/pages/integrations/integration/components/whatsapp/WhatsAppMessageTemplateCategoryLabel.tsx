import type { ColorType } from '@gorgias/axiom'
import { Badge } from '@gorgias/axiom'

import { WhatsAppMessageTemplateCategory } from 'models/whatsAppMessageTemplates/types'

type Props = {
    category: WhatsAppMessageTemplateCategory
}

export default function WhatsAppMessageTemplateCategoryLabel({
    category,
}: Props) {
    const { type, label } = templateCategoryToBadgeProps[category] ?? {}

    return <Badge type={type}>{label ?? category}</Badge>
}

type TemplateCategoryToBadgeProps = {
    [key in WhatsAppMessageTemplateCategory]: {
        type: ColorType
        label: string
    }
}

const templateCategoryToBadgeProps: TemplateCategoryToBadgeProps = {
    [WhatsAppMessageTemplateCategory.Utility]: {
        type: 'blue',
        label: 'Utility',
    },
    [WhatsAppMessageTemplateCategory.Marketing]: {
        type: 'light',
        label: 'Marketing',
    },
    [WhatsAppMessageTemplateCategory.Authentication]: {
        type: 'grey',
        label: 'Authentication',
    },
}
