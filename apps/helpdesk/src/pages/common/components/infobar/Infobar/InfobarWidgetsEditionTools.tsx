import { Component } from 'react'

import { fromJS, List, Map } from 'immutable'
import { connect, ConnectedProps } from 'react-redux'

import { Button } from '@gorgias/axiom'

import { StoreDispatch } from 'state/types'
import { startEditionMode, submitWidgets } from 'state/widgets/actions'
import { WidgetEnvironment } from 'state/widgets/types'

import css from '../Infobar.less'

type Props = {
    widgets: Map<any, any>
    context: WidgetEnvironment
} & ConnectedProps<typeof connector>

export class InfobarWidgetsEditionTools extends Component<Props> {
    _saveWidgets = () => {
        const { dispatch } = this.props
        const { widgets } = this.props
        const editedItems = (
            widgets.getIn(['_internal', 'editedItems'], fromJS([])) as List<any>
        ).toJS()
        void (dispatch as StoreDispatch)(submitWidgets(editedItems))
    }

    _cancelWidgetsUpdates = () => {
        const { context } = this.props
        this.props.dispatch(startEditionMode(context))
    }

    render() {
        const { widgets } = this.props

        const isDirty = widgets.getIn(['_internal', 'isDirty'])
        const isSavingWidgets = widgets.getIn([
            '_internal',
            'loading',
            'saving',
        ])

        return (
            <div className={css.footer}>
                <Button
                    type="button"
                    className="mr-2"
                    isLoading={isSavingWidgets}
                    isDisabled={!isDirty}
                    onClick={this._saveWidgets}
                >
                    Save changes
                </Button>
                <Button
                    type="button"
                    intent="secondary"
                    isLoading={isSavingWidgets}
                    isDisabled={!isDirty}
                    onClick={this._cancelWidgetsUpdates}
                >
                    Cancel
                </Button>
            </div>
        )
    }
}

const connector = connect()

export default connector(InfobarWidgetsEditionTools)
