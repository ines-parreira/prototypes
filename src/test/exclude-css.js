/* exclude css imports from mocha tests.
 */

function noop() {
    return null
}

require.extensions['.css'] = noop
