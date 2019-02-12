// @flow
import React from 'react'
import classnames from 'classnames'

import type {Node} from 'react'

import Loader from '../Loader'

import css from './InfiniteScroll.less'


type Props = {
    load: () => Promise<*>,
    loadMore: boolean,
    threshold: number,
    className: string,
    children: Node,
}

type State = {
    loading: boolean,
}

export default class InfiniteScroll extends React.Component<Props, State> {
    static defaultProps = {
        className: '',
        load: () => Promise.resolve(),
        loadMore: true,
        threshold: 50,
    }

    state = {
        loading: false
    }

    container = null

    componentDidMount() {
        // load next page if already scrolled
        this._load(this.container)
    }

    componentDidUpdate(prevProps: Props) {
        // loadMore changed from parent,
        // load next page if already scrolled.
        if (prevProps.loadMore !== this.props.loadMore) {
            this._load(this.container)
        }
    }

    // overwrite container for testing
    _load = (container: ?HTMLElement) => {
        if (
            // parent stopped loading
            !this.props.loadMore
            // still loading
            || this.state.loading
            // container not ready
            || !container
        ) {
            return
        }

        const containerScroll = container.scrollTop
            + container.clientHeight
            + this.props.threshold

        // reached the end
        if (containerScroll >= container.scrollHeight) {
            this.setState({loading: true}, () => {
                this.props.load().then(() => {
                    this.setState({loading: false})
                })
            })
        }
    }

    _scrollContainer = (ref: ?HTMLElement) => {
        this.container = ref
    }

    render() {
        const {children, className} = this.props

        return (
            <div
                className={classnames(css.component, {
                    [css.loading]: this.state.loading
                }, className)}
                ref={this._scrollContainer}
                onScroll={(e: {target: HTMLElement}) => this._load(e.target)}
            >
                {children}
                <Loader
                    className={css.loader}
                    minHeight="0"
                />
            </div>
        )
    }
}

