import type { RefObject } from 'react'
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import actionsIcon from 'assets/img/icons/guidance-actions.svg'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Search from 'pages/common/components/Search'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import { useToolbarContext } from '../ToolbarContext'

import css from './GuidanceActionDropdown.less'

type Props = {
    target: RefObject<HTMLElement | null>
    onSelect: (value: GuidanceAction) => void
    isOpen: boolean
    dropdownPlacement?: React.ComponentProps<typeof Dropdown>['placement']
    onToggle: (isOpen: boolean) => void
    isDisabled?: boolean
}

const GuidanceActionDropdown = ({
    target,
    onSelect,
    isOpen,
    onToggle,
    isDisabled,
}: Props) => {
    const { guidanceActions = [] } = useToolbarContext()

    const [search, setSearch] = useState<{
        query: string
        filteredActions: GuidanceAction[]
    } | null>(null)

    const handleSearch = (query: string) => {
        if (query === '') {
            setSearch(null)
            return
        }

        setSearch({
            query,
            filteredActions: guidanceActions.filter((action) =>
                action.name.toLowerCase().includes(query.toLowerCase()),
            ),
        })
    }

    useEffect(() => {
        if (!isOpen) {
            setSearch(null)
        }
    }, [isOpen])

    const overlayRootNode = useMemo(
        () =>
            document.querySelector<HTMLElement>(
                '[class*="ui-sidepanel-sidepanel"]',
            ) ?? undefined,
        [],
    )

    return (
        <Dropdown
            root={overlayRootNode}
            isDisabled={isDisabled}
            isOpen={isOpen}
            target={target}
            className={css.dropdown}
            placement="bottom-end"
            onToggle={onToggle}
            safeDistance={0}
        >
            {search !== null && (
                <DropdownHeader className={css.dropdownHeader}>
                    <Button
                        onClick={() => {
                            setSearch(null)
                        }}
                        fillStyle="ghost"
                        intent="secondary"
                        className={css.backButton}
                    >
                        <ButtonIconLabel
                            icon="arrow_back"
                            position="left"
                            className={css.backButtonIconLabel}
                        >
                            <span className={css.searchHeader}>
                                Search results
                            </span>
                        </ButtonIconLabel>
                    </Button>
                </DropdownHeader>
            )}
            <DropdownBody>
                {guidanceActions.length > 0 && (
                    <Search
                        placeholder="Search"
                        className={css.search}
                        value={search?.query}
                        onChange={handleSearch}
                    />
                )}

                {guidanceActions.length === 0 && (
                    <div>
                        <span className={css.noActions}>
                            No actions available
                        </span>
                    </div>
                )}

                {search !== null && search.filteredActions.length === 0 && (
                    <div className={css.noActionsSearch}>
                        <span className={css.noActions}>No results</span>
                    </div>
                )}

                {(search !== null
                    ? search.filteredActions
                    : guidanceActions
                ).map((action, index) => (
                    <DropdownItem
                        key={`${action.value}-${index}`}
                        option={{
                            label: action.name,
                            value: action.value,
                        }}
                        onClick={() => {
                            onSelect(action)
                            onToggle(false)
                        }}
                        className={css.item}
                    >
                        <div className={css.itemContent}>
                            <img
                                src={actionsIcon}
                                alt="action"
                                className={css.itemIcon}
                                width={14}
                                height={14}
                            />
                            <span className={css.itemName}>{action.name}</span>
                        </div>
                    </DropdownItem>
                ))}
            </DropdownBody>
        </Dropdown>
    )
}

export default GuidanceActionDropdown
