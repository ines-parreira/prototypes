import {Macro} from '@gorgias/api-queries'
import classnames from 'classnames'
import _noop from 'lodash/noop'
import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import {getCurrentUser} from 'state/currentUser/selectors'

import {isMacroDisabled} from '../utils'
import css from './MacroList.less'

type Props = {
    className?: string
    searchResults: Macro[]
    currentMacro?: Macro
    areExternalActionsDisabled?: boolean
    onClickItem: (item: Macro) => void
    onHoverItem?: (item: Macro) => void
    loadMore: () => Promise<void>
    hasDataToLoad?: boolean
}

const MacroList = ({
    searchResults,
    className,
    currentMacro,
    areExternalActionsDisabled,
    loadMore,
    onClickItem = _noop,
    onHoverItem = _noop,
    hasDataToLoad,
}: Props) => {
    const currentUser = useAppSelector(getCurrentUser)
    const isSuggestion = (rank: number) => rank !== 0 && rank !== 100000

    return (
        <InfiniteScroll
            className={classnames(css.component, className)}
            onLoad={loadMore}
            shouldLoadMore={hasDataToLoad}
        >
            {searchResults.map((macro: Macro) => {
                const isDisabled = isMacroDisabled(
                    macro,
                    areExternalActionsDisabled
                )
                const isActive = macro.id === currentMacro?.id
                return (
                    <div
                        key={macro.id}
                        className={classnames(css.item, {
                            [css.active]: isActive,
                            [css.disabled]: isDisabled,
                        })}
                        onClick={() => {
                            if (isDisabled) return

                            logEvent(SegmentEvent.MacroAppliedSearchbar, {
                                is_recommended: isSuggestion(
                                    macro.relevance_rank ?? 0
                                ),
                                macro_id: macro.id,
                                rank: macro.relevance_rank,
                                user_id: currentUser.get('id'),
                            })
                            onClickItem(macro)
                        }}
                        onMouseEnter={() => onHoverItem(macro)}
                    >
                        {macro.name || <i>No name</i>}
                        {isSuggestion(macro.relevance_rank ?? 0) && (
                            <span
                                className={classnames(
                                    'material-icons',
                                    css.automated
                                )}
                            >
                                auto_awesome
                            </span>
                        )}
                    </div>
                )
            })}
        </InfiniteScroll>
    )
}

export default MacroList
