import React from 'react'
import {Map, List} from 'immutable'
import {DropdownItem} from 'reactstrap'

import {getLanguageDisplayName, isImmutable} from 'utils'
import {RenderLabel} from 'pages/common/utils/labels'
import * as customersHelpers from 'state/customers/helpers'

import css from './FilterDropdownItems.less'

type Props = {
    field: Map<any, any>
    items: Maybe<List<any>>
    isLoading: boolean
    onItemClick: (newValue: Record<string, unknown>) => void
    onMeItemClick: () => void
}

export default function FilterDropdownItems({
    field,
    isLoading,
    onItemClick,
    onMeItemClick,
    items,
}: Props) {
    if (isLoading) {
        return (
            <DropdownItem disabled>
                <i className="material-icons md-spin mr-2">refresh</i>
                Loading...
            </DropdownItem>
        )
    }

    if (!items) {
        return null
    }

    if (items.isEmpty()) {
        return (
            <DropdownItem header>
                Could not find anything like this
            </DropdownItem>
        )
    }

    let options = items.map((value, key) => {
        let renderValue = value

        // special displays for some columns in the dropdown
        if (field.get('name') === 'tags') {
            // display tags as tags
            renderValue = (value as Map<any, any>).get('name')
        } else if (field.get('name') === 'customer') {
            renderValue = customersHelpers.getDisplayName(
                value as Map<any, any>
            )
        } else if (field.get('name') === 'language') {
            renderValue = getLanguageDisplayName(value as string)
        } else if (typeof value === 'object' || field.get('name') === 'role') {
            renderValue = <RenderLabel field={field} value={value} />
        }

        const passedValue = isImmutable(value)
            ? (value as Map<any, any>).toJS()
            : value

        return (
            <DropdownItem
                key={key}
                type="button"
                onClick={() => onItemClick(passedValue)}
                className={css.dropdownItem}
            >
                {renderValue}
            </DropdownItem>
        )
    }) as List<any>

    // special option added for some columns in the dropdown
    if (field.get('name') === 'assignee') {
        options = options.unshift(
            <DropdownItem
                key="me"
                type="button"
                onClick={() => onMeItemClick()}
            >
                Me (current user)
            </DropdownItem>,
            <DropdownItem key="unassigned-divider" divider />
        )
    }

    return <>{options}</>
}
