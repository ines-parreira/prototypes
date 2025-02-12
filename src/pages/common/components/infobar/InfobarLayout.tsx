import classnames from 'classnames'
import React, {ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {clamp} from 'core/layout/panels'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import {tryLocalStorage} from 'services/common/utils'
import * as layoutSelectors from 'state/layout/selectors'
import {RootState} from 'state/types'

import css from './Infobar.less'
import {getInfobarMinWidth, getInfobarWidth} from './utils'

type Props = {
    children?: ReactNode
    className?: string
    isOnNewLayout?: boolean
} & ConnectedProps<typeof connector>

type State = {
    width: Maybe<number | string>
}

export class InfobarLayout extends React.Component<Props, State> {
    private cursorX: number | null
    private originalWidth: number
    private readonly minWidth: number
    private readonly maxWidth: number
    private readonly classHandle: string
    private readonly classActive: string

    containerRef: Maybe<HTMLDivElement>

    constructor(props: Props) {
        super(props)

        this.cursorX = null
        this.originalWidth = 0
        this.minWidth = getInfobarMinWidth() as number
        this.maxWidth = clamp(
            Math.round(window.innerWidth * 0.33),
            this.minWidth,
            Infinity
        )
        this.classHandle = 'infobar-drag-handle'
        this.classActive = 'infobar-drag-active'

        const storedWidth = getInfobarWidth()
        const width = clamp(
            storedWidth ? parseInt(storedWidth, 10) : this.minWidth,
            this.minWidth,
            this.maxWidth
        )
        this.state = {width}
    }

    componentDidMount() {
        if (!this.props.isOnNewLayout) {
            window.addEventListener('mousedown', this.dragStart)
            window.addEventListener('mouseup', this.dragStop)
            window.addEventListener('contextmenu', this.dragStop)
            window.addEventListener('mousemove', this.drag)
        }
    }

    componentWillUnmount() {
        if (!this.props.isOnNewLayout) {
            window.removeEventListener('mousedown', this.dragStart)
            window.removeEventListener('mouseup', this.dragStop)
            window.removeEventListener('contextmenu', this.dragStop)
            window.removeEventListener('mousemove', this.drag)
        }
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
        if (!this.cursorX) return

        const nextWidth = clamp(
            this.originalWidth + this.cursorX - e.clientX,
            this.minWidth,
            this.maxWidth
        )

        this.setState({width: nextWidth})
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
                {...(this.props.isOnNewLayout ? {} : {style})}
            >
                {!this.props.isOnNewLayout && (
                    <div className={this.classHandle} />
                )}
                <ErrorBoundary>{this.props.children}</ErrorBoundary>
            </div>
        )
    }
}

const connector = connect((state: RootState) => ({
    isOpenedPanel: layoutSelectors.isOpenedPanel('infobar')(state),
}))

export default connector(InfobarLayout)
