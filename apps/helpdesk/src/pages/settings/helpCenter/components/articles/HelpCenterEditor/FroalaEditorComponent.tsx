import type { ReactNode } from 'react'
import { Component } from 'react'

import { FroalaEditor } from './froala-config'

interface FroalaConfig {
    immediateReactModelUpdate?: boolean
    reactIgnoreAttrs?: string[] | null
    initOnClick?: boolean
    events?: { [key: string]: ((...args: any[]) => void) | undefined }
    [key: string]: any
}

interface FroalaEditorProps {
    tag?: string
    config?: FroalaConfig
    model?: string | { [key: string]: any }
    onManualControllerReady?: (controls: {
        initialize: () => void
        destroy: () => void
        getEditor: () => any
    }) => void
    onModelChange?: (content: string) => void
    skipReset?: boolean
    children?: ReactNode
}

interface ManualController {
    initialize: () => void
    destroy: () => void
    getEditor: () => any
}

export default class FroalaEditorFunctionality extends Component<FroalaEditorProps> {
    private defaultTag: string
    private tag: string
    private listeningEvents: any[]
    private element: HTMLElement | null
    private editor: any
    private config: FroalaConfig
    private editorInitialized: boolean
    private SPECIAL_TAGS: string[]
    private INNER_HTML_ATTR: string
    private hasSpecialTag: boolean
    private oldModel: string | { [key: string]: any } | null
    private el: HTMLElement | null = null
    private _initEvents?: (() => void)[]

    constructor(props: FroalaEditorProps) {
        super(props)

        // Tag on which the editor is initialized.
        this.defaultTag = 'div'
        this.tag = props.tag || this.defaultTag
        this.listeningEvents = []

        // Jquery wrapped element.
        this.element = null

        // Editor element.
        this.editor = null

        // Editor options config
        this.config = {
            immediateReactModelUpdate: false,
            reactIgnoreAttrs: null,
        }

        this.editorInitialized = false

        this.SPECIAL_TAGS = ['img', 'button', 'input', 'a']
        this.INNER_HTML_ATTR = 'innerHTML'
        this.hasSpecialTag = false

        this.oldModel = null
    }

    // After first time render.
    componentDidMount() {
        let tagName = this.el!.tagName.toLowerCase()
        if (this.SPECIAL_TAGS.indexOf(tagName) !== -1) {
            this.tag = tagName
            this.hasSpecialTag = true
        }

        if (this.props.onManualControllerReady) {
            this.generateManualController()
        } else {
            this.createEditor()
        }
    }

    componentWillUnmount() {
        this.destroyEditor()
    }

    componentDidUpdate() {
        if (
            JSON.stringify(this.oldModel) === JSON.stringify(this.props.model)
        ) {
            return
        }

        this.setContent()
    }

    // Return cloned object
    clone(item: any): any {
        const me = this
        if (!item) {
            return item
        } // null, undefined values check

        let types = [Number, String, Boolean],
            result: any

        // normalizing primitives if someone did new String('aaa'), or new Number('444');
        types.forEach(function (type) {
            if (item instanceof type) {
                result = type(item)
            }
        })

        if (typeof result === 'undefined') {
            if (Object.prototype.toString.call(item) === '[object Array]') {
                result = []
                item.forEach(function (
                    child: any,
                    index: number,
                    __array: any[],
                ) {
                    result[index] = me.clone(child)
                })
            } else if (typeof item === 'object') {
                // testing that this is DOM
                if (item.nodeType && typeof item.cloneNode === 'function') {
                    result = item.cloneNode(true)
                } else if (!item.prototype) {
                    // check that this is a literal
                    if (item instanceof Date) {
                        result = new Date(item)
                    } else {
                        // it is an object literal
                        result = {} as any
                        for (var i in item) {
                            ;(result as any)[i] = me.clone(item[i])
                        }
                    }
                } else {
                    if (false && item.constructor) {
                        result = new item.constructor()
                    } else {
                        result = item
                    }
                }
            } else {
                result = item
            }
        }
        return result
    }

    createEditor() {
        if (this.editorInitialized) {
            return
        }

        this.config = this.clone(this.props.config || this.config)
        this.config = { ...this.config }

        this.element = this.el

        this.setContent(true)

        // Default initialized.
        this.registerEvent(
            'initialized',
            this.config.events && this.config.events.initialized,
        )

        // Check if events are set.
        if (!this.config.events) this.config.events = {}
        this.config.events.initialized = () => this.initListeners()

        this.editor = new FroalaEditor(this.element, this.config)
    }

