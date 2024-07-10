import {CardCustomization} from 'Infobar/features/Card/types'

export type TemplateCustomization = {
    card?: {
        matcher: RegExp
        customization: Partial<CardCustomization>
    }[]
    // fieldOverrides?: (props: CustomizationProps) => React.ReactNode
}
