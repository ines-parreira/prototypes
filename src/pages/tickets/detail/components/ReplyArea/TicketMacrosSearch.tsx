import classnames from 'classnames'
import React, {KeyboardEvent as KeyboardEventReact} from 'react'

import {fetchMacrosParamsTypes} from 'state/macro/actions'
import TextInput from 'pages/common/forms/input/TextInput'
import MacroFilters from 'pages/common/components/MacroFilters/MacroFilters'
import css from './TicketMacrosSearch.less'

type Props = {
    searchParams: fetchMacrosParamsTypes
    macrosVisible: boolean
    setFocus: (input: HTMLInputElement) => void
    showMacros: () => void
    searchMacros: (search: fetchMacrosParamsTypes) => void
    handleSearchKeyDown: (e: KeyboardEventReact) => void
    onClearMacro: () => void
    requireCustomerSelection: boolean
}

const TicketMacrosSearch = ({
    searchParams,
    macrosVisible,
    setFocus,
    showMacros,
    searchMacros,
    handleSearchKeyDown,
    onClearMacro,
    requireCustomerSelection,
}: Props) => {
    return (
        <div className={classnames(css.component, 'd-flex align-items-center')}>
            <i
                className={classnames(
                    css.bolt,
                    'material-icons md-2 ml-2 text-info'
                )}
            >
                bolt
            </i>
            <TextInput
                tabIndex={3}
                onChange={(search) =>
                    searchMacros({
                        search,
                    })
                }
                onKeyDown={handleSearchKeyDown}
                onFocus={showMacros}
                placeholder="Search macros by name, tags or body..."
                isDisabled={requireCustomerSelection}
                className={classnames(
                    'border-0',
                    'shadow-none',
                    css.searchInput
                )}
                ref={setFocus}
            />
            {macrosVisible && (
                <MacroFilters
                    selectedProperties={{
                        languages: searchParams.languages,
                        tags: searchParams.tags,
                    }}
                    onChange={searchMacros}
                />
            )}
            <i
                className={classnames(
                    'material-icons md-2 mr-3 clickable',
                    css.closeButton
                )}
                onClick={macrosVisible ? onClearMacro : showMacros}
            >
                {macrosVisible ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </i>
        </div>
    )
}

export default TicketMacrosSearch
