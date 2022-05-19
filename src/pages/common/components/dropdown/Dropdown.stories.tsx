import React, {ComponentProps, useCallback, useRef, useState} from 'react'
import {useDebounce, useEffectOnce, usePrevious} from 'react-use'
import {Meta, Story} from '@storybook/react'

import useDelayedAsyncFn from 'hooks/useDelayedAsyncFn'
import Button from 'pages/common/components/button/Button'

import Dropdown, {DropdownContext} from './Dropdown'
import DropdownBody from './DropdownBody'
import DropdownSearch from './DropdownSearch'
import DropdownItem from './DropdownItem'

const storyConfig: Meta = {
    title: 'General/Dropdown/Dropdown',
    component: Dropdown,
    argTypes: {
        placement: {
            control: {
                type: 'select',
            },
            options: [
                'top',
                'right',
                'bottom',
                'left',
                'top-start',
                'right-start',
                'bottom-start',
                'left-start',
                'top-end',
                'right-end',
                'bottom-end',
                'left-end',
            ],
        },
        value: {
            control: {type: null},
        },
    },
}

const DefaultTemplate: Story<ComponentProps<typeof Dropdown>> = (props) => {
    const targetRef = useRef<HTMLDivElement>(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffectOnce(() => {
        setIsMounted(true)
    })

    return (
        <div id="default-container" style={{height: '400px'}}>
            <div
                ref={targetRef}
                style={{
                    backgroundColor: 'lightgrey',
                    height: '50px',
                    left: '50%',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100px',
                }}
            />
            {isMounted ? (
                <Dropdown
                    {...props}
                    root={document.getElementById('default-container')!}
                    target={targetRef}
                />
            ) : null}
        </div>
    )
}

const ExampleTemplate: Story<
    {options: string[]} & ComponentProps<typeof Dropdown>
> = ({options, ...other}) => {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [value, setValue] = useState<string | number | boolean>()

    return (
        <div id="example-container">
            <Button onClick={() => setIsOpen(!isOpen)} ref={buttonRef}>
                Click me
            </Button>

            <Dropdown
                {...other}
                isOpen={isOpen}
                onToggle={setIsOpen}
                root={document.getElementById('example-container')!}
                target={buttonRef}
                value={value}
            >
                <DropdownSearch />

                <DropdownContext.Consumer>
                    {(context) => {
                        if (!context) {
                            return
                        }

                        return (
                            <DropdownBody>
                                {options.map((option) => (
                                    <DropdownItem
                                        key={option}
                                        option={{
                                            label: option,
                                            value: option,
                                        }}
                                        onClick={setValue}
                                    />
                                ))}
                            </DropdownBody>
                        )
                    }}
                </DropdownContext.Consumer>
            </Dropdown>
        </div>
    )
}

const AsyncTemplate: Story<
    {options: string[]} & ComponentProps<typeof Dropdown>
> = ({options, ...other}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [query, setQuery] = useState('')
    const previousQuery = usePrevious(query)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const [{loading: isAsyncLoading}, handleSearch] = useDelayedAsyncFn(
        async (value: string) => {
            await new Promise((resolve) => {
                setTimeout(() => {
                    setIsLoading(false)
                    resolve(value)
                }, 300)
            })
        },
        [],
        0
    )

    useDebounce(
        () => {
            if (previousQuery !== query) {
                void handleSearch(query)
            }
        },
        300,
        [handleSearch, previousQuery, query]
    )

    const handleChange = useCallback((value: string) => {
        setIsLoading(true)
        setQuery(value)
    }, [])

    return (
        <div id="example-container">
            <Button onClick={() => setIsOpen(!isOpen)} ref={buttonRef}>
                Click me
            </Button>

            <Dropdown
                {...other}
                isOpen={isOpen}
                onToggle={setIsOpen}
                root={document.getElementById('example-container')!}
                target={buttonRef}
            >
                <DropdownSearch onChange={handleChange} value={query} />

                <DropdownContext.Consumer>
                    {(context) => {
                        if (!context) {
                            return
                        }

                        return (
                            <DropdownBody
                                isLoading={isLoading || isAsyncLoading}
                            >
                                {options.map(
                                    (option) =>
                                        option
                                            .toLowerCase()
                                            .includes(
                                                context.query.toLocaleLowerCase()
                                            ) && (
                                            <div key={option}>
                                                {context.getHighlightedLabel(
                                                    option
                                                )}
                                            </div>
                                        )
                                )}
                            </DropdownBody>
                        )
                    }}
                </DropdownContext.Consumer>
            </Dropdown>
        </div>
    )
}

export const Default = DefaultTemplate.bind({})
Default.args = {
    children: 'foo',
    className: '',
    isDisabled: false,
    isOpen: false,
    onToggle: (isVisible: boolean) =>
        console.warn(`Toggled with value ${isVisible.toString()}`),
    placement: 'bottom',
    safeDistance: 8,
    value: '',
}

const options = ['Foo', 'Bar', 'Baz']

export const Example = ExampleTemplate.bind({})
Example.parameters = {
    controls: {include: ['options', 'placement', 'isMultiple']},
}
Example.args = {
    options,
    isMultiple: false,
}

export const AsyncExample = AsyncTemplate.bind({})
AsyncExample.parameters = {
    controls: {include: ['options', 'placement']},
}
AsyncExample.args = {
    options,
}

export default storyConfig
