import React, {PropTypes} from 'react'
import classnames from 'classnames'

import css from './Toolbar.less'

class Toolbar extends React.Component {
    static propTypes = {
        actions: PropTypes.array.isRequired,
        buttons: PropTypes.array.isRequired,
        hideActions: PropTypes.bool.isRequired,
        store: PropTypes.object.isRequired,
    }

    static defaultProps = {
        actions: [],
        buttons: [],
        hideActions: false,
    }

    _preventDefault = (event) => {
        event.preventDefault()
    }

    _toggleAction = (action) => {
        const {store} = this.props

        if (action.trigger) {
            action.trigger(store.getItem('getEditorState'), store.getItem('setEditorState'))
        }
    }

    _renderAction = (action) => {
        const {store} = this.props

        const getEditorState = store.getItem('getEditorState')

        const isDisabled = action.isDisabled(getEditorState)

        return (
            <div
                key={action.label}
                className={classnames(css.button, {
                    [css.active]: action.isActive(getEditorState),
                    [css.disabled]: isDisabled,
                })}
                onClick={(e) => {
                    this._preventDefault(e)

                    if (!isDisabled) {
                        this._toggleAction(action)
                    }
                }}
            >
                {
                    action.icon ?
                        <i className={`${action.icon} icon`} />
                        : action.button
                }
            </div>
        )
    }

    _renderButton = (button, index) => {
        return (
            <div
                key={index}
                className={css.button}
            >
                {button}
            </div>
        )
    }

    render() {
        const {actions, buttons, hideActions} = this.props

        const displaySeparator = !hideActions && buttons.length > 0

        return (
            <div
                className={classnames('editor-toolbar', css.page)}
                onMouseDown={this._preventDefault}
            >
                {!hideActions && actions.map(this._renderAction)}
                {displaySeparator && <span className={css.separator} />}
                {buttons.map(this._renderButton)}
            </div>
        )
    }
}

export default Toolbar
