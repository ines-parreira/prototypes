// @flow

import React from 'react'
import {Input} from 'reactstrap'
import classnames from 'classnames'

import css from './PeopleSearchInput.less'

type Props = {
    value: string,
    className?: string,
    autoFocus?: boolean,
    onChange: (value: string) => void,
}

export default function PeopleSearchInput({
    value,
    className,
    autoFocus,
    onChange,
}: Props) {
    return (
        <div className="input-icon input-icon-right">
            <i className={classnames('icon material-icons md-2', css.icon)}>
                search
            </i>
            <Input
                placeholder="Search users or teams..."
                value={value}
                className={className}
                autoFocus={autoFocus}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    )
}
