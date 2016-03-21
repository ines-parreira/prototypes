import React, { PropTypes } from 'react'
import Search from './Search'

export default class Infobar extends React.Component {
    constructor() {
        super()

        this.cursorX = null
        this.originalWidth = 0
        this.minWidth = 0
        this.maxWidth = 0
        this.classHandle = 'infobar-drag-handle'
        this.classActive = 'infobar-drag-active'

        // TODO get bar size from store/api
        this.state = {
            width: 320
        }

        // overwrite methods with bound methods,
        // so we can cleanly unbind on unmount
        this.dragStart = this.dragStart.bind(this)
        this.dragStop = this.dragStop.bind(this)
        this.drag = this.drag.bind(this)
    }

    dragStart(e) {
        if (!e.target.classList.contains(this.classHandle)) {
            return
        }

        this.cursorX = e.clientX
        var computedStyle = window.getComputedStyle(this.refs.container)

        this.originalWidth = parseInt(computedStyle.getPropertyValue('width'))
        this.minWidth = parseInt(computedStyle.getPropertyValue('min-width'))
        this.maxWidth = parseInt(computedStyle.getPropertyValue('max-width'))

        document.body.classList.add(this.classActive)
    }

    dragStop(e) {
        this.cursorX = null
        document.body.classList.remove(this.classActive)
    }

    drag(e) {
        if (this.cursorX === null) {
            return
        }

        var nextWidth = this.originalWidth + this.cursorX - e.clientX

        // don't expand/shrink past min/max width.
        // for performance.
        if (nextWidth > this.minWidth && nextWidth < this.maxWidth) {
            this.setState({
                width: this.originalWidth + this.cursorX - e.clientX
            })
        }
    }

    componentDidMount() {
        window.addEventListener('mousedown', this.dragStart)
        window.addEventListener('mouseup', this.dragStop)
        window.addEventListener('contextmenu', this.dragStop)
        window.addEventListener('mousemove', this.drag)
    }

    componentWillUnmount() {
        window.removeEventListener('mousedown', this.dragStart)
        window.removeEventListener('mouseup', this.dragStop)
        window.removeEventListener('contextmenu', this.dragStop)
        window.removeEventListener('mousemove', this.drag)
    }

    render() {
        const { widgets } = this.props
        if (!widgets.get('items').length) {
            return null
        }

        var style = {
            width: this.state.width
        }

        return (
            <div className="infobar" ref="container" style={style}>
                <div className="infobar-drag-handle"></div>
                <div className="infobar-box infobar-search">
                    <Search id="ticket"/>
                </div>
                <div className="infobar-top infobar-box">
                    <h2>
                        Erick Rodriguez
                    </h2>

                    <div className="infobar-card ui card">
                        <div className="content">
                            <ul>
                                <li>
                                    <strong>
                                        Email address:
                                    </strong>
                                    <a href="">
                                        erodriguez@gmail.com
                                    </a>
                                </li>
                                <li>
                                    <strong>
                                        City:
                                    </strong>
                                    <a href="">
                                        NYC
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="infobar-content infobar-box">
                    infobar-content
                </div>
            </div>
        )
    }
}

Infobar.propTypes = {
    widgets: PropTypes.object,
    ticket: PropTypes.object
}
