declare module 'socket.io-client' {
    interface Emitter<Event = string> {
        on(event: Event, listener: Function): Emitter
        once(event: Event, listener: Function): Emitter
        off(event?: Event, listener?: Function): Emitter
        emit(event: Event, ...args: any[]): Emitter
        listeners(event: Event): Function[]
        hasListeners(event: Event): boolean
    }

    const Emitter: {
        (obj?: object): Emitter
        new (obj?: object): Emitter
    }

    export const protocol: number
    export enum PacketType {
        CONNECT = 0,
        DISCONNECT = 1,
        EVENT = 2,
        ACK = 3,
        CONNECT_ERROR = 4,
        BINARY_EVENT = 5,
        BINARY_ACK = 6,
    }
    export interface Packet {
        type: PacketType
        nsp: string
        data?: any
        id?: number
        attachments?: number
    }

    interface EngineOptions {
        /**
         * The host that we're connecting to. Set from the URI passed when connecting
         */
        host: string
        /**
         * The hostname for our connection. Set from the URI passed when connecting
         */
        hostname: string
        /**
         * If this is a secure connection. Set from the URI passed when connecting
         */
        secure: boolean
        /**
         * The port for our connection. Set from the URI passed when connecting
         */
        port: string
        /**
         * Any query parameters in our uri. Set from the URI passed when connecting
         */
        query: {
            [key: string]: string
        }
        /**
         * `http.Agent` to use, defaults to `false` (NodeJS only)
         */
        agent: string | boolean
        /**
         * Whether the client should try to upgrade the transport from
         * long-polling to something better.
         * @default true
         */
        upgrade: boolean
        /**
         * Forces JSONP for polling transport.
         */
        forceJSONP: boolean
        /**
         * Determines whether to use JSONP when necessary for polling. If
         * disabled (by settings to false) an error will be emitted (saying
         * "No transports available") if no other transports are available.
         * If another transport is available for opening a connection (e.g.
         * WebSocket) that transport will be used instead.
         * @default true
         */
        jsonp: boolean
        /**
         * Forces base 64 encoding for polling transport even when XHR2
         * responseType is available and WebSocket even if the used standard
         * supports binary.
         */
        forceBase64: boolean
        /**
         * Enables XDomainRequest for IE8 to avoid loading bar flashing with
         * click sound. default to `false` because XDomainRequest has a flaw
         * of not sending cookie.
         * @default false
         */
        enablesXDR: boolean
        /**
         * The param name to use as our timestamp key
         * @default 't'
         */
        timestampParam: string
        /**
         * Whether to add the timestamp with each transport request. Note: this
         * is ignored if the browser is IE or Android, in which case requests
         * are always stamped
         * @default false
         */
        timestampRequests: boolean
        /**
         * A list of transports to try (in order). Engine.io always attempts to
         * connect directly with the first one, provided the feature detection test
         * for it passes.
         * @default ['polling','websocket']
         */
        transports: string[]
        /**
         * The port the policy server listens on
         * @default 843
         */
        policyPost: number
        /**
         * If true and if the previous websocket connection to the server succeeded,
         * the connection attempt will bypass the normal upgrade process and will
         * initially try websocket. A connection attempt following a transport error
         * will use the normal upgrade process. It is recommended you turn this on
         * only when using SSL/TLS connections, or if you know that your network does
         * not block websockets.
         * @default false
         */
        rememberUpgrade: boolean
        /**
         * Are we only interested in transports that support binary?
         */
        onlyBinaryUpgrades: boolean
        /**
         * Transport options for Node.js client (headers etc)
         */
        transportOptions: Object
        /**
         * (SSL) Certificate, Private key and CA certificates to use for SSL.
         * Can be used in Node.js client environment to manually specify
         * certificate information.
         */
        pfx: string
        /**
         * (SSL) Private key to use for SSL. Can be used in Node.js client
         * environment to manually specify certificate information.
         */
        key: string
        /**
         * (SSL) A string or passphrase for the private key or pfx. Can be
         * used in Node.js client environment to manually specify certificate
         * information.
         */
        passphrase: string
        /**
         * (SSL) Public x509 certificate to use. Can be used in Node.js client
         * environment to manually specify certificate information.
         */
        cert: string
        /**
         * (SSL) An authority certificate or array of authority certificates to
         * check the remote host against.. Can be used in Node.js client
         * environment to manually specify certificate information.
         */
        ca: string | string[]
        /**
         * (SSL) A string describing the ciphers to use or exclude. Consult the
         * [cipher format list]
         * (http://www.openssl.org/docs/apps/ciphers.html#CIPHER_LIST_FORMAT) for
         * details on the format.. Can be used in Node.js client environment to
         * manually specify certificate information.
         */
        ciphers: string
        /**
         * (SSL) If true, the server certificate is verified against the list of
         * supplied CAs. An 'error' event is emitted if verification fails.
         * Verification happens at the connection level, before the HTTP request
         * is sent. Can be used in Node.js client environment to manually specify
         * certificate information.
         */
        rejectUnauthorized: boolean
        /**
         * Headers that will be passed for each request to the server (via xhr-polling and via websockets).
         * These values then can be used during handshake or for special proxies.
         */
        extraHeaders?: {
            [header: string]: string
        }
        /**
         * Whether to include credentials (cookies, authorization headers, TLS
         * client certificates, etc.) with cross-origin XHR polling requests
         * @default false
         */
        withCredentials: boolean
    }

