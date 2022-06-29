import {fromJS, List, Map} from 'immutable'
import React, {ComponentType, useState, useCallback, useMemo} from 'react'
import {Dropdown, DropdownMenu, DropdownToggle} from 'reactstrap'

import {fieldPath, resolveLiteral} from 'utils'
import FilterDropdownSearch from 'pages/common/components/ViewTable/FilterDropdownSearch'

import FilterDropdownItems from './FilterDropdownItems'

type Props = {
    viewConfig: Map<any, any>
    field: Map<any, any>
    updateFieldFilter: (field: string) => void
    toggleDropdown: () => void
    menu?: ComponentType<any>
}

export default function FilterDropdown({
    field,
    viewConfig,
    menu: Menu = DropdownMenu,
    updateFieldFilter,
    toggleDropdown,
}: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const [items, setItems] = useState<Maybe<List<any>>>(
        field.getIn(['filter', 'enum'], fromJS([]))
    )

    const left = useMemo(() => {
        return `${viewConfig.get('singular') as string}.${fieldPath(field)}`
    }, [viewConfig, field])

    const handleItemClick = useCallback(
        (newValue: Record<string, unknown>) => {
            // if value cannot be resolved, we use the `id` attribute of the object given
            // Useful with `ticket.messages.integration_id` field
            // because `newValue` do not have an `integration_id` attribute
            const right = resolveLiteral(newValue, left) || newValue.id
            updateFieldFilter(right as string)
        },
        [left, updateFieldFilter]
    )

    const handleMeItemClick = useCallback(
        () => updateFieldFilter('{{current_user.id}}'),
        [updateFieldFilter]
    )

    const handleSearchStart = useCallback(() => {
        setIsLoading(true)
    }, [])

    const handleSearchError = useCallback(() => {
        setIsLoading(false)
        setItems(null)
    }, [])

    const handleSearchSuccess = useCallback((data: Maybe<List<any>>) => {
        setIsLoading(false)
        setItems(data)
    }, [])

    if (!(field.get('filter') || items)) {
        return null
    }

    const canSearch = !!field.getIn(['filter', 'type'])
    const width = field.getIn(['dropdown', 'width'], '230px')

    const style = {
        width: canSearch && width,
    }

    if (field.get('name') === 'language') {
        Object.assign(style, {height: '230px', overflow: 'scroll'})
    }

    return (
        <Dropdown isOpen toggle={toggleDropdown}>
            <DropdownToggle tag="span" />
            <Menu style={style}>
                <FilterDropdownSearch
                    field={field}
                    onSearchStart={handleSearchStart}
                    onSearchError={handleSearchError}
                    onSearchSuccess={handleSearchSuccess}
                />
                <FilterDropdownItems
                    items={items}
                    field={field}
                    isLoading={isLoading}
                    onItemClick={handleItemClick}
                    onMeItemClick={handleMeItemClick}
                />
            </Menu>
        </Dropdown>
    )
}
