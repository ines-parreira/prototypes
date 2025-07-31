import { Separator } from 'pages/common/components/Separator/Separator'
import { Components } from 'rest_api/workflows_api/client.generated'

import css from './HttpRequestLogsView.less'

type HttpRequestLogsViewProps = {
    logs: Components.Schemas.HttpRequestEventsResponseDto
    stepOutputs?: Record<string, any> | null
}

const HttpRequestLogsView = ({
    logs,
    stepOutputs,
}: HttpRequestLogsViewProps) => {
    const renderHeaders = (headers: Record<string, string>, key: string) => {
        return (
            <li key={key}>
                <p>Headers</p>
                <ol>
                    {Object.keys(headers).length > 0 &&
                        Object.entries(headers).map(([key, value]) => (
                            <li key={key}>
                                <p>{key}: </p>
                                {typeof value === 'object'
                                    ? JSON.stringify(value)
                                    : value}
                            </li>
                        ))}
                </ol>
            </li>
        )
    }

    const renderBody = (body: string, key: string) => {
        return (
            <div className={css.body} key={key}>
                <p>Body</p>
                <pre className={css.codeBlock}>{body}</pre>
            </div>
        )
    }
    return (
        <>
            {logs.map((log) => {
                const responseHeader = JSON.parse(
                    log.response_headers ?? '{}',
                ) as Record<string, string>
                const requestHeader = JSON.parse(
                    log.request_headers ?? '{}',
                ) as Record<string, string>
                return (
                    <div key={log.id} className={css.httpRequestContainer}>
                        <div className={css.executionLogs}>
                            <p>Request</p>
                            <ol>
                                <li>
                                    <p>Method: </p>
                                    {log.request_method}
                                </li>
                                <li>
                                    <p>URL: </p>
                                    {log.request_url}
                                </li>
                                {renderHeaders(requestHeader, 'request')}
                            </ol>
                            {renderBody(log.request_body || '', 'requestBody')}
                        </div>
                        <Separator className={css.separator} />
                        <div className={css.executionLogs}>
                            <p>Response</p>
                            <ol>
                                <li>
                                    <p>Status Code: </p>
                                    {log.response_status_code}
                                </li>
                                {renderHeaders(responseHeader, 'response')}
                            </ol>
                            {renderBody(
                                log.response_body || '',
                                'responseBody',
                            )}
                        </div>
                        {stepOutputs && (
                            <>
                                <Separator className={css.separator} />
                                <div className={css.executionLogs}>
                                    <p>Output Variables</p>
                                    <pre className={css.codeBlock}>
                                        {JSON.stringify(
                                            stepOutputs
                                                ? stepOutputs
                                                : undefined,
                                            null,
                                            2,
                                        )}
                                    </pre>
                                </div>
                            </>
                        )}
                    </div>
                )
            })}
        </>
    )
}

export default HttpRequestLogsView
