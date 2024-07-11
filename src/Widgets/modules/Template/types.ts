import {CardCustomization} from 'Widgets/modules/Template/modules/Card/types'

export type TemplateCustomization = {
    card?: {
        matcher: RegExp
        customization: Partial<CardCustomization>
    }[]
    // fieldOverrides?: (props: CustomizationProps) => React.ReactNode
}
