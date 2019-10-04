// @flow
import React, {Component} from 'react'
import classnames from 'classnames'

import css from './Loader.less'

type Props = {
    inline: boolean,
    message?: Object | string,
    minHeight?: string,
    size?: string,
    className?: string,
}

export default class Loader extends Component<Props> {
    static defaultProps = {
        inline: false,
        minHeight: '500px',
        size: '40px'
    }

    render() {
        const {message, inline, minHeight, className, size} = this.props

        return (
            <div className={classnames(css.container, className)}>
                <div
                    className={css.inner}
                    style={{minHeight, fontSize: size}}
                >
                    <i className="icon-custom icon-circle-o-notch md-spin"/>
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
