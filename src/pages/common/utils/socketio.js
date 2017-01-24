import socketio from 'socket.io-client'

const socket = socketio.connect(window.WS_URL)

// This class is a singleton
let instance = null

export default class SocketIO {
    constructor(actions) {
        if (instance) {
            return this
        }

        this.actions = actions

        const pollingConfiguration = window.DISABLE_ACTIVITY_POLLING || 'False'
        if (pollingConfiguration === 'False') {
            socket.on('connect', this._onConnect)
            socket.on('message', this._onMessage)
            socket.on('json', this._onJSON)
            socket.on('disconnect', this._onDisconnect)
            socket.on('error', this._onError)
        }
        instance = this
        return instance
    }

    _onConnect = () => {
        console.log('connected to ws')
    }

    _onDisconnect = () => {
        console.log('disconnected', arguments)
    }

    _onError = () => {
        console.log('error', arguments)
    }

    _onMessage = (event) => {
        console.log('event', event)
    }

    _onJSON = (json) => {
        const {event} = json

        if (!(event && event.type)) {
            return
        }

        switch (event.type) {
            case 'ticket-viewed': {
                this.actions.ticketViewed(json)
                break
            }
            case 'ticket-updated': {
                break
            }
            case 'ticket-deleted': {
                break
            }
            case 'ticket-message-created': {
                break
            }
            default:
                return
        }
    }

    disconnect() {
        socket.disconnect()
    }

    send(args, ack) {
        socket.send(args, ack)
    }
}
