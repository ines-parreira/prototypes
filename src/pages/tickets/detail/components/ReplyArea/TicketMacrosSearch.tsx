import classnames from 'classnames'
import React, {KeyboardEvent as KeyboardEventReact} from 'react'
import {Input} from 'reactstrap'

import {fetchMacrosParamsTypes} from 'state/macro/actions'
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
            <i className={classnames('material-icons md-2 ml-2 text-info')}>
                bolt
            </i>
            <Input
                tabIndex={3}
                onChange={(e) =>
                    searchMacros({
                        ...searchParams,
                        search: e.target.value,
                    })
                }
                onKeyDown={handleSearchKeyDown}
                onFocus={showMacros}
                placeholder="Search macros by name, tags or body..."
                disabled={requireCustomerSelection}
                className="border-0 ml-2"
                innerRef={setFocus}
            />
            {macrosVisible && (
                <MacroFilters
                    selectedProperties={{
                        languages: searchParams.languages,
                        tags: searchParams.tags,
                    }}
                    onChange={(values) =>
                        searchMacros({
                            ...searchParams,
                            languages: values.languages,
                            tags: values.tags,
                        })
                    }
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
