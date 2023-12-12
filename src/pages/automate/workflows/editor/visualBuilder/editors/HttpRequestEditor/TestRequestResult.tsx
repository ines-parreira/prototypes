import React, {useMemo} from 'react'
import _noop from 'lodash/noop'
import _isString from 'lodash/isString'
import {JSONPath} from 'jsonpath-plus'

import {HttpRequestNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Label from 'pages/common/forms/Label/Label'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import TextArea from 'pages/common/forms/TextArea'
import {validateJSON} from 'utils'
import TextInput from 'pages/common/forms/input/TextInput'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import IconButton from 'pages/common/components/button/IconButton'

import css from './TestRequestResult.less'

type Props = {
    isLoading?: boolean
    result: NonNullable<HttpRequestNodeType['data']['testRequestResult']>
    variables: HttpRequestNodeType['data']['variables']
    onRetest: () => void
    onClose: () => void
    onChangeVariable: (
        index: number,
        variable: HttpRequestNodeType['data']['variables'][number]
    ) => void
    onDeleteVariable: (index: number) => void
    onAddVariable: () => void
}

const getBadgeType = (status: number) => {
    if (status >= 200 && status < 300) {
        return ColorType.LightSuccess
    }
    if (status >= 400) {
        return ColorType.LightError
    }
    return ColorType.Grey
}

// [...] HTTP/2 does not support status messages.
//
// c.f. https://developer.mozilla.org/en-US/docs/Web/API/Response/statusText#value
const statusTextByStatus: Record<number, string> = {
    100: 'Continue',
    101: 'Switching Protocols',
    102: 'Processing',
    103: 'Early Hints',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    207: 'Multi-Status',
    208: 'Already Reported',
    226: 'IM Used',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Content Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    418: "I'm a teapot",
    421: 'Misdirected Request',
    422: 'Unprocessable Content',
    423: 'Locked',
    424: 'Failed Dependency',
    425: 'Too Early',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    451: 'Unavailable For Legal Reasons',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates',
    507: 'Insufficient Storage',
    508: 'Loop Detected',
    510: 'Not Extended',
    511: 'Network Authentication Required',
}

const TestRequestResult = ({
    isLoading,
    result,
    variables,
    onRetest,
    onClose,
    onChangeVariable,
    onDeleteVariable,
    onAddVariable,
}: Props) => {
    const json = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result.content && validateJSON(result.content)
            ? JSON.parse(result.content)
            : null
    }, [result.content])
    const prettifiedJSON = useMemo(
        () => (json ? JSON.stringify(json, null, 2) : null),
        [json]
    )

    return (
        <>
            <ModalHeader title="Test results" />
            <ModalBody className={css.body}>
                <div className={css.top}>
                    <div className={css.field}>
                        <Label>Status</Label>
                        <Badge type={getBadgeType(result.status)}>
                            {result.status}{' '}
                            {statusTextByStatus[result.status] ?? ''}
                        </Badge>
                    </div>
                    <Button
                        isLoading={isLoading}
                        onClick={onRetest}
                        fillStyle="ghost"
                    >
                        {isLoading ? (
                            'Retest'
                        ) : (
                            <ButtonIconLabel icon="refresh">
                                Retest
                            </ButtonIconLabel>
                        )}
                    </Button>
                </div>
                <div className={css.field}>
                    <Label>Response</Label>
                    <TextArea
                        onChange={_noop}
                        value={prettifiedJSON ?? result.content}
                        isDisabled
                        autoRowHeight
                        className={css.textarea}
                    />
                </div>
                <div className={css.field}>
                    <div>
                        <Label>Flow variables</Label>
                        <div className={css.description}>
                            Create variables from the request response which can
                            be used in subsequent steps
                        </div>
                    </div>
                    {variables.map((variable, index) => {
                        const value =
                            JSONPath({
                                wrap: false,
                                preventEval: true,
                                path: variable.jsonpath,
                                json,
                            }) ?? ''

                        return (
                            <div key={variable.id} className={css.variable}>
                                <TextInput
                                    value={variable.name}
                                    placeholder="Variable name"
                                    onChange={(name) => {
                                        onChangeVariable(index, {
                                            ...variable,
                                            name,
                                        })
                                    }}
                                />
                                <TextInput
                                    value={variable.jsonpath}
                                    placeholder="JSONPath"
                                    onChange={(jsonpath) => {
                                        onChangeVariable(index, {
                                            ...variable,
                                            jsonpath,
                                        })
                                    }}
                                />
                                <TextInput
                                    value={
                                        _isString(value)
                                            ? value
                                            : JSON.stringify(value)
                                    }
                                    placeholder="Value"
                                    isDisabled
                                />
                                <IconButton
                                    intent="destructive"
                                    fillStyle="ghost"
                                    onClick={() => {
                                        onDeleteVariable(index)
                                    }}
                                >
                                    close
                                </IconButton>
                            </div>
                        )
                    })}
                    {variables.length > 0 && (
                        <div className={css.helper}>
                            <span>Variable name and JSONPath</span>
                            <span>Test result</span>
                        </div>
                    )}
                    <Button
                        intent="secondary"
                        onClick={onAddVariable}
                        className={css.addVariableButton}
                        size="small"
                    >
                        <ButtonIconLabel icon="add">
                            Add Variable
                        </ButtonIconLabel>
                    </Button>
                </div>
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={onClose}>
                    Close
                </Button>
            </ModalActionsFooter>
        </>
    )
}

export default TestRequestResult
