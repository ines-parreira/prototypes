import classnames from 'classnames'
import React, {MouseEvent, useContext} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {Template} from 'models/widget/types'
import {getWidgetTitle} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/helpers'
import {getIntegrationById} from 'state/integrations/selectors'
import {removeEditedWidget} from 'state/widgets/actions'
import {WidgetContext} from 'Widgets/contexts/WidgetContext'
import WidgetPanel from 'Widgets/modules/WidgetPanel/components/WidgetPanel'

import css from './Placeholder.less'

const PLACEHOLDER_ACCENT_COLOR = 'var(--neutral-grey-4)'

type Props = {
    template: Template
    isEditing?: boolean
}

export default function Placeholder({template, isEditing}: Props) {
    const dispatch = useAppDispatch()
    const widget = useContext(WidgetContext)
    const integration = useAppSelector(
        getIntegrationById(Number(widget.integration_id)) || null
    )

    const handleDeleteWidget = (evt: MouseEvent) => {
        const absolutePath = template.absolutePath || []
        const templatePath = template.templatePath || ''

        evt.stopPropagation()

        if (isEditing) {
            dispatch(removeEditedWidget(templatePath, absolutePath))
        }
    }

    const renderWidgetFor = () => {
        const widgetName = getWidgetTitle({
            source: null,
            widgetType: widget.type,
            appId: widget.app_id,
            template,
            integration: integration?.toJS(),
        })

        let widgetFor = `Widget for ${widgetName}`
        if (!widgetName.includes('data')) {
            widgetFor = `${widgetFor} data`
        }

        return widgetFor
    }

    return (
        <div className={classnames(css.wrapper, 'draggable')}>
            <WidgetPanel
                widgetType={widget.type}
                fallbackColor={PLACEHOLDER_ACCENT_COLOR}
            >
                <div className={css.card}>
                    <h5 className={css.title}>{renderWidgetFor()}</h5>
                    <i
                        className={classnames(
                            css.delete,
                            'material-icons',
                            'text-danger'
                        )}
                        onClick={handleDeleteWidget}
                    >
                        delete
                    </i>
                </div>
            </WidgetPanel>
        </div>
    )
}
