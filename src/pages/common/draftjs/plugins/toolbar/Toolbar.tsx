import classnames from 'classnames'
import React, {Component, ReactNode, DragEvent} from 'react'

import {connect, ConnectedProps} from 'react-redux'

import Button from 'pages/common/components/button/Button'
import {RootState} from '../../../../../state/types'
import {getIntegrationsByTypes} from '../../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../../models/integration/types'

import {
    AddEmoji,
    Bold,
    Italic,
    Underline,
    AddProductLink,
} from './components/index'
import {ActionName, ActionInjectedProps} from './types'

import css from './Toolbar.less'

type State = {
    isHovered: boolean
}

type Props = {
    buttons: ReactNode[]
    attachFiles: (T: Array<Blob>) => void
    canDropFiles: boolean
    productCardsEnabled: boolean
    displayedActions?: ActionName[]
    linkAction: ReactNode
    imageAction: ReactNode
    quickReply: ReactNode
} & ActionInjectedProps &
    ConnectedProps<typeof connector>

export class Toolbar extends Component<Props, State> {
    static defaultProps = {
        buttons: [],
    }

    static isDisplayedAction = (
        name: ActionName,
        displayedActions?: ActionName[] | null
    ) => {
        if (!displayedActions) {
            return true
        }

        return displayedActions.indexOf(name) !== -1
    }

    state: State = {
        isHovered: false,
    }

    _renderButton = (button: ReactNode | null, index: number) => {
        return (
            <Button
                className={css.button}
                key={index}
                intent="secondary"
                size="small"
            >
                {button}
            </Button>
        )
    }

    _onDrop = (e: DragEvent) => {
        const {canDropFiles, attachFiles} = this.props
        if (!canDropFiles) {
            return
        }

        e.preventDefault()
        const eventFiles = (e.dataTransfer && e.dataTransfer.files) || []
        const files = Array.from(eventFiles)
        attachFiles(files)
        this._hideDragHover()
    }

    _onDragOver = (e: DragEvent) => {
        const {canDropFiles} = this.props
        if (!canDropFiles) {
            return
        }

        e.preventDefault()
        this.setState({isHovered: true})
    }

    _hideDragHover = () => {
        this.setState({isHovered: false})
    }

    _isDisplayedAction = (name: ActionName): boolean =>
        Toolbar.isDisplayedAction(name, this.props.displayedActions)

    render() {
        const {
            buttons,
            getEditorState,
            setEditorState,
            quickReply,
            integrations,
            productCardsEnabled,
        } = this.props
        const actionsProps = {getEditorState, setEditorState}

        return (
            <div
                className={classnames('editor-toolbar', css.page, {
                    [css.isHovered]: this.state.isHovered,
                })}
                onDrop={this._onDrop}
                onDragOver={this._onDragOver}
                onDragLeave={this._hideDragHover}
            >
                {quickReply && (
                    <div className={css.quickReply}> {quickReply} </div>
                )}
                <div className={css.actionsWrapper}>
                    <div className={css.actions}>
                        {this._isDisplayedAction(ActionName.Bold) && (
                            <Bold {...actionsProps} />
                        )}
                        {this._isDisplayedAction(ActionName.Italic) && (
                            <Italic {...actionsProps} />
                        )}
                        {this._isDisplayedAction(ActionName.Underline) && (
                            <Underline {...actionsProps} />
                        )}
                        {this._isDisplayedAction(ActionName.Link) &&
                            this.props.linkAction}
                        {this._isDisplayedAction(ActionName.Image) &&
                            this.props.imageAction}
                        {this._isDisplayedAction(ActionName.Emoji) && (
                            <AddEmoji {...actionsProps} />
                        )}
                        {this._isDisplayedAction(ActionName.ProductPicker) &&
                            integrations.size > 0 && (
                                <AddProductLink
                                    getEditorState={actionsProps.getEditorState}
                                    setEditorState={actionsProps.setEditorState}
                                    integrations={integrations}
                                    productCardsEnabled={productCardsEnabled}
                                />
                            )}
                    </div>
                    {buttons.map(this._renderButton)}

                    <div className={css.hoverOverlay}>
                        Add files as attachments
                    </div>
                </div>
            </div>
        )
    }
}

const connector = connect((state: RootState) => ({
    integrations: getIntegrationsByTypes([IntegrationType.Shopify])(state),
}))
export default connector(Toolbar)
