import type { ComponentType, ReactNode } from 'react'
import React, { Component } from 'react'

import createToolbarPlugin from '../../draftjs/plugins/toolbar/index'
import type { ActionName } from '../../draftjs/plugins/toolbar/types'
import type { Plugin } from '../../draftjs/plugins/types'

export type RequiredProps = {
    displayedActions?: ActionName[]
}

type State = {
    linkEntityKey?: string
    linkIsOpen: boolean
    linkText: string
    linkUrl: string
    linkTarget: string
    linkSelectionRect?: DOMRect
}

export type InjectedProps = {
    createToolbarPlugin: (
        imageDecorator?: (decorator: ReactNode) => ReactNode,
    ) => Plugin
    onLinkUrlChange: (url: string) => void
    onLinkTextChange: (text: string) => void
    onLinkTargetChange: (target: string) => void
    onLinkOpen: () => void
    onLinkClose: () => void
} & State

export default function provideToolbarPlugin<Props extends RequiredProps>(
    WrappedComponent: ComponentType<Props & InjectedProps>,
): ComponentType<Props> {
    class Wrapper extends Component<Props, State> {
        state: State = {
            linkIsOpen: false,
            linkText: '',
            linkUrl: '',
            linkTarget: '_blank',
        }

        _createToolbarPlugin = (
            imageDecorator?: (decorator: ReactNode) => ReactNode,
        ) =>
            createToolbarPlugin({
                onLinkEdit: this._onToolbarPluginLinkEdit,
                onLinkCreate: this._onToolbarPluginLinkCreate,
                getDisplayedActions: () => this.props.displayedActions,
                imageDecorator,
            })

        _onLinkTextChange = (linkText: string) => this.setState({ linkText })

        _onLinkUrlChange = (linkUrl: string) => this.setState({ linkUrl })

        _onLinkTargetChange = (linkTarget: string) =>
            this.setState({ linkTarget })

        _onLinkOpen = () => {
            this.setState({ linkIsOpen: true })
        }

        _onLinkClose = () => {
            this.setState({
                linkIsOpen: false,
                linkText: '',
                linkUrl: '',
                linkEntityKey: undefined,
                linkTarget: '_blank',
                linkSelectionRect: undefined,
            })
        }

        _onToolbarPluginLinkEdit = (
            entityKey: string,
            text: string,
            url: string,
            target: string,
        ) => {
            this.setState({
                linkEntityKey: entityKey,
                linkIsOpen: true,
                linkText: text,
                linkUrl: url,
                linkTarget: target,
            })
        }

        _onToolbarPluginLinkCreate = (
            text: string,
            selectionRect?: DOMRect,
        ) => {
            this.setState({
                linkEntityKey: undefined,
                linkIsOpen: true,
                linkText: text,
                linkUrl: '',
                linkTarget: '_blank',
                linkSelectionRect: selectionRect,
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
                    onLinkTargetChange={this._onLinkTargetChange}
                />
            )
        }
    }

    return Wrapper
}
