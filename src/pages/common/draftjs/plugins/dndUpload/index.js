// @flow
import _noop from 'lodash/noop'

import {insertInlineImages, isImage} from '../utils'

import type {SelectionState} from 'draft-js'
import type {pluginArgsType, imagePluginConfigType} from '../types'

const _handleDroppedFiles = (config) => (selection: SelectionState, files: Array<Blob>, pluginArgs: pluginArgsType) => {
    // filter images
    let others = []
    let images = []

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
    insertInlineImages(images, pluginArgs, config.notify)
    // upload other files types
    // only if drag-to-upload is enabled
    if (config.getCanDropFiles()) {
        config.getAttachFiles()(others)
    }
    return 'handled'
}

const dndUploadPlugin = (config: imagePluginConfigType = {
    notify: _noop,
    getAttachFiles: () => _noop,
    getCanDropFiles: _noop,
    getCanInsertInlineImages: _noop,
}) => {
    return {
        handleDroppedFiles: _handleDroppedFiles(config),
    }
}

export default dndUploadPlugin
