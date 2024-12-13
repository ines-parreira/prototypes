import {Macro} from '@gorgias/api-queries'
import classnames from 'classnames'
import {List, Map} from 'immutable'
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
    searchResults: List<any>
    currentMacro: Map<any, any>
    areExternalActionsDisabled?: boolean
    onClickItem: (item: Map<any, any>) => void
    onHoverItem?: (item: Map<any, any>) => void
    loadMore: () => Promise<Macro[] | void>
    hasDataToLoad?: boolean
}

const MacroListContainer = ({
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
            {searchResults.map((macro: Map<any, any>) => {
                const isDisabled = isMacroDisabled(
                    macro,
                    areExternalActionsDisabled
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
                                is_recommended: isSuggestion(
                                    macro.get('relevance_rank', 0)
                                ),
                                macro_id: macro.get('id'),
                                rank: macro.get('relevance_rank'),
                                user_id: currentUser.get('id'),
                            })
                            onClickItem(macro)
                        }}
                        onMouseEnter={() => onHoverItem(macro)}
                    >
                        {macro.get('name') || <i>No name</i>}
                        {isSuggestion(macro.get('relevance_rank', 0)) && (
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

export default MacroListContainer
