import React, {Ref, useEffect} from 'react'
import {setInTicketSuggestionState} from 'state/ticket/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {SuggestionStates} from './InTicketSuggestion'
import css from './SuggestionHeader.less'

type Props = {
    innerRef: Ref<HTMLElement>
    state: SuggestionStates
    onChevronToggle: () => void
    content: React.ReactNode
}

export default function SuggestionHeader({
    innerRef,
    state,
    onChevronToggle,
    content,
}: Props) {
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (state === null) {
            dispatch(setInTicketSuggestionState('pending'))
        } else if (state === 'collapse') {
            dispatch(setInTicketSuggestionState('ignored'))
        }
    }, [state, dispatch])

    return (
        <header ref={innerRef} className={css.container}>
            {content}
            <div className={css.chevron} onClick={onChevronToggle}>
                <i className="material-icons-round">
                    {state === 'preview' || state === 'expand'
                        ? 'expand_less'
                        : 'expand_more'}
                </i>
            </div>
        </header>
    )
}
