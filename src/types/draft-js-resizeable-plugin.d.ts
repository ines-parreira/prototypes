declare module 'draft-js-resizeable-plugin' {
    import {Plugin} from 'pages/common/draftjs/plugins/types'

    type Options = {
        horizontal?: 'absolute'
    }

    function createResizeablePlugin(options?: Options): Plugin

    export = createResizeablePlugin
}
