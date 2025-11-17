import React, { useContext } from 'react'

import { LEAF_TYPES } from 'models/widget/constants'
import type { Source, Template as TemplateType } from 'models/widget/types'
import {
    isCardTemplate,
    isLeafType,
    isListTemplate,
    isSourceArray,
    isSourceRecord,
    isWrapperTemplate,
} from 'models/widget/types'
import { EditionContext } from 'providers/infobar/EditionContext'
import { STANDALONE_WIDGET_TYPE } from 'state/widgets/constants'
import { WidgetContext } from 'Widgets/contexts/WidgetContext'
import {
    getStringFromData,
    getValueFromData,
} from 'Widgets/modules/Template/helpers/fieldDataMappers'
import Card from 'Widgets/modules/Template/modules/Card'
import Field from 'Widgets/modules/Template/modules/Field'
import List from 'Widgets/modules/Template/modules/List'
import Wrapper from 'Widgets/modules/Template/modules/Wrapper'

import { CustomizationContext } from '../contexts/CustomizationContext'
import {
    seekCardCustomization,
    seekFieldCustomization,
} from '../helpers/customization'
import { seekNextValues } from '../helpers/iterator'

type Props = {
    template: TemplateType | null
    source?: Source
    parentTemplate?: TemplateType
    isFirstOfList?: boolean
}

// Only way to test recursion with jest is to spyOn an object
// which holds the function to be called
export const self = {
    Template: Template,
}

export function Template({
    parentTemplate,
    template,
    source,
    isFirstOfList,
}: Props) {
    const { isEditing } = useContext(EditionContext)
    const widget = useContext(WidgetContext)
    const customization = useContext(CustomizationContext)

    if (!template) return null

    if (isWrapperTemplate(template)) {
        return (
            <Wrapper source={source} template={template}>
                {(template.widgets || []).map((_, index) => (
                    <self.Template
                        key={`${template.templatePath || ''}-${index}`}
                        {...seekNextValues(template, source, index)}
                    />
                ))}
            </Wrapper>
        )
    }

    if (isListTemplate(template)) {
        if (!isSourceArray(source) || !source.length || !template.widgets?.[0])
            return null

        return (
            <List isEditing={isEditing} source={source} template={template}>
                {(childSource: Source, index: number) => (
                    <self.Template
                        // yes, index must be 0 here, list only uses the
                        // first child template, but with different data
                        {...seekNextValues(template, childSource, 0)}
                        isFirstOfList={index === 0}
                    />
                )}
            </List>
        )
    }

    if (isCardTemplate(template)) {
        if (widget.type !== STANDALONE_WIDGET_TYPE) {
            if (!isSourceRecord(source)) {
                return null
            }
            // do not display card if there is no data to display in it
            if (!isEditing && Object.keys(source).length === 0) {
                return null
            }
        }

        const cardCustomization = seekCardCustomization(
            customization?.card,
            template,
        )

        return (
            <Card
                isEditing={isEditing}
                source={source}
                template={template}
                parentTemplate={parentTemplate}
                extensions={cardCustomization}
                editionHiddenFields={cardCustomization.editionHiddenFields}
                isFirstOfList={isFirstOfList}
            >
                {template.widgets?.map((childTemplate, index) => (
                    <self.Template
                        key={`${template.templatePath || ''}-${index}`}
                        {...seekNextValues(template, source, index)}
                    />
                ))}
            </Card>
        )
    }

    const fieldCustomization = seekFieldCustomization(
        customization?.field,
        source,
        template,
    )
    return (
        <Field
            isEditing={isEditing}
            type={isLeafType(template.type) ? template.type : LEAF_TYPES.TEXT}
            value={getValueFromData(source, template.type)}
            template={template}
            copyableValue={getStringFromData(source, template.type)}
            {...fieldCustomization}
        />
    )
}

export default Template
