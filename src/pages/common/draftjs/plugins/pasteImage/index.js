// @flow
import _noop from 'lodash/noop'

import {insertInlineImages, isImage} from '../utils'

import type {PluginMethods, imagePluginConfigType} from '../types'

const _handlePastedFiles = (config) => (files: Array<File>, pluginArgs: PluginMethods) => {
    const images = files.filter(isImage)
    if (!images.length) {
        return 'not-handled'
    }

    if (config.getCanInsertInlineImages()) {
        insertInlineImages(images, pluginArgs, config.notify)
    } else if (config.getCanDropFiles()) {
        config.getAttachFiles()(images)
    }
    return 'handled'
}

const pasteImagePlugin = (config: imagePluginConfigType = {
    notify: _noop,
    getAttachFiles: () => _noop,
    getCanDropFiles: () => false,
    getCanInsertInlineImages: () => false
}) => {
    return {
        handlePastedFiles: _handlePastedFiles(config),
    }
}

export default pasteImagePlugin
