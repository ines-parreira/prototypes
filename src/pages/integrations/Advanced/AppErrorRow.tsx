import React, {useState} from 'react'
import JSONPretty from 'react-json-pretty'

import {AppErrorLog} from 'models/integration/types/app'
import IconButton from 'pages/common/components/button/IconButton'
import {DatetimeLabel} from 'pages/common/utils/labels'

import css from './AppErrorRow.less'

export default function AppErrorRow(props: AppErrorLog) {
    const hasDetails = props.payload != null
    const [showDetails, setShowDetails] = useState(false)

    return (
        <div className={css.container}>
            <div className={css.info}>
                <div className={css.message}>
                    <b className="mr-2">{props.error}</b>

                    {hasDetails && (
                        <IconButton
                            fillStyle="ghost"
                            intent="secondary"
                            onClick={() => setShowDetails(!showDetails)}
                            title="More details"
                        >
                            {showDetails ? 'expand_less' : 'expand_more'}
                        </IconButton>
                    )}
                </div>
                <DatetimeLabel
                    dateTime={props.created_datetime}
                    className="text-faded"
                />
            </div>
            {showDetails && (
                <div className={css.details}>
                    <b className="mr-2">Payload:</b>
                    <JSONPretty
                        data={props.payload}
                        className="d-inline-flex"
                    />
                </div>
            )}
        </div>
    )
}
