declare module 'draft-js-single-line-plugin' {
    import { Plugin } from 'pages/common/draftjs/plugins/types'
    import { Map } from 'immutable'

    type Options = {
        stripEntities?: boolean
    }

    function createSingleLinePlugin(options?: Options): Plugin & {
        blockRenderMap: Map<any, any>
    }

    export = createSingleLinePlugin
}
