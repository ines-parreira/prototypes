import {renderHook} from '@testing-library/react-hooks'
import useEvent, {ElementListener, OnOffListener} from '../useEvent'

interface Props {
    name: string
    handler: (...args: any[]) => void
    target: ElementListener | OnOffListener
    options: any
}

const elementPropsList = [
    {
        name: 'name1',
        handler: jest.fn(),
        target: {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        },
        options: {a: 'opt1'},
    },
    {
        name: 'name2',
        handler: jest.fn(),
        target: {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        },
        options: {a: 'opt2'},
    },
]

const onOffPropsList = [
    {
        ...elementPropsList[0],
        target: {
            on: jest.fn(),
            off: jest.fn(),
        },
    },
    {
        ...elementPropsList[1],
        target: {
            on: jest.fn(),
            off: jest.fn(),
        },
    },
]

describe('useEvent', () => {
    it('should call addEventListener/removeEventListener on mount/unmount', () => {
        expectMountAndUnmountToWork(
            elementPropsList[0],
            'addEventListener',
            'removeEventListener'
        )
    })

    it('should call on/off on mount/unmount', () => {
        expectMountAndUnmountToWork(onOffPropsList[0], 'on', 'off')
    })

    it('should call addEventListener/removeEventListener on deps changes', () => {
        expectDepsChangesToWork(
            elementPropsList[0],
            elementPropsList[1],
            'addEventListener',
            'removeEventListener'
        )
    })

    it('should call on/off on deps changes', () => {
        expectDepsChangesToWork(
            onOffPropsList[0],
            onOffPropsList[1],
            'on',
            'off'
        )
    })
})

const expectMountAndUnmountToWork = (
    props: Props,
    addEventListenerName: string,
    removeEventListenerName: string
) => {
    const {unmount} = renderHook(
        (p: Props) => useEvent(p.name, p.handler, p.target, p.options),
        {
            initialProps: props,
        }
    )
    expect(
        props.target[addEventListenerName as keyof Props['target']]
    ).toHaveBeenCalledTimes(1)
    expect(
        props.target[addEventListenerName as keyof Props['target']]
    ).toHaveBeenLastCalledWith(props.name, props.handler, props.options)
    unmount()
    expect(
        props.target[removeEventListenerName as keyof Props['target']]
    ).toHaveBeenCalledTimes(1)
    expect(
        props.target[removeEventListenerName as keyof Props['target']]
    ).toHaveBeenLastCalledWith(props.name, props.handler, props.options)
}

const expectDepsChangesToWork = (
    props: Props,
    otherProps: Props,
    addEventListenerName: string,
    removeEventListenerName: string
) => {
    const {rerender} = renderHook(
        (p: Props) => useEvent(p.name, p.handler, p.target, p.options),
        {
            initialProps: props,
        }
    )
    expect(
        props.target[addEventListenerName as keyof Props['target']]
    ).toHaveBeenCalledTimes(1)
    expect(
        props.target[addEventListenerName as keyof Props['target']]
    ).toHaveBeenLastCalledWith(props.name, props.handler, props.options)

    // deps are same as previous
    rerender({
        name: props.name,
        handler: props.handler,
        target: props.target,
        options: props.options,
    })
    expect(
        props.target[removeEventListenerName as keyof Props['target']]
    ).not.toHaveBeenCalled()

    // name is different from previous
    rerender({
        name: otherProps.name,
        handler: props.handler,
        target: props.target,
        options: props.options,
    })
    expect(
        props.target[removeEventListenerName as keyof Props['target']]
    ).toHaveBeenCalledTimes(1)
    expect(
        props.target[removeEventListenerName as keyof Props['target']]
    ).toHaveBeenLastCalledWith(props.name, props.handler, props.options)

    // handler is different from previous
    rerender({
        name: otherProps.name,
        handler: otherProps.handler,
        target: props.target,
        options: props.options,
    })
    expect(
        props.target[removeEventListenerName as keyof Props['target']]
    ).toHaveBeenCalledTimes(2)
    expect(
        props.target[removeEventListenerName as keyof Props['target']]
    ).toHaveBeenLastCalledWith(otherProps.name, props.handler, props.options)

    // options contents is same as previous
    rerender({
        name: otherProps.name,
        handler: otherProps.handler,
        target: props.target,
        options: {a: 'opt1'},
    })
    expect(
        props.target[removeEventListenerName as keyof Props['target']]
    ).toHaveBeenCalledTimes(2)

    // options is different from previous
    rerender({
        name: otherProps.name,
        handler: otherProps.handler,
        target: props.target,
        options: otherProps.options,
    })
    expect(
        props.target[removeEventListenerName as keyof Props['target']]
    ).toHaveBeenCalledTimes(3)
    expect(
        props.target[removeEventListenerName as keyof Props['target']]
    ).toHaveBeenLastCalledWith(
        otherProps.name,
        otherProps.handler,
        props.options
    )

    // target is different from previous
    rerender({
        name: otherProps.name,
        handler: otherProps.handler,
        target: otherProps.target,
        options: otherProps.options,
    })
    expect(
        props.target[removeEventListenerName as keyof Props['target']]
    ).toHaveBeenCalledTimes(4)
    expect(
        props.target[removeEventListenerName as keyof Props['target']]
    ).toHaveBeenLastCalledWith(
        otherProps.name,
        otherProps.handler,
        otherProps.options
    )

    expect(
        otherProps.target[addEventListenerName as keyof Props['target']]
    ).toHaveBeenCalledTimes(1)
    expect(
        otherProps.target[addEventListenerName as keyof Props['target']]
    ).toHaveBeenLastCalledWith(
        otherProps.name,
        otherProps.handler,
        otherProps.options
    )
}
