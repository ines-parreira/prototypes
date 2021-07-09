import {
    ModalsList,
    Modal,
    ModalParams,
    OpenModalsList,
    Event,
    Callbacks,
    Subscribers,
    CallbackFunction,
    OpenModal,
    ModalInstanceInterface,
} from './typings'

export class ModalManager implements ModalInstanceInterface {
    modals: ModalsList = []
    open: OpenModalsList = []
    subscribers: Subscribers = {}
    callbacks: Callbacks = {
        [Event.afterOpen]: [],
        [Event.beforeOpen]: [],
        [Event.afterClose]: [],
        [Event.beforeClose]: [],
    }

    /**
     * @description
     *    Register new modal
     *
     * @param name String
     * @param defaultParams ModalParams
     */
    addModal(name: string, defaultParams: ModalParams = {}): void {
        const modal = this.getModal(name)
        if (modal) return
        this.modals.push({
            name,
            defaultParams,
        })
        this.subscribers[name] = []
    }

    /**
     * @description
     *    Remove modal with specific name
     *
     * @param name String
     */
    removeModal(name: string): void {
        this.modals = this.modals.filter((m) => m.name !== name)
        this.open = this.open.filter((m) => m.name !== name)
        delete this.subscribers[name]
    }

    /**
     * @description
     *    Get registered modal
     *
     * @param name String
     * @returns Modal
     */
    getModal(name: string): Modal | null {
        return this.modals.find((m) => m.name === name) || null
    }

    /**
     * Get parameters of opened modal, if modal is closed result will be 'null'
     * @param name name of modal
     * @returns {Object|Null}
     */
    getParams(name: string): ModalParams | null {
        const modal = this.open.find((m) => m.name === name) as OpenModal
        return modal?.params || null
    }

    /**
     * @description
     *    Open modal with specific name and close another
     *  modals if <closeOther> is true.
     *
     * @param name String
     * @param closeOther Boolean
     * @param params ModalParams
     */
    openModal(name: string, closeOther = true, params?: ModalParams): void {
        const modal = this.getModal(name)

        if (!modal) {
            throw new Error(`manager do not have modal with name '${name}'`)
        }

        this.callbacks.beforeOpen.forEach((cb) =>
            cb(name, this.getParams(name))
        )

        if (closeOther) {
            for (const openModal of this.open) {
                this.closeModal(openModal.name)
            }
        }

        this.open.push({
            name: modal.name,
            params: params || modal.defaultParams,
        })
        this.callSubscribers(name)

        this.callbacks.afterOpen.forEach((cb) => cb(name, this.getParams(name)))
    }

    /**
     * @description
     *    Close the modal with specific name
     *
     * @param name String
     */
    closeModal(name: string): void {
        const modal = this.getModal(name)

        if (!modal) {
            throw new Error(`manager do not have modal with name '${name}'`)
        }

        this.callbacks.beforeClose.forEach((cb) =>
            cb(name, this.getParams(name))
        )

        this.open = this.open.filter((m) => m.name !== name)
        this.callSubscribers(name)

        this.callbacks.afterClose.forEach((cb) =>
            cb(name, this.getParams(name))
        )
    }

    /**
     * @description
     *    Define modal with name <name> is opened
     *
     * @param name String
     * @returns Boolean
     */
    isOpen(name: string): boolean {
        const openModal = this.open.find((m) => m.name === name) as OpenModal
        return !!openModal
    }

    /**
     * @description
     *    Register function for modal, that will call on change of this modal
     *
     * @param name String
     * @param subscriber Function
     */
    addSubscriber(name: string, subscriber: () => unknown): void {
        if (this.subscribers[name]) {
            this.subscribers[name].push(subscriber)
        } else {
            throw new Error(`manager do not have modal with name '${name}'`)
        }
    }

    /**
     * @description
     *    Remove subscriber for specific modal
     *
     * @param name String
     * @param subscriber Function
     */
    removeSubscriber(name: string, subscriber: () => unknown): void {
        if (this.subscribers[name]) {
            this.subscribers[name] = this.subscribers[name].filter(
                (s) => s !== subscriber
            )
        }
    }

    /**
     * @description
     *    Register new callback for event
     *
     * @param event Event
     * @param cb CallbackFunction
     */
    on(event: Event, cb: CallbackFunction): void {
        if (!Object.values(Event).includes(event)) {
            throw new Error(`Unknown event '${event}'`)
        }
        this.callbacks[event].push(cb)
    }

    /**
     * @description
     *    Call all registered subscribers for specific modal
     *
     * @param name String
     */
    private callSubscribers(name: string): void {
        if (!Object.keys(this.subscribers).includes(name)) {
            throw new Error(`Subscribers for '${name}' not defined`)
        }
        for (const subscriber of this.subscribers[name]) {
            subscriber()
        }
    }
}
