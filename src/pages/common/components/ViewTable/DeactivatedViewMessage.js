// @flow

import React from 'react'

import icon from '../../../../../img/icons/invalid-filters.svg'

import css from './DeactivatedViewMessage.less'

export default function DeactivatedViewMessage() {
    return (
        <div className="d-flex h-100">
            <div className="m-auto text-center">
                <img
                    src={icon}
                    alt="Invalid filters"
                />
                <p className={css.title}>
                    Invalid filters
                </p>
                <p className={css.text}>
                    This view is deactivated because at least one of its filters is invalid.<br/>
                    Please review its filters, and either fix them or delete the view.
                </p>
            </div>
        </div>
    )
}
