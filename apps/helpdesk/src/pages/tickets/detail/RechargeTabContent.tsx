import { useMemo } from 'react'

import { fromJS } from 'immutable'
import type { List, Map } from 'immutable'

import { IntegrationType } from '@gorgias/helpdesk-queries'

import type { Source, Template } from 'models/widget/types'
import { EditionContext } from 'providers/infobar/EditionContext'
import type { WidgetsState } from 'state/widgets/types'
import { WidgetEnvironment } from 'state/widgets/types'
import { itemsWithContext } from 'state/widgets/utils'
import { WidgetContextProvider } from 'Widgets/contexts/WidgetContext'
import RechargeWidget from 'Widgets/modules/Recharge'

import RechargeWidgetsEditionTools from './RechargeWidgetsEditionTools'

import css from './TicketInfobarContainer.less'

type Props = {
    sources: Map<string, unknown>
    widgets: WidgetsState
    rechargeIntegration: { id: number }
}

export default function RechargeTabContent({
    sources,
    widgets,
    rechargeIntegration,
}: Props) {
    const isEditing = useMemo(
        () => widgets.getIn(['_internal', 'isEditing']) as boolean,
        [widgets],
    )

    const contextFilteredItems = useMemo(() => {
        return isEditing
            ? (widgets.getIn(['_internal', 'editedItems']) as List<
                  Map<string, unknown>
              >)
            : itemsWithContext(
                  widgets.get('items', fromJS([])) as List<
                      Map<string, unknown>
                  >,
                  WidgetEnvironment.Ticket,
              )
    }, [widgets, isEditing])

    const rechargeWidget = useMemo(() => {
        return contextFilteredItems?.find(
            (w) => w?.get('type') === IntegrationType.Recharge,
        )
    }, [contextFilteredItems])

    const rechargeWidgetIndex = useMemo(() => {
        if (!contextFilteredItems || !rechargeWidget) return -1
        return contextFilteredItems.findIndex(
            (w) => w?.get('id') === rechargeWidget.get('id'),
        )
    }, [contextFilteredItems, rechargeWidget])

    const source = useMemo(
        () =>
            sources.getIn([
                'ticket',
                'customer',
                'integrations',
                String(rechargeIntegration.id),
            ]) as Map<string, unknown> | undefined,
        [sources, rechargeIntegration.id],
    )

    if (!rechargeWidget || !source) {
        return null
    }

    const template = rechargeWidget.get('template') as Map<string, unknown>
    const absolutePath = [
        'ticket',
        'customer',
        'integrations',
        String(rechargeIntegration.id),
    ]
    const passedTemplate = {
        ...(template.toJS() as Template),
        templatePath: `${rechargeWidgetIndex}.template`,
        absolutePath,
    }

    return (
        <div className={css.rechargeContainer}>
            <EditionContext.Provider value={{ isEditing }}>
                <div className={css.rechargeContent}>
                    <WidgetContextProvider value={rechargeWidget}>
                        <RechargeWidget
                            source={source.toJS() as Source}
                            template={passedTemplate}
                        />
                    </WidgetContextProvider>
                </div>
                {isEditing && (
                    <RechargeWidgetsEditionTools
                        widgets={widgets}
                        context={WidgetEnvironment.Ticket}
                    />
                )}
            </EditionContext.Provider>
        </div>
    )
}
