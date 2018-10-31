// @flow
import React from 'react'

import shortcutManager from '../../../services/shortcutManager'

type Props = {
    name: string,
    keymap: any,
}

// TODO(@ghinda): replace direct use of shortcutManager with this component
export default class KeyboardShortcuts extends React.Component<Props> {
    static defaultProps = {
        name: '',
        keymap: {},
    }

    componentDidMount() {
        shortcutManager.bind(this.props.name, this.props.keymap)
    }

    componentWillUnmount() {
        shortcutManager.unbind(this.props.name)
    }

    render = () => null
}

