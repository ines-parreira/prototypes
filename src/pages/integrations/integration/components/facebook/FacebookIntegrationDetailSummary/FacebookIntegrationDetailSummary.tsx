import React from 'react'
import {truncate} from 'lodash'
import classNames from 'classnames'
import FacebookIntegrationLoginButton from '../FacebookLoginButton/FacebookIntegrationLoginButton'

import css from './FacebookIntegrationDetailSummary.less'

type Props = {
    icon?: string
    name: string
    description: Maybe<string>
}

export default function FacebookIntegrationDetailSummary(props: Props) {
    const {icon, name, description} = props

    return (
        <div className="d-flex align-items-center mb-3">
            <img
                alt="facebook logo"
                className="image rounded mr-3"
                width="30"
                src={icon}
            />
            <div className="text-truncate text-faded flex-grow-1 mr-2">
                <div className="d-flex flex-column justify-content-around">
                    <div className="d-flex align-items-center flex-wrap">
                        <h2
                            className={classNames(
                                css.title,
                                'd-inline',
                                'mb-0',
                                'pr-3',
                                'text-info',
                                'text-truncate'
                            )}
                        >
                            {truncate(name, {
                                length: 25,
                            })}
                        </h2>
                    </div>
                    {description && (
                        <span className="text-truncate">
                            {truncate(description, {
                                length: 100,
                            })}
                        </span>
                    )}
                </div>
            </div>
            <FacebookIntegrationLoginButton reconnect intent="secondary" />
        </div>
    )
}
