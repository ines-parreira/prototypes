import {ModalManager} from './Manager'
import {HookConfig} from './typings'
import {useModalManager as _useModalManager} from './useModalManager'

export * from './typings'

export const manager = new ModalManager()

export const useModalManager = (
    name?: string,
    config?: HookConfig
): ReturnType<typeof _useModalManager> => {
    return _useModalManager(manager, name, config)
}
