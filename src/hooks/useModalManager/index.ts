import {ModalManager} from './Manager'
import {useModalManager as _useModalManager} from './useModalManager'

export * from './typings'

export const manager = new ModalManager()

export const useModalManager = (
    name?: string
): ReturnType<typeof _useModalManager> => {
    return _useModalManager(manager, name)
}
