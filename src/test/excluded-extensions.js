/* exclude css imports from mocha tests.
 */

function noop() {
    return null
}

require.extensions['.css'] = noop
require.extensions['.less'] = noop
require.extensions['.mp3'] = noop
