// @flow
import React, {Component} from 'react'
import classnames from 'classnames'

import css from './Loader.less'

type Props = {
    inline: boolean,
    message?: Object | string,
    minHeight?: string,
    className?: string,
}

export default class Loader extends Component<Props> {
    static defaultProps = {
        inline: false,
        minHeight: '500px'
    }

    render() {
        const {message, inline, minHeight, className} = this.props

        return (
            <div className={classnames(css.container, className)}>
                <div
                    className={css.inner}
                    style={{minHeight}}
                >
                    <i className="icon-custom icon-circle-o-notch md-spin" />
                    {
                        !inline && message && (
                            <div className="mt-3">
                                {message}
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }
}
