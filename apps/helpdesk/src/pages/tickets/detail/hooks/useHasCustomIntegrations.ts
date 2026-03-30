import { useMemo } from 'react'

import type { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { NAMED_INTEGRATION_WIDGET_TYPES } from 'state/widgets/constants'
import { getWidgetsWithContext } from 'state/widgets/selectors'
import { WidgetEnvironment } from 'state/widgets/types'

export default function useHasCustomIntegrations() {
    const widgets = useAppSelector(
        getWidgetsWithContext(WidgetEnvironment.Ticket),
    )

    return useMemo(
        () =>
            widgets.some(
                (w: Map<string, unknown>) =>
                    !NAMED_INTEGRATION_WIDGET_TYPES.has(
                        w?.get('type') as string,
                    ),
            ),
        [widgets],
    )
}
