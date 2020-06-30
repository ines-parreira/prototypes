// @flow

import React from 'react'

import css from './Ellipsis.less'

type Props = {
    title: string,
    onClick: Function,
}

/**
 * An ellipsis button component to hide the signatures or email replies
 */
export default class Ellipsis extends React.Component<Props> {
    render() {
        const {title, onClick} = this.props
        return (
            <div className={css['btn-more']} title={title} onClick={onClick}>
                &hellip;
            </div>
        )
    }
}
