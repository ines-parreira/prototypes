import React from 'react'

import useSplitTicketView from 'split-ticket-view-toggle/hooks/useSplitTicketView'
import Button from 'pages/common/components/button/Button'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getActiveView} from 'state/views/selectors'
import {setViewEditMode} from 'state/views/actions'

import css from './InvalidFiltersAction.less'

export default function InvalidFiltersAction() {
    const dispatch = useAppDispatch()
    const activeView = useAppSelector(getActiveView)

    const {setIsEnabled} = useSplitTicketView()

    const navigateToFilters = () => {
        setIsEnabled(false)
        dispatch(setViewEditMode(activeView))
    }

    return (
        <Button
            size="small"
            fillStyle="ghost"
            className={css.cta}
            onClick={navigateToFilters}
        >
            Fix filters
        </Button>
    )
}
