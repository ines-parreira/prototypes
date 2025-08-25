import { Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useSplitTicketView from 'split-ticket-view-toggle/hooks/useSplitTicketView'
import { setViewEditMode } from 'state/views/actions'
import { getActiveView } from 'state/views/selectors'

import css from './InvalidFiltersAction.less'

export default function InvalidFiltersAction() {
    const dispatch = useAppDispatch()
    const activeView = useAppSelector(getActiveView)

    const { setIsEnabled } = useSplitTicketView()

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
