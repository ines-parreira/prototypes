import { useCallback } from 'react'

import { useTicketInfobarNavigation } from '@repo/navigation'
import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'

import { Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import * as actions from 'state/widgets/actions'
import type { WidgetEnvironment, WidgetsState } from 'state/widgets/types'

import css from './TicketInfobarContainer.less'

type Props = {
    widgets: WidgetsState
    context: WidgetEnvironment
}

export default function RechargeWidgetsEditionTools({
    widgets,
    context,
}: Props) {
    const dispatch = useAppDispatch()
    const { onSetEditingWidgetType } = useTicketInfobarNavigation()

    const isDirty = widgets.getIn(['_internal', 'isDirty']) as boolean
    const isSavingWidgets = widgets.getIn([
        '_internal',
        'loading',
        'saving',
    ]) as boolean

    const navigateAway = useCallback(() => {
        onSetEditingWidgetType(null)
    }, [onSetEditingWidgetType])

    const handleSave = useCallback(() => {
        const editedItems = (
            widgets.getIn(['_internal', 'editedItems'], fromJS([])) as List<
                Map<string, unknown>
            >
        ).toJS()
        void dispatch(actions.submitWidgets(editedItems)).then(() => {
            navigateAway()
        })
    }, [dispatch, widgets, navigateAway])

    const handleCancel = useCallback(() => {
        dispatch(actions.startEditionMode(context))
        navigateAway()
    }, [dispatch, context, navigateAway])

    return (
        <div className={css.editionTools}>
            <Button
                isLoading={isSavingWidgets}
                isDisabled={!isDirty}
                onClick={handleSave}
            >
                Save changes
            </Button>
            <Button
                variant="secondary"
                isLoading={isSavingWidgets}
                onClick={handleCancel}
            >
                Cancel
            </Button>
        </div>
    )
}
