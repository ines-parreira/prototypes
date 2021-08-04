export enum Event {
    afterOpen = 'afterOpen',
    beforeOpen = 'beforeOpen',
    afterClose = 'afterClose',
    beforeClose = 'beforeClose',
}

export interface ModalParams {
    [key: string]: any
}

export interface Modal {
    name: string
    defaultParams: ModalParams
}

export interface OpenModal {
    name: string
    params: ModalParams
}

export interface ModalInstanceInterface {
    modals: ModalsList
    open: OpenModalsList
    subscribers: Subscribers
    callbacks: Callbacks

    // Methods
    addModal: (name: string, defaultParams: ModalParams) => void
    removeModal: (name: string) => void

    getModal: (name: string) => Modal | null
    getParams: (name: string) => ModalParams | null

    openModal: (
        name: string,
        closeOthers: boolean,
        params?: ModalParams
    ) => void
    closeModal: (name: string) => void
    isOpen: (name: string) => boolean

    addSubscriber: (name: string, subscriber: () => void) => void
    removeSubscriber: (name: string, subscriber: () => void) => void
    on: (event: Event, cb: CallbackFunction) => void
}

export type ModalsList = Modal[]

export type OpenModalsList = OpenModal[]

export type CallbackFunction = (
    name: string,
    params: ModalParams | null
) => unknown

export type Callbacks = {
    [key in Event]: CallbackFunction[]
}

export type Subscribers = {
    [key: string]: (() => void)[]
}

export type useModalManagerApi = {
    openModal: (
        name?: string,
        closeOthers?: boolean,
        params?: ModalParams
    ) => void
    closeModal: (name?: string) => void
    isOpen: (name?: string) => boolean
    getParams: (name?: string) => ModalParams | null
    on: (name: string, event: Event, cb: CallbackFunction) => void
}

export type HookConfig = {
    // ? Flag for automatically destroying the Manager instance once
    // ? the component using useModalManager() is unmounted
    autoDestroy: boolean
}