    export interface ManagerOptions extends EngineOptions {
        /**
         * Should we force a new Manager for this connection?
         * @default false
         */
        forceNew: boolean
        /**
         * Should we multiplex our connection (reuse existing Manager) ?
         * @default true
         */
        multiplex: boolean
        /**
         * The path to get our client file from, in the case of the server
         * serving it
         * @default '/socket.io'
         */
        path: string
        /**
         * Should we allow reconnections?
         * @default true
         */
        reconnection: boolean
        /**
         * How many reconnection attempts should we try?
         * @default Infinity
         */
        reconnectionAttempts: number
        /**
         * The time delay in milliseconds between reconnection attempts
         * @default 1000
         */
        reconnectionDelay: number
        /**
         * The max time delay in milliseconds between reconnection attempts
         * @default 5000
         */
        reconnectionDelayMax: number
        /**
         * Used in the exponential backoff jitter when reconnecting
         * @default 0.5
         */
        randomizationFactor: number
        /**
         * The timeout in milliseconds for our connection attempt
         * @default 20000
         */
        timeout: number
        /**
         * Should we automatically connect?
         * @default true
         */
        autoConnect: boolean
        /**
         * the parser to use. Defaults to an instance of the Parser that ships with socket.io.
         */
        parser: any
    }

    export class Manager extends Emitter {
        /**
         * The Engine.IO client instance
         *
         * @public
         */
        engine: any
        /**
         * @private
         */
        _autoConnect: boolean
        /**
         * @private
         */
        _readyState: 'opening' | 'open' | 'closed'
        /**
         * @private
         */
        _reconnecting: boolean
        private readonly uri
        opts: Partial<ManagerOptions>
        private nsps
        private subs
        private backoff
        private _reconnection
        private _reconnectionAttempts
        private _reconnectionDelay
        private _randomizationFactor
        private _reconnectionDelayMax
        private _timeout
        private encoder
        private decoder
        private skipReconnect
        /**
         * `Manager` constructor.
         *
         * @param uri - engine instance or engine uri/opts
         * @param opts - options
         * @public
         */
        constructor(opts: Partial<ManagerOptions>)
        constructor(uri?: string, opts?: Partial<ManagerOptions>)
        constructor(
            uri?: string | Partial<ManagerOptions>,
            opts?: Partial<ManagerOptions>
        )
        /**
         * Sets the `reconnection` config.
         *
         * @param {Boolean} v - true/false if it should automatically reconnect
         * @return {Manager} self or value
         * @public
         */
        reconnection(v: boolean): this
        reconnection(): boolean
        reconnection(v?: boolean): this | boolean
        /**
         * Sets the reconnection attempts config.
         *
         * @param {Number} v - max reconnection attempts before giving up
         * @return {Manager} self or value
         * @public
         */
        reconnectionAttempts(v: number): this
        reconnectionAttempts(): number
        reconnectionAttempts(v?: number): this | number
        /**
         * Sets the delay between reconnections.
         *
         * @param {Number} v - delay
         * @return {Manager} self or value
         * @public
         */
        reconnectionDelay(v: number): this
        reconnectionDelay(): number
        reconnectionDelay(v?: number): this | number
        /**
         * Sets the randomization factor
         *
         * @param v - the randomization factor
         * @return self or value
         * @public
         */
        randomizationFactor(v: number): this
        randomizationFactor(): number
        randomizationFactor(v?: number): this | number
        /**
         * Sets the maximum delay between reconnections.
         *
         * @param v - delay
         * @return self or value
         * @public
         */
        reconnectionDelayMax(v: number): this
        reconnectionDelayMax(): number
        reconnectionDelayMax(v?: number): this | number
        /**
         * Sets the connection timeout. `false` to disable
         *
         * @param v - connection timeout
         * @return self or value
         * @public
         */
        timeout(v: number | boolean): this
        timeout(): number | boolean
        timeout(v?: number | boolean): this | number | boolean
        /**
         * Starts trying to reconnect if reconnection is enabled and we have not
         * started reconnecting yet
         *
         * @private
         */
        private maybeReconnectOnOpen
        /**
         * Sets the current transport `socket`.
         *
         * @param {Function} fn - optional, callback
         * @return self
         * @public
         */
        open(fn?: (err?: Error) => void): this
        /**
         * Alias for open()
         *
         * @return self
         * @public
         */
        connect(fn?: (err?: Error) => void): this
        /**
         * Called upon transport open.
         *
         * @private
         */
        private onopen
        /**
         * Called upon a ping.
         *
         * @private
         */
        private onping
        /**
         * Called with data.
         *
         * @private
         */
        private ondata
        /**
         * Called when parser fully decodes a packet.
         *
         * @private
         */
        private ondecoded
        /**
         * Called upon socket error.
         *
         * @private
         */
        private onerror
        /**
         * Creates a new socket for the given `nsp`.
         *
         * @return {Socket}
         * @public
         */
        socket(nsp: string, opts?: Partial<SocketOptions>): Socket
        /**
         * Called upon a socket close.
         *
         * @param socket
         * @private
         */
        _destroy(socket: Socket): void
        /**
         * Writes a packet.
         *
         * @param packet
         * @private
         */
        _packet(
            packet: Partial<
                Packet & {
                    query: string
                    options: any
                }
            >
        ): void
        /**
         * Clean up transport subscriptions and packet buffer.
         *
         * @private
         */
        private cleanup
        /**
         * Close the current socket.
         *
         * @private
         */
        _close(): void
        /**
         * Alias for close()
         *
         * @private
         */
        private disconnect
        /**
         * Called upon engine close.
         *
         * @private
         */
        private onclose
        /**
         * Attempt a reconnection.
         *
         * @private
         */
        private reconnect
        /**
         * Called upon successful reconnect.
         *
         * @private
         */
        private onreconnect
    }

