import React, {useMemo} from 'react'

import UIList from 'Infobar/features/List/display/List'
import {
    isCardTemplate,
    ListTemplate,
    Source,
    Template,
} from 'models/widget/types'

import WidgetListContext from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/WidgetListContext'

type Props = {
    source: Source[]
    parentTemplate?: Template
    template: ListTemplate
    isEditing?: boolean
    children: (child: Source, index: number) => React.ReactNode
}

function List({
    isEditing = false,
    source,
    parentTemplate,
    template,
    children,
}: Props) {
    const childTemplate = template.widgets?.[0]
    const isParentList =
        (parentTemplate && parentTemplate.type === 'list') || false
    const isParentOfCard = isCardTemplate(childTemplate)
    const hasOnlyContent =
        isCardTemplate(childTemplate) &&
        childTemplate.meta?.displayCard === false
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

    // If the header of the children template is hidden
    // we only display one child. Same if first child is a list
    const trimmedSource =
        hasOnlyContent || !isParentOfCard ? source.slice(0, 1) : source

    const mappedChildren = (childrenSources: Source[]) =>
        childrenSources.map((childSource, index) => (
            // Maybe we want to set some hardcoded order and not the index
            // here so that the index is relative to original data order
            // https://linear.app/gorgias/issue/CRM-2568/erroneous-value-in-listindex-variable-in-custom-action-buttons
            <WidgetListContext.Provider
                value={{currentListIndex: index}}
                key={index}
            >
                {children(childSource, index)}
            </WidgetListContext.Provider>
        ))

    return (
        <UIList
            isDraggable={!isParentList}
            dataKey={`${template.path || ''}[]`}
            isEditing={isEditing}
            listItems={trimmedSource}
            initialItemDisplayedNumber={limit ? Number(limit) : undefined}
            orderBy={orderBy}
        >
            {mappedChildren}
        </UIList>
    )
}

export default List
