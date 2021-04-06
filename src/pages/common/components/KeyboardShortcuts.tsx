import {Component} from 'react'

import shortcutManager, {
    KeymapActions,
} from '../../../services/shortcutManager/shortcutManager'

type Props = {
    name: string
    keymap: KeymapActions
}

// TODO(@ghinda): replace direct use of shortcutManager with this component
export default class KeyboardShortcuts extends Component<Props> {
    static defaultProps: Pick<Props, 'name' | 'keymap'> = {
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
