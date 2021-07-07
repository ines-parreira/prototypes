import React, {ReactNode, ComponentType, Component} from 'react'

import createToolbarPlugin from '../../draftjs/plugins/toolbar/index'
import {ActionName} from '../../draftjs/plugins/toolbar/types'
import {Plugin} from '../../draftjs/plugins/types'

export type RequiredProps = {
    displayedActions?: ActionName[]
}

type State = {
    linkEntityKey?: string
    linkIsOpen: boolean
    linkText: string
    linkUrl: string
}

export type InjectedProps = {
    createToolbarPlugin: (
        imageDecorator?: (decorator: ReactNode) => ReactNode
    ) => Plugin
    onLinkUrlChange: (url: string) => void
    onLinkTextChange: (text: string) => void
    onLinkOpen: () => void
    onLinkClose: () => void
} & State

export default function provideToolbarPlugin<Props extends RequiredProps>(
    WrappedComponent: ComponentType<Props & InjectedProps>
): ComponentType<Props> {
    class Wrapper extends Component<Props, State> {
        state: State = {
            linkIsOpen: false,
            linkText: '',
            linkUrl: '',
        }

        _createToolbarPlugin = (
            imageDecorator?: (decorator: ReactNode) => ReactNode
        ) =>
            createToolbarPlugin({
                onLinkEdit: this._onToolbarPluginLinkEdit,
                onLinkCreate: this._onToolbarPluginLinkCreate,
                getDisplayedActions: () => this.props.displayedActions,
                imageDecorator,
            })

        _onLinkTextChange = (linkText: string) => this.setState({linkText})

        _onLinkUrlChange = (linkUrl: string) => this.setState({linkUrl})

        _onLinkOpen = () => {
            this.setState({linkIsOpen: true})
        }

        _onLinkClose = () => {
            this.setState({
                linkIsOpen: false,
                linkText: '',
                linkUrl: '',
                linkEntityKey: undefined,
            })
        }

        _onToolbarPluginLinkEdit = (
            entityKey: string,
            text: string,
            url: string
        ) => {
            this.setState({
                linkEntityKey: entityKey,
                linkIsOpen: true,
                linkText: text,
                linkUrl: url,
            })
        }

        _onToolbarPluginLinkCreate = (text: string) => {
            this.setState({
                linkEntityKey: undefined,
                linkIsOpen: true,
                linkText: text,
                linkUrl: '',
            })
        }

        render() {
            return (
                <WrappedComponent
                    {...this.props}
                    {...this.state}
                    createToolbarPlugin={this._createToolbarPlugin}
                    onLinkUrlChange={this._onLinkUrlChange}
                    onLinkTextChange={this._onLinkTextChange}
                    onLinkOpen={this._onLinkOpen}
                    onLinkClose={this._onLinkClose}
                />
            )
        }
    }

    return Wrapper
}
