import {Map} from 'immutable'
import React from 'react'
import classnames from 'classnames'

import WidgetCustomRedirectionLinks from './WidgetCustomRedirectionLinks'
import css from './WidgetCustomActions.less'

type Props = {
    source: Map<any, any>
    widget: Map<any, any>
    isEditing: boolean
    template: any
}

export default function WidgetCustomActions(props: Props) {
    return (
        <div className={classnames(css.container)}>
            <WidgetCustomRedirectionLinks
                key="add-redirection-link-button"
                widget={props.widget}
                template={props.template}
                isEditing={props.isEditing}
            />
        </div>
    )
}
