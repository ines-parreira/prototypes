import type { KeyboardEvent as KeyboardEventReact } from 'react'
import React, { useRef } from 'react'

import classnames from 'classnames'

import { useAppNode } from 'appNode'
import type { MacrosProperties } from 'models/macro/types'
import MacroFilters from 'pages/common/components/MacroFilters/MacroFilters'
import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'
import OnbordingMacroPopover from 'pages/tickets/common/macros/components/OnbordingMacroPopover'

import css from './TicketMacrosSearch.less'

type Props = {
    filters: MacrosProperties
    macrosVisible: boolean
    query: string
    setFocus: (input: HTMLInputElement) => void
    showMacros: () => void
    handleSearchKeyDown: (e: KeyboardEventReact) => void
    onChangeFilters: (filters: MacrosProperties) => void
    onChangeQuery: (query: string) => void
    onClearMacro: () => void
    requireCustomerSelection: boolean
}

const TicketMacrosSearch = ({
    filters,
    macrosVisible,
    setFocus,
    showMacros,
    handleSearchKeyDown,
    query,
    onChangeFilters,
    onChangeQuery,
    onClearMacro,
    requireCustomerSelection,
}: Props) => {
    const ref = useRef<HTMLElement | null>(null)

    const appNode = useAppNode()

    return (
        <div className={classnames(css.component, 'd-flex align-items-center')}>
            <TextInput
                tabIndex={3}
                onChange={onChangeQuery}
                onKeyDown={handleSearchKeyDown}
                onFocus={showMacros}
                placeholder="Search macros by name, tags or body..."
                isDisabled={requireCustomerSelection}
                className={classnames('border-0', 'shadow-none')}
                inputClassName={css.searchInput}
                ref={setFocus}
                prefix={
                    <IconInput
                        className={classnames(css.bolt, 'md-2 text-info')}
                        icon="bolt"
                        data-candu-id="ticket-macros-search"
                    />
                }
                value={query}
            />
            {macrosVisible && (
                <MacroFilters
                    selectedProperties={filters}
                    onChange={onChangeFilters}
                    size="sm"
                    tagDropdownMenuProps={{
                        className: css.tags,
                        container: appNode ?? undefined,
                    }}
                />
            )}

            <i
                ref={ref}
                className={classnames(
                    'material-icons md-2 mr-3 clickable',
                    css.closeButton,
                )}
                onClick={macrosVisible ? onClearMacro : showMacros}
            >
                {macrosVisible ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </i>

            <OnbordingMacroPopover
                macrosVisible={macrosVisible}
                target={ref}
                onClearMacro={onClearMacro}
            />
        </div>
    )
}

export default TicketMacrosSearch
