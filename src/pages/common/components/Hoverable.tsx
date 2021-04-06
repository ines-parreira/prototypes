import React, {ComponentProps, ComponentType, Component} from 'react'
import PropTypes from 'prop-types'

/**
 * HOC to allow to the wrapped component to check if it is hovered or not.
 * @param ComposedComponent
 * @returns {{}}
 */

type OwnProps = {
    hoverableClassName?: string
}

type State = {
    hovered: boolean
}

export default function Hoverable<ComposableProps>(
    ComposedComponent: ComponentType<ComposableProps>
): ComponentType<any> {
    type Props = OwnProps & ComponentProps<typeof ComposedComponent>

    return class extends Component<Props, State> {
        static childContextTypes = {
            hovered: PropTypes.bool,
        }

        constructor(props: Props) {
            super(props)
            this.state = {hovered: false}
        }

        getChildContext() {
            return {hovered: this.state.hovered}
        }

        _handleMouseEnter = () => {
            if (!this.state.hovered) {
                this.setState({hovered: true})
            }
        }

        _handleMouseLeave = () => {
            if (this.state.hovered) {
                this.setState({hovered: false})
            }
        }

        render() {
            return (
                <span
                    className={this.props.hoverableClassName || ''}
                    onMouseEnter={this._handleMouseEnter}
                    onMouseLeave={this._handleMouseLeave}
                >
                    <ComposedComponent
                        {...this.props}
                        hovered={this.state.hovered}
                    />
                </span>
            )
        }
    }
}
