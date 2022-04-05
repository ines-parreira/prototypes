import React from 'react'
import classnames from 'classnames'
import _noop from 'lodash/noop'
import {Map} from 'immutable'

import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import {getCurrentUser} from 'state/currentUser/selectors'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {MacrosSearchResult} from 'state/macro/actions'
import useAppSelector from 'hooks/useAppSelector'

import {isMacroDisabled} from '../utils'
import css from './MacroList.less'

type Props = {
    className?: string
    searchResults: MacrosSearchResult
    currentMacro: Map<any, any>
    disableExternalActions?: boolean
    onClickItem: (item: Map<any, any>) => void
    onHoverItem?: (item: Map<any, any>) => void
    loadMore: () => Promise<void>
}

const MacroListContainer = ({
    searchResults,
    className,
    currentMacro,
    disableExternalActions,
    loadMore,
    onClickItem = _noop,
    onHoverItem = _noop,
}: Props) => {
    const currentUser = useAppSelector(getCurrentUser)
    const isSuggestion = (rank: number) => rank !== 0 && rank !== 100000

    return (
        <InfiniteScroll
            className={classnames(css.component, className)}
            onLoad={loadMore}
            shouldLoadMore={searchResults.page < searchResults.totalPages}
        >
            {searchResults.macros.map((macro: Map<any, any>) => {
                const isDisabled = isMacroDisabled(
                    macro,
                    disableExternalActions
                )
                const isActive = macro.get('id') === currentMacro.get('id')
                return (
                    <div
                        key={macro.get('id')}
                        className={classnames(css.item, {
                            [css.active]: isActive,
                            [css.disabled]: isDisabled,
                        })}
                        onClick={() => {
                            if (isDisabled) return

                            logEvent(SegmentEvent.MacroAppliedSearchbar, {
                                user_id: currentUser.get('id'),
                                rank: macro.get('relevance_rank'),
                            })
                            onClickItem(macro)
                        }}
                        onMouseEnter={() => onHoverItem(macro)}
                    >
                        {macro.get('name')}
                        {isSuggestion(macro.get('relevance_rank', 0)) && (
                            <span className="material-icons md-2 float-right text-secondary">
                                auto_awesome
                            </span>
                        )}
                    </div>
                )
            })}
        </InfiniteScroll>
    )
}

export default MacroListContainer
