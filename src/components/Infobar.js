import React, { PropTypes } from 'react'
import Search from './Search'

export default class Infobar extends React.Component {
    constructor() {
        super()

        this.dragging = false
        this.classHandle = 'infobar-drag-handle'
        this.classActive = 'infobar-drag-active'

        console.log('constructor')
    }

    getInitialState() {
        // TODO get bar size from api
        return {
            width: 200
        }
    }

    dragStart(e) {
        if (!e.target.classList.contains(this.classHandle)) {
            return
        }

        this.dragging = true
        document.body.classList.add(this.classActive)
    }

    dragStop(e) {
        this.dragging = false
        document.body.classList.remove(this.classActive)
    }

    drag() {
        if (this.dragging !== true) {
            return
        }

        // TODO set css size and setState

        console.log(this.dragging, 'drag')
    }

    shouldComponentUpdate(nextProps, nextState) {
        // TODO, if width changed, check if the same as css (math.round)
        // and don't re-render if the same
        return true;
    }

    componentDidMount() {
        // TODO stop drag when outside tab
        window.addEventListener('mousedown', this.dragStart.bind(this))
        window.addEventListener('mouseup', this.dragStop.bind(this))
        window.addEventListener('mousemove', this.drag.bind(this))
    }

    componentWillUnmount() {
        window.removeEventListener('mousedown', this.dragStart.bind(this))
        window.removeEventListener('mouseup', this.dragStop.bind(this))
        window.removeEventListener('mousemove', this.drag.bind(this))
    }

    render() {
        const { widgets } = this.props
        if (!widgets.get('items').length) {
            return null
        }

        return (
            <div className="infobar">
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
