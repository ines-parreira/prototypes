// This code was borrowed from the package "react-ace-cdn".
// It's a temporary solution to load ACE editor from a CDN
// until we can lazy load it properly.

import {WindowWithACE} from './types'

export const available = () => !!(window as WindowWithACE).ace

const _url = 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/ace.js'
const _onLoad: (() => void)[] = []
let _isLoading = false

export default function load(cb: () => void) {
    if (available()) {
        cb()
        return
    }

    _onLoad.push(cb)

    if (_isLoading) return

    _isLoading = true

    let result = false
    const script = document.createElement('script')
    const container =
        document.getElementsByTagName('head')[0] ||
        document.getElementsByTagName('body')[0]

    script.type = 'text/javascript'
    script.src = _url
    script.async = true

    script.onload = function () {
        if (!result) {
            result = true
            _onLoad.forEach((_cb) => _cb())
        }
    }

    container.appendChild(script)
}
