import React, {ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'

import {tryLocalStorage} from '../../../../services/common/utils'
import * as layoutSelectors from '../../../../state/layout/selectors'
import {RootState} from '../../../../state/types'

import {ErrorBoundary} from '../../../ErrorBoundary'

import {getInfobarMinWidth, getInfobarWidth} from './utils'
import css from './Infobar.less'

type Props = {
    children?: ReactNode
    className?: string
} & ConnectedProps<typeof connector>

type State = {
    width: Maybe<number | string>
}

export class InfobarLayout extends React.Component<Props, State> {
    private cursorX: number | null
    private originalWidth: number
    private readonly minWidth: number | undefined
    private readonly maxWidth: number
    private readonly classHandle: string
    private readonly classActive: string

    containerRef: Maybe<HTMLDivElement>

    constructor(props: Props) {
        super(props)

        this.cursorX = null
        this.originalWidth = 0
        this.minWidth = getInfobarMinWidth()
        this.maxWidth = window.innerWidth / 2
        this.classHandle = 'infobar-drag-handle'
        this.classActive = 'infobar-drag-active'

        const width = getInfobarWidth() || this.minWidth
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

    dragStart = (e: MouseEvent) => {
        if (!(e.target as HTMLElement).classList.contains(this.classHandle)) {
            return
        }

        this.cursorX = e.clientX
        const computedStyle = window.getComputedStyle(this.containerRef!)

        this.originalWidth = parseInt(
            computedStyle.getPropertyValue('width'),
            10
        )

        document.body.classList.add(this.classActive)
    }

    dragStop = () => {
        this.cursorX = null
        document.body.classList.remove(this.classActive)

        tryLocalStorage(() =>
            window.localStorage.setItem(
                'infobar-width',
                this.state.width as string
            )
        )
    }

    drag = (e: MouseEvent) => {
        if (this.cursorX === null) {
            return
        }

        const nextWidth = this.originalWidth + this.cursorX - e.clientX

        // don't expand/shrink past min/max width.
        // for performance.
        if (nextWidth > this.minWidth! && nextWidth < this.maxWidth) {
            this.setState({
                width: this.originalWidth + this.cursorX - e.clientX,
            })
        }
    }

    render() {
        const style = {
            width: `${this.state.width!}px`,
        }

        return (
            <div
                className={classnames(
                    css.component,
                    'infobar infobar-panel d-print-none',
                    {
                        'hidden-panel': !this.props.isOpenedPanel,
                    },
                    this.props.className
                )}
                ref={(ref) => (this.containerRef = ref)}
                style={style}
            >
                <div className="infobar-drag-handle" />
                <ErrorBoundary>{this.props.children}</ErrorBoundary>
            </div>
        )
    }
}

const connector = connect((state: RootState) => ({
    isOpenedPanel: layoutSelectors.isOpenedPanel('infobar')(state),
}))

export default connector(InfobarLayout)
