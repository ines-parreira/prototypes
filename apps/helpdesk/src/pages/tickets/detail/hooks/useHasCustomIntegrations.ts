import { useMemo } from 'react'

import type { Map } from 'immutable'

import { useAppSelector } from 'hooks/useAppSelector'
import { NAMED_INTEGRATION_WIDGET_TYPES } from 'state/widgets/constants'
import {
    getSourcesWithCustomer,
    getWidgetsWithContext,
} from 'state/widgets/selectors'
import { WidgetEnvironment } from 'state/widgets/types'
import { getWidgetSourcePath } from 'state/widgets/utils'

export function useHasCustomIntegrations() {
    const widgets = useAppSelector(
        getWidgetsWithContext(WidgetEnvironment.Ticket),
    )
    const sources = useAppSelector(getSourcesWithCustomer)

    return useMemo(
        () =>
            widgets.some(
                (w: Map<string, unknown>) =>
                    !NAMED_INTEGRATION_WIDGET_TYPES.has(
                        w?.get('type') as string,
                    ) && getWidgetSourcePath(w, sources) !== null,
            ),
        [widgets, sources],
    )
}
