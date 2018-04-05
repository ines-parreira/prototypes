// @flow
import React, {Component} from 'react'
import css from './Loader.less'
type Props = {
    inline: boolean,
    message?: Object | string,
    minHeight?: string
}

export default class Loader extends Component<Props> {
    static defaultProps = {
        inline: false,
        minHeight: '500px'
    }

    render() {
        const {message, inline, minHeight} = this.props

        return (
            <div className={css.container}>
                <div className={css.inner} style={{minHeight}}>
                    <i className="fa fa-fw fa-circle-o-notch fa-spin" />
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
