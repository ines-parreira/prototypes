import React from 'react'

/**
 * High Order Component to allow to the wrapped component to check if it is hovered or not.
 * @param Component
 */
const Hoverable = Component => class Hovered extends React.Component {
    static childContextTypes = {
        hovered: React.PropTypes.bool,
    }

    constructor() {
        super()
        this.state = { hovered: false }
    }

    getChildContext() {
        return { hovered: this.state.hovered }
    }

    _handleMouseEnter = () => {
        if (!this.state.hovered) {
            this.setState({ hovered: true })
        }
    }

    _handleMouseLeave = () => {
        if (this.state.hovered) {
            this.setState({ hovered: false })
        }
    }

    render() {
        return (
            <span onMouseEnter={this._handleMouseEnter} onMouseLeave={this._handleMouseLeave}>
                <Component {...this.props} hovered={this.state.hovered} />
            </span>
        )
    }
}

export default Hoverable