    export interface SocketOptions {
        /**
         * the authentication payload sent when connecting to the Namespace
         */
        auth: object | ((cb: (data: object) => void) => void)
    }

    export class Socket extends Emitter {
        readonly io: Manager
        id: string
        connected: boolean
        disconnected: boolean
        receiveBuffer: Array<ReadonlyArray<any>>
        sendBuffer: Array<Packet>
        private readonly nsp
        private readonly auth
        private ids
        private acks
        private flags
        private subs?
        private _anyListeners
        /**
         * `Socket` constructor.
         *
         * @public
         */
        constructor(io: Manager, nsp: string, opts?: Partial<SocketOptions>)
        /**
         * Subscribe to open, close and packet events
         *
         * @private
         */
        private subEvents
        /**
         * Whether the Socket will try to reconnect when its Manager connects or reconnects
         */
        get active(): boolean
        /**
         * "Opens" the socket.
         *
         * @public
         */
        connect(): this
        /**
         * Alias for connect()
         */
        open(): this
        /**
         * Sends a `message` event.
         *
         * @return self
         * @public
         */
        send(...args: any[]): this
        /**
         * Override `emit`.
         * If the event is in `events`, it's emitted normally.
         *
         * @param ev - event name
         * @return self
         * @public
         */
        emit(ev: string, ...args: any[]): this
        /**
         * Sends a packet.
         *
         * @param packet
         * @private
         */
        private packet
        /**
         * Called upon engine `open`.
         *
         * @private
         */
        private onopen
        /**
         * Called upon engine or manager `error`.
         *
         * @param err
         * @private
         */
        private onerror
        /**
         * Called upon engine `close`.
         *
         * @param reason
         * @private
         */
        private onclose
        /**
         * Called with socket packet.
         *
         * @param packet
         * @private
         */
        private onpacket
        /**
         * Called upon a server event.
         *
         * @param packet
         * @private
         */
        private onevent
        private emitEvent
        /**
         * Produces an ack callback to emit with an event.
         *
         * @private
         */
        private ack
        /**
         * Called upon a server acknowlegement.
         *
         * @param packet
         * @private
         */
        private onack
        /**
         * Called upon server connect.
         *
         * @private
         */
        private onconnect
        /**
         * Emit buffered events (received and emitted).
         *
         * @private
         */
        private emitBuffered
        /**
         * Called upon server disconnect.
         *
         * @private
         */
        private ondisconnect
        /**
         * Called upon forced client/server side disconnections,
         * this method ensures the manager stops tracking us and
         * that reconnections don't get triggered for this.
         *
         * @private
         */
        private destroy
        /**
         * Disconnects the socket manually.
         *
         * @return self
         * @public
         */
        disconnect(): this
        /**
         * Alias for disconnect()
         *
         * @return self
         * @public
         */
        close(): this
        /**
         * Sets the compress flag.
         *
         * @param compress - if `true`, compresses the sending data
         * @return self
         * @public
         */
        compress(compress: boolean): this
        /**
         * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
         * ready to send messages.
         *
         * @returns self
         * @public
         */
        get volatile(): this
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback.
         *
         * @param listener
         * @public
         */
        onAny(listener: (...args: any[]) => void): this
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback. The listener is added to the beginning of the listeners array.
         *
         * @param listener
         * @public
         */
        prependAny(listener: (...args: any[]) => void): this
        /**
         * Removes the listener that will be fired when any event is emitted.
         *
         * @param listener
         * @public
         */
        offAny(listener?: (...args: any[]) => void): this
        /**
         * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
         * e.g. to remove listeners.
         *
         * @public
         */
        listenersAny(): ((...args: any[]) => void)[]
    }
    export type DisconnectReason =
        | 'io server disconnect'
        | 'io client disconnect'
        | 'ping timeout'
        | 'transport close'
        | 'transport error'

    export function on(
        obj: Emitter,
        ev: string,
        fn: (err?: any) => any
    ): VoidFunction

    export type ParsedUrl = {
        source: string
        protocol: string
        authority: string
        userInfo: string
        user: string
        password: string
        host: string
        port: string
        relative: string
        path: string
        directory: string
        file: string
        query: string
        anchor: string
        pathNames: Array<string>
        queryKey: {
            [key: string]: string
        }
        id: string
        href: string
    }
    /**
     * URL parser.
     *
     * @param uri - url
     * @param path - the request path of the connection
     * @param loc - An object meant to mimic window.location.
     *        Defaults to window.location.
     * @public
     */
    export function url(
        uri: string | ParsedUrl,
        path?: string,
        loc?: Location
    ): ParsedUrl

    function lookup(opts?: Partial<ManagerOptions & SocketOptions>): Socket
    function lookup(
        uri: string,
        opts?: Partial<ManagerOptions & SocketOptions>
    ): Socket
    function lookup(
        uri: string | Partial<ManagerOptions & SocketOptions>,
        opts?: Partial<ManagerOptions & SocketOptions>
    ): Socket

    export {lookup as io, lookup as connect, lookup as default}
}
