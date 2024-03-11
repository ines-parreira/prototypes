import React from 'react'
import classnames from 'classnames'

import {useGetHTTPEvent} from 'models/integration/queries/http'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import HTTPStatusLabel from 'pages/common/components/HTTPStatusLabel/HTTPStatusLabel'
import Loader from 'pages/common/components/Loader/Loader'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import HTTPParams from './Params'
import HTTPItem from './Item'
import css from './Event.less'

const DEFAULT_ERROR_MESSAGE =
    'There was an error while making this request. This can happen for multiple reasons:\n' +
    '- there is a typo in the request URL\n' +
    "- the server you're trying to reach is not running right now\n" +
    "- the server you're trying to reach is not returning a response fast enough (timeout)\n" +
    '- the DNS records for this URL are not propagated yet\n' +
    '- ...\n\n' +
    "Please double check that the request you're trying to make should work, using tools like cURL or " +
    'Postman for example, and if it is the case please reach out to us at "support@gorgias.com". Details:\n\n'

type Props = {
    integrationId: number
    eventId: number
}

export function Event({integrationId, eventId}: Props) {
    const {
        data: event,
        isLoading,
        isError,
    } = useGetHTTPEvent(
        {integrationId, eventId},
        {select: (data) => data.data, refetchOnWindowFocus: true}
    )

    if (isLoading) {
        return <Loader data-testid="loader" />
    }

    if (isError || !event) {
        return (
            <div className={css.wrapper}>
                <h2 className="mb-4">
                    An error occurred while fetching the event
                </h2>
            </div>
        )
    }

    const request = event.request
    const response = event.response
    let responseError = response.error

    if (!request) {
        return (
            <div className={css.wrapper}>
                <h2 className="mb-4">Error</h2>
                <p>
                    The following error occurred before we could send the
                    request:
                </p>
                <pre>{responseError}</pre>
            </div>
        )
    }

    const requestParams = request.params || null
    let requestJSONParams = null
    let requestFormParams = null
    if (typeof requestParams === 'string') {
        try {
            requestJSONParams = JSON.stringify(
                JSON.parse(requestParams),
                undefined,
                4
            )
        } catch (err) {}
    } else {
        requestFormParams = requestParams
    }

    const requestBody = request.body
    let requestJSONBody = null
    let requestFormBody = null
    if (typeof requestBody === 'string') {
        try {
            requestJSONBody = JSON.stringify(
                JSON.parse(requestBody),
                undefined,
                4
            )
        } catch (err) {}
    } else {
        requestFormBody = requestBody
    }

    let responseBody = response.body
    if (responseBody) {
        try {
            responseBody = JSON.stringify(
                JSON.parse(responseBody),
                undefined,
                4
            )
        } catch (err) {}
    }

    if (responseError && !event.status_code) {
        // Previously, a similar default message (not exactly the same) was stored in database, along with the error
        if (
            !responseError.startsWith(
                'There was an error while making this request.'
            )
        ) {
            responseError = DEFAULT_ERROR_MESSAGE + responseError
        }
    }

    return (
        <div className={classnames(css.wrapper, css.responsiveFlex)}>
            <div className={css.request}>
                <h2 className="mb-4">Request</h2>
                <HTTPItem name="Method" value={request.method} />
                <HTTPItem name="URL" value={request.url} />
                <HTTPItem name="Sent">
                    <DatetimeLabel dateTime={event.created_datetime} />
                </HTTPItem>
                <HTTPItem name="Headers">
                    <HTTPParams params={request.headers} />
                </HTTPItem>
                {requestParams && (
                    <HTTPItem name="Params">
                        {requestFormParams && (
                            <HTTPParams params={requestFormParams} />
                        )}
                        {requestJSONParams && (
                            <>
                                {request.method.toLowerCase() === 'get' && (
                                    <Badge type={ColorType.Warning}>
                                        JSON Params are not compatible with the
                                        GET HTTP Method.
                                    </Badge>
                                )}
                                <pre style={{maxHeight: '200px'}}>
                                    {requestJSONParams}
                                </pre>
                            </>
                        )}
                    </HTTPItem>
                )}
                {requestBody && (
                    <HTTPItem name="Body">
                        {requestFormBody && (
                            <HTTPParams params={requestFormBody} />
                        )}
                        {requestJSONBody && <pre>{requestJSONBody}</pre>}
                    </HTTPItem>
                )}
            </div>
            <div className={css.response}>
                <h2 className="mb-4">Response</h2>
                <HTTPItem name="Status code">
                    <HTTPStatusLabel statusCode={event.status_code} />
                </HTTPItem>
                <HTTPItem name="Headers">
                    <HTTPParams params={response.headers} />
                </HTTPItem>
                <HTTPItem name="Body">
                    {responseBody && <pre>{responseBody}</pre>}
                </HTTPItem>
                {responseError && (
                    <HTTPItem name="Error">
                        <pre>{responseError}</pre>
                    </HTTPItem>
                )}
            </div>
        </div>
    )
}

export default Event
