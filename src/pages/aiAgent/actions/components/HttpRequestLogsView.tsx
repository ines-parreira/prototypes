import { Separator } from 'pages/common/components/Separator/Separator'
import { Components } from 'rest_api/workflows_api/client.generated'

import css from './HttpRequestLogsView.less'

type HttpRequestLogsViewProps = {
    logs: Components.Schemas.HttpRequestEventsResponseDto
}

const HttpRequestLogsView = ({ logs }: HttpRequestLogsViewProps) => {
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
                                {Object.keys(requestHeader).length > 0 && (
                                    <li>
                                        <p>Headers</p>
                                        <ol>
                                            {Object.entries(requestHeader).map(
                                                ([key, value]) => (
                                                    <li key={key}>
                                                        <p>{key}: </p>
                                                        {value}
                                                    </li>
                                                ),
                                            )}
                                        </ol>
                                    </li>
                                )}
                            </ol>
                            <div className={css.body}>
                                <p>Body</p>
                                <pre className={css.codeBlock}>
                                    {log.request_body || ''}
                                </pre>
                            </div>
                        </div>
                        <Separator className={css.separator} />
                        <div className={css.executionLogs}>
                            <p>Response</p>
                            <ol>
                                <li>
                                    <p>Status Code: </p>
                                    {log.response_status_code}
                                </li>
                                {Object.keys(responseHeader).length > 0 && (
                                    <li>
                                        <p>Headers</p>
                                        <ol>
                                            {Object.entries(responseHeader).map(
                                                ([key, value]) => (
                                                    <li key={key}>
                                                        <p>{key}: </p>
                                                        {value}
                                                    </li>
                                                ),
                                            )}
                                        </ol>
                                    </li>
                                )}
                            </ol>
                            <div className={css.body}>
                                <p>Body</p>
                                <pre className={css.codeBlock}>
                                    {log.response_body || ''}
                                </pre>
                            </div>
                        </div>
                    </div>
                )
            })}
        </>
    )
}

export default HttpRequestLogsView
