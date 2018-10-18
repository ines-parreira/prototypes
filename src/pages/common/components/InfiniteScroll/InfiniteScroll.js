// @flow
import React from 'react'
import classnames from 'classnames'

import Loader from '../Loader'
import css from './InfiniteScroll.less'

import type {Node} from 'react'

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

type scrollEventType = {
    target: {
        scrollTop: number,
        scrollHeight: number,
        clientHeight: number,
    }
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

    _onScroll = (e: scrollEventType) => {
        if (!this.props.loadMore || this.state.loading) {
            return
        }

        const container = e.target
        // reached the end
        if (container.scrollTop + container.clientHeight + this.props.threshold >= container.scrollHeight) {
            this._load()
        }
    }

    _load = () => {
        this.setState({loading: true}, () => {
            this.props.load().then(() => {
                this.setState({loading: false})
            })
        })
    }

    render() {
        const {children, className} = this.props

        return (
            <div
                className={classnames(css.component, {
                    [css.loading]: this.state.loading
                }, className)}
                onScroll={this._onScroll}
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

