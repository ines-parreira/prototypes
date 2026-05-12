declare module 'draft-js-single-line-plugin' {
    import { Map } from 'immutable'
    import { Plugin } from 'pages/common/draftjs/plugins/types'

    type Options = {
        stripEntities?: boolean
    }

    function createSingleLinePlugin(options?: Options): Plugin & {
        blockRenderMap: Map<any, any>
    }

    export = createSingleLinePlugin
}
