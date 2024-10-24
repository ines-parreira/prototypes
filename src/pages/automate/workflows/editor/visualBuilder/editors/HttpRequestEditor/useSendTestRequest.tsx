import {useCallback, useState} from 'react'

import {HttpRequestNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

const renderWithVariables = (
    string: string,
    variables: Record<string, string>
) => {
    let result = string

    for (const path in variables) {
        result = result.replace(
            new RegExp(`{{${path.replace(/\./g, '\\.')}[^{}]*}}`, 'g'),
            variables[path]
        )
    }

    return result
}

const corsProxyBaseUrl = 'https://cors-proxy.gorgias.workers.dev'
const corsProxyKey = '8e6f1be6-hvcl-6975-iuhu-f45d4c8e8b86'

const useSendTestRequest = (
    config: Pick<
        HttpRequestNodeType['data'],
        | 'url'
        | 'method'
        | 'headers'
        | 'json'
        | 'formUrlencoded'
        | 'bodyContentType'
    >,
    onResponse: (
        result: NonNullable<HttpRequestNodeType['data']['testRequestResult']>
    ) => void
) => {
    const [isLoading, setIsLoading] = useState(false)

    const sendTestRequest = useCallback(
        async (variables: Record<string, string> = {}) => {
            setIsLoading(true)

            try {
                let body: string | undefined

                switch (config.bodyContentType) {
                    case 'application/json':
                        body = renderWithVariables(config.json ?? '', variables)

                        break
                    case 'application/x-www-form-urlencoded': {
                        const entries = config.formUrlencoded?.map((entry) => [
                            entry.key,
                            renderWithVariables(entry.value, variables),
                        ])

                        body = new URLSearchParams(entries).toString()
                        break
                    }
                }

                const headers = config.headers.reduce<Record<string, string>>(
                    (acc, header) => {
                        acc[header.name.toLowerCase()] = renderWithVariables(
                            header.value,
                            variables
                        )
                        return acc
                    },
                    {}
                )

                if (config.bodyContentType) {
                    headers['content-type'] = config.bodyContentType
                }

                headers['x-gorgias-cors-proxy-key'] = corsProxyKey

                const res = await fetch(
                    `${corsProxyBaseUrl}/${renderWithVariables(
                        config.url,
                        variables
                    )}`,
                    {
                        method: config.method,
                        headers,
                        body,
                    }
                )

                onResponse({
                    status: res.status,
                    content: res.body ? await res.text() : undefined,
                })
            } catch {
                onResponse({status: 500})
            } finally {
                setIsLoading(false)
            }
        },
        [config, onResponse]
    )

    return {isLoading, sendTestRequest}
}

export default useSendTestRequest
