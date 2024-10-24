import {ComponentProps} from 'react'

import {LeafTemplate, LeafType, Source} from 'models/widget/types'
import {CardCustomization} from 'Widgets/modules/Template/modules/Card/types'
import Field from 'Widgets/modules/Template/modules/Field'

export type FieldCustomization = {
    dataMatcher?: RegExp
    type?: LeafType
    getValue: (
        source: Source,
        template: LeafTemplate
    ) => ComponentProps<typeof Field>['value']
    getValueString: (
        source: Source,
        template: LeafTemplate
    ) => ComponentProps<typeof Field>['copyableValue']
} & Pick<
    ComponentProps<typeof Field>,
    'editionHiddenFields' | 'valueCanOverflow'
>

export type TemplateCustomization = {
    card?: {
        dataMatcher: RegExp
        templateMatcher?: RegExp
        customization: Partial<CardCustomization>
    }[]
    field?: FieldCustomization[]
}
