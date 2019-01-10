import React from 'react'
import PropTypes from 'prop-types'

/**
 * HOC to allow to the wrapped component to check if it is hovered or not.
 * @param ComposedComponent
 * @returns {{}}
 */
export default (ComposedComponent) => {
    return class extends React.Component {
        static propTypes = {
            hoverableClassName: PropTypes.string,
        }

        static childContextTypes = {
            hovered: PropTypes.bool,
        }

        constructor() {
            super()
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
