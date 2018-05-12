// @flow
import React from 'react'
import classnames from 'classnames'
import {Button} from 'reactstrap'
import {fromJS} from 'immutable'

import * as css from '../Infobar.less'


type Props = {
    widgets: Object,
    actions: Object,
    context: string
}

export default class InfobarWidgetsEditionTools extends React.Component<Props> {
    _saveWidgets = () => {
        const {actions, widgets} = this.props
        const editedItems = widgets.getIn(['_internal', 'editedItems'], fromJS([])).toJS()
        actions.submitWidgets(editedItems)
    }

    _cancelWidgetsUpdates = () => {
        const {actions, context} = this.props
        actions.startEditionMode(context)
    }

    render() {
        const {widgets} = this.props

        const isDirty = widgets.getIn(['_internal', 'isDirty'])
        const isSavingWidgets = widgets.getIn(['_internal', 'loading', 'saving'])

        return (
            <div className={css.footer}>
                <Button
                    type="button"
                    color="success"
                    className={classnames('mr-2', {
                        'btn-loading': isSavingWidgets,
                    })}
                    disabled={isSavingWidgets || !isDirty}
                    onClick={this._saveWidgets}
                >
                    Save changes
                </Button>
                <Button
                    type="button"
                    color="secondary"
                    className={classnames({
                        'btn-loading': isSavingWidgets,
                    })}
                    disabled={isSavingWidgets || !isDirty}
                    onClick={this._cancelWidgetsUpdates}
                >
                    Cancel
                </Button>
            </div>
        )
    }
}
