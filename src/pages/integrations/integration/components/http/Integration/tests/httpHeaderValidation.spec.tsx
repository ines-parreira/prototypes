import {validateHeaderName} from '../httpHeaderValidation'

describe('httpHeaderValidation', () => {
    const standard = [
        'A-IM',
        'Accept',
        'Accept-Charset',
        'Accept-Datetime',
        'Accept-Encoding',
        'Accept-Language',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
        'Authorization',
        'Cache-Control',
        'Connection',
        'Content-Encoding',
        'Content-Length',
        'Content-MD5',
        'Content-Type',
        'Cookie',
        'Date',
        'Expect',
        'Forwarded',
        'From',
        'Host',
        'HTTP2-Settings',
        'If-Match',
        'If-Modified-Since',
        'If-None-Match',
        'If-Range',
        'If-Unmodified-Since',
        'Max-Forwards',
        'Origin',
        'Pragma',
        'Proxy-Authorization',
        'Range',
        'Referer',
        'TE',
        'Trailer',
        'Transfer-Encoding',
        'User-Agent',
        'Upgrade',
        'Via',
        'Warning',
    ]

    const nonStandard = [
        'Upgrade-Insecure-Requests',
        'X-Requested-With',
        'DNT',
        'X-Forwarded-For',
        'X-Forwarded-Host',
        'X-Forwarded-Proto',
        'Front-End-Https',
        'X-Http-Method-Override',
        'X-ATT-DeviceId',
        'X-Wap-Profile',
        'Proxy-Connection',
        'X-UIDH',
        'X-Csrf-Token',
        'X-Request-ID',
        'X-Correlation-ID',
        'Save-Data',
        '__+++++__',
        'non*standard',
    ]

    const invalid = [
        'alfa:beta',
        'theta(nps',
        'Invalid:colon',
        'Invalid space',
        '∅',
    ]

    describe('validates HTTP header names', () => {
        it.each(standard)(
            'should return true for standard header names',
            (headerName) => {
                expect(validateHeaderName(headerName)).toBe(true)
            }
        )

        it.each(nonStandard)(
            'should return true for non-standard header names',
            (headerName) => {
                expect(validateHeaderName(headerName)).toBe(true)
            }
        )

        it.each(invalid)(
            'should return false for invalid header names',
            (headerName) => {
                expect(validateHeaderName(headerName)).toBe(false)
            }
        )
    })
})
