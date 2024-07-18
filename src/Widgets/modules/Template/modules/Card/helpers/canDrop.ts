import {Template} from 'models/widget/types'

/**
 * Return true if you can drop something at source path to a card in target path
 */

export function canDrop(
    sourcePath = '',
    targetPath: Template['absolutePath'] = []
) {
    return sourcePath === targetPath.join('.')
}
