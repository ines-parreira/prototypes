import React from 'react'

import {isListTemplate, Source, Template} from 'models/widget/types'
import {seekNextValues} from 'Widgets/modules/Template/helpers/iterator'

import Field from './widgets/Field'
import List from './widgets/List'
import Card from './widgets/Card'
import Wrapper from './widgets/Wrapper'

export type Props = {
    parentTemplate?: Template
    template: Template | null
    source: Source
    isRoot?: boolean
}

export default function Widget({parentTemplate, template, source}: Props) {
    const isParentList = isListTemplate(parentTemplate)
    if (template === null) return null
    switch (template.type) {
        case 'wrapper': {
            return (
                <Wrapper source={source} template={template}>
                    {(template.widgets || []).map((_, index) => (
                        <Widget
                            key={`${template.templatePath || ''}-${index}`}
                            {...seekNextValues(template, source, index)}
                        />
                    ))}
                </Wrapper>
            )
        }
        case 'list': {
            return (
                <List
                    isParentList={isParentList}
                    source={source}
                    template={template}
                >
                    {(childSource) => (
                        <Widget {...seekNextValues(template, childSource, 0)} />
                    )}
                </List>
            )
        }
        case 'card': {
            return (
                <Card
                    isParentList={isParentList}
                    source={source}
                    template={template}
                >
                    {(template.widgets || []).map((_, index) => (
                        <Widget
                            key={`${template.templatePath || ''}-${index}`}
                            {...seekNextValues(template, source, index)}
                        />
                    ))}
                </Card>
            )
        }
        default:
            return <Field path={template.path || ''} value={source} />
    }
}
