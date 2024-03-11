import React, {useCallback, useMemo} from 'react'
import {Map, List as ImmutableList, fromJS} from 'immutable'

import List from 'infobar/ui/List'
import {isImmutable, isImmutableList} from 'common/utils'

// This is to avoid circular dependencies while doing recursion
import {widgetReference} from '../widgetReference'
import WidgetListContext from './WidgetListContext'

type Props = {
    source: unknown
    widget: Map<string, unknown>
    template: Map<unknown, unknown>
    isEditing?: boolean
    isParentList?: boolean
    hasNoBorderTop?: boolean
}

function ListInfobarWidget({
    isEditing = false,
    source,
    widget,
    template,
    isParentList,
    hasNoBorderTop = false,
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

    // If the header of the children template is hidden
    // we only display one child. Same if first child is a list
    const trimmedSource = useMemo(() => {
        if (isImmutableList(source) && (hasOnlyContent || !isParentOfCard)) {
            return source.setSize(1).toJS() as Record<string, unknown>[]
        }
        return isImmutable(source)
            ? (source.toJS() as Record<string, unknown>[])
            : []
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
                        isOpen={index === 0}
                        hasNoBorderTop={index === 0 && hasNoBorderTop}
                    />
                </WidgetListContext.Provider>
            )),
        [InfobarWidget, updatedTemplate, widget, passedTemplate, hasNoBorderTop]
    )

    if (
        !isImmutableList(source) ||
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
