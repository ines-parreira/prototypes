import React, {ReactNode} from 'react'
import classnames from 'classnames'

import Loader from '../Loader/Loader.js'

import css from './InfiniteScroll.less'

type Props = {
    load: () => Promise<void>
    loadMore: boolean
    threshold: number
    className: string
    children: ReactNode
}

type State = {
    loading: boolean
}

export default class InfiniteScroll extends React.Component<Props, State> {
    static defaultProps = {
        className: '',
        load: () => Promise.resolve(),
        loadMore: true,
        threshold: 50,
    }

    state = {
        loading: false,
    }

    container: Maybe<HTMLElement> = null

    componentDidMount() {
        // load next page if already scrolled
        void this._load(this.container)
    }

    componentDidUpdate(prevProps: Props) {
        // loadMore changed from parent,
        // load next page if already scrolled.
        if (prevProps.loadMore !== this.props.loadMore) {
            void this._load(this.container)
        }
    }

    // overwrite container for testing
    _load = (container: Maybe<HTMLElement>) => {
        if (
            // parent stopped loading
            !this.props.loadMore ||
            // still loading
            this.state.loading ||
            // container not ready
            !container
        ) {
            return
        }

        const containerScroll =
            container.scrollTop + container.clientHeight + this.props.threshold

        // reached the end
        if (containerScroll >= container.scrollHeight) {
            this.setState({loading: true}, () => {
                void this.props.load().then(() => {
                    this.setState({loading: false})
                })
            })
        }
    }

    _scrollContainer = (ref: Maybe<HTMLElement>) => {
        this.container = ref
    }

    render() {
        const {children, className} = this.props

        return (
            <div
                className={classnames(
                    css.component,
                    {
                        [css.loading]: this.state.loading,
                    },
                    className
                )}
                ref={this._scrollContainer}
                onScroll={(e) => this._load(e.target as any)}
            >
                {children}
                <Loader className={css.loader} minHeight="0" />
            </div>
        )
    }
}
