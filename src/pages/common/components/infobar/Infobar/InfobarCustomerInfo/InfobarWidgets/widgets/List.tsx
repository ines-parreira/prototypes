import React, {useCallback, useMemo} from 'react'
import {Map, List as ImmutableList, fromJS} from 'immutable'

import List from 'infobar/ui/List'
// This is to avoid circular dependencies while doing recursion
import {widgetReference} from '../widgetReference'
import WidgetListContext from './WidgetListContext'

type Props = {
    source: ImmutableList<Map<string, unknown>>
    widget: Map<string, unknown>
    template: Map<unknown, unknown>
    isEditing?: boolean
    isParentList?: boolean
    removeBorderTop?: boolean
}

function ListInfobarWidget({
    isEditing = false,
    source,
    widget,
    template,
    isParentList,
    removeBorderTop = false,
}: Props) {
    const InfobarWidget = widgetReference.Widget

    const updatedTemplate = template.set(
        'absolutePath',
        (template.get('absolutePath', '') as ImmutableList<string>).concat([
            '[]',
        ])
    )

    const passedTemplate = (
        updatedTemplate.getIn(['widgets', '0'], fromJS([])) as Map<
            unknown,
            unknown
        >
    ).set(
        'templatePath',
        `${updatedTemplate.get('templatePath', '') as string}.widgets.0`
    )

    const isParentOfCard =
        updatedTemplate.getIn(['widgets', 0, 'type'], '') === 'card'

    const hasOnlyContent =
        isParentOfCard &&
        passedTemplate.getIn(['meta', 'displayCard'], true) === false

    const limit = template.getIn(['meta', 'limit']) as
        | number
        | string
        | undefined

    const orderByString = template.getIn(['meta', 'orderBy']) as
        | string
        | undefined

    const orderBy = useMemo(
        () =>
            orderByString
                ? ({
                      key: orderByString.slice(1),
                      direction: orderByString[0] === '-' ? 'DESC' : 'ASC',
                  } as const)
                : undefined,
        [orderByString]
    )

    // if the header of the children template is hidden
    // we only display one children. Same if first children is a list
    const trimmedSource = useMemo(() => {
        if (hasOnlyContent || !isParentOfCard) {
            return source.setSize(1).toJS() as Record<string, unknown>[]
        }
        return source.toJS() as Record<string, unknown>[]
    }, [source, hasOnlyContent, isParentOfCard])

    const children = useCallback(
        (childrenSources: Record<string, unknown>[]) =>
            childrenSources.map((childSource, index) => (
                <WidgetListContext.Provider
                    value={{currentListIndex: index}}
                    key={index}
                >
                    <InfobarWidget
                        source={fromJS(childSource)}
                        parent={updatedTemplate}
                        widget={widget}
                        template={passedTemplate}
                        open={index === 0}
                        removeBorderTop={index === 0 && removeBorderTop}
                    />
                </WidgetListContext.Provider>
            )),
        [
            InfobarWidget,
            updatedTemplate,
            widget,
            passedTemplate,
            removeBorderTop,
        ]
    )

    if (
        !ImmutableList.isList(source) ||
        !source.size ||
        !template.getIn(['widgets', '0'])
    )
        return null

    return (
        <List
            isDraggable={!isParentList}
            dataKey={`${template.get('path') as string}[]`}
            isEditing={isEditing}
            listItems={trimmedSource}
            initialItemDisplayedNumber={limit ? Number(limit) : undefined}
            orderBy={orderBy}
        >
            {children}
        </List>
    )
}

export default ListInfobarWidget
