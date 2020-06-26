import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import classnames from 'classnames'
import _max from 'lodash/max'

import * as layoutSelectors from '../../../../state/layout/selectors'
import {ErrorBoundary} from '../../../ErrorBoundary'

import css from './Infobar.less'

@connect((state) => ({
    isOpenedPanel: layoutSelectors.isOpenedPanel('infobar')(state),
}))
export default class InfobarLayout extends React.Component {
    static propTypes = {
        children: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.array
        ]),
        isOpenedPanel: PropTypes.bool.isRequired,
        className: PropTypes.string,
    }

    containerRef: ?HTMLDivElement

    constructor(props) {
        super(props)

        this.cursorX = null
        this.originalWidth = 0
        this.minWidth = _max([window.innerWidth / 5.1, 350])
        this.maxWidth = window.innerWidth / 2
        this.classHandle = 'infobar-drag-handle'
        this.classActive = 'infobar-drag-active'

        const width = window.localStorage.getItem('infobar-width') || this.minWidth

        this.state = {width}
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

    dragStart = (e) => {
        if (!e.target.classList.contains(this.classHandle)) {
            return
        }

        this.cursorX = e.clientX
        const computedStyle = window.getComputedStyle(this.containerRef)

        this.originalWidth = parseInt(computedStyle.getPropertyValue('width'), 10)

        document.body.classList.add(this.classActive)
    }

    dragStop = () => {
        this.cursorX = null
        document.body.classList.remove(this.classActive)

        // save width in local storage so it sticks
        window.localStorage.setItem('infobar-width', this.state.width)
    }

    drag = (e) => {
        if (this.cursorX === null) {
            return
        }

        const nextWidth = this.originalWidth + this.cursorX - e.clientX

        // don't expand/shrink past min/max width.
        // for performance.
        if (nextWidth > this.minWidth && nextWidth < this.maxWidth) {
            this.setState({
                width: this.originalWidth + this.cursorX - e.clientX
            })
        }
    }

    render() {
        const style = {
            width: `${this.state.width}px`
        }

        return (
            <div
                className={classnames(css.component, 'infobar infobar-panel d-print-none', {
                    'hidden-panel': !this.props.isOpenedPanel,
                }, this.props.className)}
                ref={(ref) => this.containerRef = ref}
                style={style}
            >
                <div className="infobar-drag-handle" />
                <ErrorBoundary>
                    {this.props.children}
                </ErrorBoundary>
            </div>
        )
    }
}
