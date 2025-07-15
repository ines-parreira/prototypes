import classnames from 'classnames'
import _noop from 'lodash/noop'

import { Macro } from '@gorgias/helpdesk-queries'
import { Tooltip } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import useId from 'hooks/useId'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import { getCurrentUser } from 'state/currentUser/selectors'

import { isMacroDisabled } from '../utils'

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
    return (
        <InfiniteScroll
            className={classnames(css.component, className)}
            onLoad={loadMore}
            shouldLoadMore={hasDataToLoad}
        >
            {searchResults
                .filter((macro) => macro && typeof macro.id !== 'undefined')
                .map((macro: Macro) => (
                    <MacroListItem
                        key={macro.id}
                        macro={macro}
                        currentMacro={currentMacro}
                        areExternalActionsDisabled={areExternalActionsDisabled}
                        onHoverItem={onHoverItem}
                        onClickItem={onClickItem}
                    />
                ))}
        </InfiniteScroll>
    )
}

function MacroListItem({
    macro,
    currentMacro,
    areExternalActionsDisabled,
    onHoverItem,
    onClickItem,
}: {
    macro: Macro
    currentMacro?: Macro
    areExternalActionsDisabled?: boolean
    onHoverItem?: (item: Macro) => void
    onClickItem: (item: Macro) => void
}) {
    const currentUser = useAppSelector(getCurrentUser)
    const isSuggestion = (rank: number) => rank !== 0 && rank !== 100000
    const isDisabled = isMacroDisabled(macro, areExternalActionsDisabled)
    const isActive = macro.id === currentMacro?.id
    const id = useId()
    const scopedId = `macro-list-item-icon-${id}`
    return (
        <div
            className={classnames(css.item, {
                [css.active]: isActive,
                [css.disabled]: isDisabled,
            })}
            onClick={() => {
                if (isDisabled) return

                logEvent(SegmentEvent.MacroAppliedSearchbar, {
                    is_recommended: isSuggestion(macro.relevance_rank ?? 0),
                    macro_id: macro.id,
                    rank: macro.relevance_rank,
                    user_id: currentUser.get('id'),
                })
                onClickItem(macro)
            }}
            onMouseEnter={() => onHoverItem?.(macro)}
        >
            {macro.name || <i>No name</i>}
            {isSuggestion(macro.relevance_rank ?? 0) && (
                <>
                    <span
                        id={`${scopedId}-automated`}
                        className={classnames('material-icons', css.automated)}
                    >
                        verified
                    </span>
                    <Tooltip target={`${scopedId}-automated`}>
                        Recommended based on ticket content
                    </Tooltip>
                </>
            )}
        </div>
    )
}

export default MacroList
