import _noop from 'lodash/noop'

import { EditorHandledNotHandled } from 'utils/editor'

import type { ImagePluginConfig, PluginMethods } from '../types'
import { insertInlineImages, isImage } from '../utils'

const _handlePastedFiles =
    (config: ImagePluginConfig) =>
    (files: Array<File>, pluginArgs: PluginMethods) => {
        const images = files.filter(isImage)
        if (!images.length) {
            return EditorHandledNotHandled.NotHandled
        }

        if (config.getCanInsertInlineImages()) {
            void insertInlineImages(
                images,
                pluginArgs,
                config.notify,
                config.uploadType,
            )
        } else if (config.getCanDropFiles()) {
            config.getAttachFiles()(images)
        }
        return EditorHandledNotHandled.Handled
    }

const pasteImagePlugin = (
    config: ImagePluginConfig = {
        notify: () => Promise.resolve(),
        getAttachFiles: () => _noop,
        getCanDropFiles: () => false,
        getCanInsertInlineImages: () => false,
    },
) => {
    return {
        handlePastedFiles: _handlePastedFiles(config),
    }
}

export default pasteImagePlugin
