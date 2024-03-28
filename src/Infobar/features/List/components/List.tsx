import React, {useMemo} from 'react'

import List from 'Infobar/features/List/display/List'
import {
    isCardTemplate,
    isSourceArray,
    ListTemplate,
    Source,
} from 'models/widget/types'

// This is to avoid circular dependencies while doing recursion
import {widgetReference} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgetReference'
import WidgetListContext from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/WidgetListContext'

type Props = {
    source: Source
    template: ListTemplate
    isEditing?: boolean
    isParentList?: boolean
    hasNoBorderTop?: boolean
}

function ListInfobarWidget({
    isEditing = false,
    source,
    template,
    isParentList,
    hasNoBorderTop = false,
}: Props) {
    const InfobarWidget = widgetReference.Widget

    let passedTemplate = template.widgets?.[0]

    const isParentOfCard = isCardTemplate(passedTemplate)
    const hasOnlyContent =
        isCardTemplate(passedTemplate) &&
        passedTemplate.meta?.displayCard === false
    const limit = template.meta?.limit
    const orderByString = template.meta?.orderBy

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

    if (!isSourceArray(source) || !source.length || !passedTemplate) return null

    // If the header of the children template is hidden
    // we only display one child. Same if first child is a list
    const trimmedSource =
        hasOnlyContent || !isParentOfCard ? source.slice(0, 1) : source

    const updatedTemplate = {
        ...template,
        absolutePath: (template.absolutePath || []).concat(['[]']),
    }

    passedTemplate = {
        ...passedTemplate,
        templatePath: `${template.templatePath || ''}.widgets.0`,
    }

    const children = (childrenSources: Source[]) =>
        childrenSources.map((childSource, index) => (
            <WidgetListContext.Provider
                value={{currentListIndex: index}}
                key={index}
            >
                <InfobarWidget
                    source={childSource}
                    parent={updatedTemplate}
                    template={passedTemplate}
                    isOpen={index === 0}
                    hasNoBorderTop={index === 0 && hasNoBorderTop}
                />
            </WidgetListContext.Provider>
        ))

    return (
        <List
            isDraggable={!isParentList}
            dataKey={`${template.path || ''}[]`}
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
