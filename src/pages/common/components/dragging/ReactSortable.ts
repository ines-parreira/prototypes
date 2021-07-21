import React, {ReactNode, Component} from 'react'
import ReactDOM from 'react-dom'
import Sortable, {MoveEvent, SortableEvent, SortableOptions} from 'sortablejs'

type Props = {
    children: ReactNode
    className?: string
    options: SortableOptions
    onChange: (
        values: string[],
        sortable?: Sortable,
        event?: SortableEvent | MoveEvent
    ) => void
    tag: keyof JSX.IntrinsicElements
}

/**
 * Lighter version of https://github.com/cheton/react-sortable
 * Uses previousIndex instead of sibling to calculate previous position of element
 */
class ReactSortable extends Component<Props> {
    private sortable: Sortable | null
    static defaultProps: Pick<Props, 'options' | 'tag'> = {
        options: {},
        tag: 'div',
    }

    constructor(props: Props) {
        super(props)

        this.sortable = null
    }

    componentDidMount() {
        const {options, onChange} = this.props
        const eventsNames: Array<
            keyof Pick<
                SortableOptions,
                | 'onStart'
                | 'onEnd'
                | 'onAdd'
                | 'onSort'
                | 'onUpdate'
                | 'onRemove'
                | 'onFilter'
                | 'onMove'
            >
        > = [
            'onStart',
            'onEnd',
            'onAdd',
            'onSort',
            'onUpdate',
            'onRemove',
            'onFilter',
            'onMove',
        ]

        eventsNames.forEach((name) => {
            const eventHandler = options[name]

            options[name] = (event: SortableEvent | MoveEvent) => {
                const evt = event as SortableEvent
                if (name === 'onStart') {
                    store.previousIndex = evt.oldIndex
                    store.activeComponent = this
                } else if (
                    (name === 'onAdd' || name === 'onUpdate') &&
                    onChange
                ) {
                    const items = this.sortable!.toArray()
                    const remote = store.activeComponent!
                    const remoteItems = remote.sortable!.toArray()

                    evt.from.insertBefore(
                        evt.item,
                        evt.from.children[store.previousIndex as number]
                    )

                    if (remote !== this) {
                        const remoteOptions = remote.props.options || {}

                        if (
                            typeof remoteOptions.group === 'object' &&
                            remoteOptions.group.pull === 'clone'
                        ) {
                            // Remove the node with the same data-reactid
                            evt.item.parentNode!.removeChild(evt.item)
                        }

                        if (remote.props.onChange) {
                            remote.props.onChange(
                                remoteItems,
                                remote.sortable!,
                                evt
                            )
                        }
                    }

                    if (onChange) {
                        onChange(items, this.sortable!, evt)
                    }
                }

                setTimeout(() => {
                    if (eventHandler) {
                        eventHandler(evt as any)
                    }
                }, 0)
            }
        })

        this.sortable = Sortable.create(
            ReactDOM.findDOMNode(this) as Element,
            options
        )
    }

    componentWillUnmount() {
        if (this.sortable) {
            this.sortable.destroy()
            this.sortable = null
        }
    }

    render() {
        const {children, className, tag} = this.props
        return React.createElement(tag, {className}, children)
    }
}

const store: {
    previousIndex: Maybe<number>
    activeComponent: ReactSortable | null
} = {
    previousIndex: null,
    activeComponent: null,
}

export default ReactSortable
