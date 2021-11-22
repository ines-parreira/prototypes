import _noop from 'lodash/noop'
import {SelectionState} from 'draft-js'

import {insertInlineImages, isImage} from '../utils'
import {PluginMethods, ImagePluginConfig} from '../types'

const _handleDroppedFiles =
    (config: ImagePluginConfig) =>
    (
        selection: SelectionState,
        files: Array<File>,
        pluginArgs: PluginMethods
    ) => {
        // filter images
        let others: File[] = []
        let images: File[] = []

        if (config.getCanInsertInlineImages()) {
            images = files.filter((f) => {
                if (isImage(f)) {
                    return true
                }

                others.push(f)
                return false
            })
        } else {
            others = files
        }

        // add images inline
        void insertInlineImages(images, pluginArgs, config.notify)
        // upload other files types
        // only if drag-to-upload is enabled
        if (config.getCanDropFiles()) {
            config.getAttachFiles()(others)
        }
        return 'handled'
    }

const dndUploadPlugin = (
    config: ImagePluginConfig = {
        notify: _noop as any,
        getAttachFiles: () => _noop,
        getCanDropFiles: () => false,
        getCanInsertInlineImages: () => false,
    }
) => {
    return {
        handleDroppedFiles: _handleDroppedFiles(config),
    }
}

export default dndUploadPlugin
