import classnames from 'classnames'
import React, {KeyboardEvent as KeyboardEventReact, useRef} from 'react'

import {fetchMacrosParamsTypes} from 'state/macro/actions'
import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'
import MacroFilters from 'pages/common/components/MacroFilters/MacroFilters'
import OnbordingMacroPopover from 'pages/tickets/common/macros/components/OnbordingMacroPopover'
import {useFeatureFlags} from 'hooks/useFeatureFlags'
import {FlagKey} from 'providers/FeatureFlags'
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
    const {getFlag} = useFeatureFlags()
    const ref = useRef<HTMLElement | null>(null)

    return (
        <div className={classnames(css.component, 'd-flex align-items-center')}>
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
                className={classnames('border-0', 'shadow-none')}
                inputClassName={css.searchInput}
                ref={setFocus}
                prefix={
                    <IconInput
                        className={classnames(css.bolt, 'md-2 text-info')}
                        icon="bolt"
                    />
                }
            />
            {macrosVisible && (
                <MacroFilters
                    selectedProperties={{
                        languages: searchParams.languages,
                        tags: searchParams.tags,
                    }}
                    onChange={searchMacros}
                    size="sm"
                />
            )}

            <i
                ref={ref}
                className={classnames(
                    'material-icons md-2 mr-3 clickable',
                    css.closeButton
                )}
                onClick={macrosVisible ? onClearMacro : showMacros}
            >
                {macrosVisible ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </i>

            {getFlag(FlagKey.DefaultMacroToSearch) && (
                <OnbordingMacroPopover
                    target={ref}
                    onClearMacro={onClearMacro}
                />
            )}
        </div>
    )
}

export default TicketMacrosSearch
