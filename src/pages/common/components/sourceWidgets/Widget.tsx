import React from 'react'
import {fromJS} from 'immutable'

import {isListTemplate} from 'models/widget/types'

import {updateAbsolutePathAndData} from '../infobar/utils'
import Field from './widgets/Field'
import List from './widgets/List'
import Card from './widgets/Card'
import Wrapper from './widgets/Wrapper'
import {WidgetProps} from './widgetReference'

export default function Widget({parent, source, template}: WidgetProps) {
    const {updatedTemplate, data} = updateAbsolutePathAndData(
        template,
        source,
        parent
    )
    const isParentList = isListTemplate(parent)

    switch (updatedTemplate.type) {
        case 'wrapper': {
            return (
                <Wrapper
                    source={data || fromJS({})}
                    template={updatedTemplate}
                />
            )
        }
        case 'list': {
            return (
                <List
                    isParentList={isParentList}
                    source={data || fromJS({})}
                    template={updatedTemplate}
                />
            )
        }
        case 'card': {
            return (
                <Card
                    isParentList={isParentList}
                    source={data || fromJS({})}
                    template={updatedTemplate}
                />
            )
        }
        default:
            return <Field path={updatedTemplate.path || ''} value={data} />
    }
}