    setContent(firstTime?: boolean) {
        if (this.props.model || this.props.model === '') {
            this.oldModel = this.props.model

            if (this.hasSpecialTag) {
                this.setSpecialTagContent()
            } else {
                this.setNormalTagContent(firstTime)
            }
        }
    }

    setNormalTagContent(firstTime?: boolean) {
        let self = this

        function htmlSet() {
            self.editor.html && self.editor.html.set(self.props.model || '')
            if (self.editorInitialized && self.editor.undo) {
                //This will reset the undo stack everytime the model changes externally. Can we fix this?
                //https://github.com/froala-labs/froala-editor-js-2/issues/4214
                if (!self.props.skipReset) {
                    self.editor.undo.reset()
                }
                self.editor.undo.saveStep()
            }
        }

        if (firstTime) {
            if (this.config.initOnClick) {
                this.registerEvent('initializationDelayed', () => {
                    htmlSet()
                })

                this.registerEvent('initialized', () => {
                    this.editorInitialized = true
                })
            } else {
                this.registerEvent('initialized', () => {
                    this.editorInitialized = true
                    htmlSet()
                })
            }
        } else {
            htmlSet()
        }
    }

    setSpecialTagContent() {
        let tags = this.props.model as { [key: string]: any }

        // add tags on element
        if (tags) {
            for (let attr in tags) {
                if (
                    tags.hasOwnProperty(attr) &&
                    attr !== this.INNER_HTML_ATTR
                ) {
                    this.element!.setAttribute(attr, tags[attr])
                }
            }

            if (tags.hasOwnProperty(this.INNER_HTML_ATTR)) {
                this.element!.innerHTML = tags[this.INNER_HTML_ATTR]
            }
        }
    }

    destroyEditor() {
        if (this.element) {
            this.editor.destroy && this.editor.destroy()
            this.listeningEvents.length = 0
            this.element = null
            this.editorInitialized = false
        }
    }

    getEditor() {
        if (this.element) {
            return this.editor
        }

        return null
    }

    generateManualController() {
        let self = this

        let controls: ManualController = {
            initialize: () => self.createEditor.call(self),
            destroy: () => self.destroyEditor.call(self),
            getEditor: () => self.getEditor.call(self),
        }

        this.props.onManualControllerReady!(controls)
    }

    updateModel() {
        if (!this.props.onModelChange) {
            return
        }

        let modelContent: string | { [key: string]: any } = ''

        if (this.hasSpecialTag) {
            let attributeNodes = this.element!.attributes
            let attrs: { [key: string]: any } = {}

            for (let i = 0; i < attributeNodes.length; i++) {
                let attrName = attributeNodes[i].name
                if (
                    this.config.reactIgnoreAttrs &&
                    this.config.reactIgnoreAttrs.indexOf(attrName) !== -1
                ) {
                    continue
                }
                attrs[attrName] = attributeNodes[i].value
            }

            if (this.element!.innerHTML) {
                attrs[this.INNER_HTML_ATTR] = this.element!.innerHTML
            }

            modelContent = attrs
        } else {
            let returnedHtml = this.editor.html.get()
            if (typeof returnedHtml === 'string') {
                modelContent = returnedHtml
            }
        }

        this.oldModel = modelContent
        this.props.onModelChange(modelContent as string)
    }

    initListeners() {
        let self = this

        // bind contentChange and keyup event to froalaModel
        this.editor.events.on('contentChanged', function () {
            self.updateModel()
        })
        if (this.config.immediateReactModelUpdate) {
            this.editor.events.on('keyup', function () {
                self.updateModel()
            })
        }

        // Call init events.
        if (this._initEvents) {
            for (let i = 0; i < this._initEvents.length; i++) {
                this._initEvents[i].call(this.editor)
            }
        }
    }

    // register event on jquery editor element
    registerEvent(
        eventName: string,
        callback?: ((...args: any[]) => void) | undefined,
    ) {
        if (!eventName || !callback) {
            return
        }

        if (eventName === 'initialized') {
            if (!this._initEvents) this._initEvents = []
            this._initEvents.push(callback)
        } else {
            if (!this.config.events) {
                this.config.events = {}
            }

            this.config.events[eventName] = callback
        }
    }

    render() {
        const TagName = this.tag as keyof JSX.IntrinsicElements
        return (
            <TagName ref={(el: any) => (this.el = el)}>
                {this.props.children}
            </TagName>
        )
    }
}
