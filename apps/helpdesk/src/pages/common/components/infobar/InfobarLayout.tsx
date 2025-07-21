import { Component, ReactNode } from 'react'
import type { ComponentType } from 'react'

import classnames from 'classnames'
import { connect, ConnectedProps } from 'react-redux'

import { clamp, useSavedSizes } from 'core/layout/panels'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import * as layoutSelectors from 'state/layout/selectors'
import { RootState } from 'state/types'

import css from './Infobar.less'

export const DEFAULT_WIDTH = 340
export const MIN_WIDTH = 340
export const MAX_WIDTH = 0.33

type UseSavedSizesReturn = ReturnType<typeof useSavedSizes>

type SavedSizesProps = {
    savedSizes: UseSavedSizesReturn[0]
    persistSizes: UseSavedSizesReturn[1]
}

type Props = {
    children?: ReactNode
    className?: string
    isOnNewLayout?: boolean
} & ConnectedProps<typeof connector>

type State = {
    width: number
}

export class InfobarLayout extends Component<Props & SavedSizesProps, State> {
    private cursorX: number | null
    private originalWidth: number
    private readonly maxWidth: number
    private readonly classHandle: string
    private readonly classActive: string

    containerRef: Maybe<HTMLDivElement>

    constructor(props: Props & SavedSizesProps) {
        super(props)

        const { savedSizes } = props

        this.cursorX = null
        this.originalWidth = 0
        this.maxWidth = clamp(
            Math.round(window.innerWidth * MAX_WIDTH),
            MIN_WIDTH,
            Infinity,
        )
        this.classHandle = 'infobar-drag-handle'
        this.classActive = 'infobar-drag-active'

        const width = clamp(
            savedSizes.current.infobar || DEFAULT_WIDTH,
            MIN_WIDTH,
            this.maxWidth,
        )
        this.state = { width }
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
            10,
        )

        document.body.classList.add(this.classActive)
    }

    dragStop = () => {
        this.cursorX = null
        document.body.classList.remove(this.classActive)
        this.props.persistSizes({ infobar: this.state.width })
    }

    drag = (e: MouseEvent) => {
        if (!this.cursorX) return

        const nextWidth = clamp(
            this.originalWidth + this.cursorX - e.clientX,
            MIN_WIDTH,
            this.maxWidth,
        )

        this.setState({ width: nextWidth })
    }

    render() {
        const style = {
            width: `${this.state.width}px`,
        }

        return (
            <div
                className={classnames(
                    css.component,
                    'infobar infobar-panel d-print-none',
                    {
                        'hidden-panel': !this.props.isOpenedPanel,
                    },
                    this.props.className,
                )}
                ref={(ref) => (this.containerRef = ref)}
                {...(this.props.isOnNewLayout ? {} : { style })}
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

function withSavedSizes<T extends object>(
    Component: ComponentType<T & SavedSizesProps>,
) {
    return (props: T) => {
        const [savedSizes, persistSizes] = useSavedSizes()
        return (
            <Component
                {...props}
                savedSizes={savedSizes}
                persistSizes={persistSizes}
            />
        )
    }
}

export default connector(withSavedSizes(InfobarLayout))
