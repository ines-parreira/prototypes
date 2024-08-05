import {CardCustomization} from 'Widgets/modules/Template/modules/Card/types'

export type TemplateCustomization = {
    card?: {
        dataMatcher: RegExp
        templateMatcher?: RegExp
        customization: Partial<CardCustomization>
    }[]
    // fieldOverrides?: (props: CustomizationProps) => React.ReactNode
}
