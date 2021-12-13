declare module 'draft-js-block-breakout-plugin' {
    import {Plugin} from 'pages/common/draftjs/plugins/types'
    function createBlockBreakoutPlugin(): Plugin

    export = createBlockBreakoutPlugin
}
