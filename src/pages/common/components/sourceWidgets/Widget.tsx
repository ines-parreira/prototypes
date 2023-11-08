import React from 'react'
import {fromJS} from 'immutable'

import {prepareWidgetToDisplay} from '../infobar/utils'
import Field from './widgets/Field'
import List from './widgets/List'
import Card from './widgets/Card'
import Wrapper from './widgets/Wrapper'
import {WidgetProps} from './widgetReference'

export default function Widget({
    parent,
    source,
    widget,
    template,
}: WidgetProps) {
    const {updatedTemplate, data, type, path} = prepareWidgetToDisplay(
        template,
        source,
        parent
    )

    const isParentList = parent && parent.get('type') === 'list'

    switch (type) {
        case 'wrapper': {
            return (
                <Wrapper
                    source={data || fromJS({})}
                    widget={widget}
                    template={updatedTemplate}
                    parent={parent}
                />
            )
        }
        case 'list': {
            return (
                <List
                    isParentList={isParentList}
                    source={data || fromJS({})}
                    widget={widget}
                    template={updatedTemplate}
                />
            )
        }
        case 'card': {
            return (
                <Card
                    isParentList={isParentList}
                    source={data || fromJS({})}
                    widget={widget}
                    template={updatedTemplate}
                />
            )
        }
        default:
            return <Field path={path} value={data} />
    }
}
