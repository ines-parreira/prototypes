import type { ComponentProps } from 'react'
import { useCallback, useRef, useState } from 'react'

import {
    useDebouncedEffect,
    useDelayedAsyncFn,
    useEffectOnce,
    usePrevious,
} from '@repo/hooks'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Button } from '@gorgias/axiom'

import Dropdown, { DropdownContext } from './Dropdown'
import DropdownBody from './DropdownBody'
import DropdownItem from './DropdownItem'
import DropdownSearch from './DropdownSearch'

const storyConfig: Meta = {
    title: 'General/Dropdown/Dropdown',
    component: Dropdown,
    argTypes: {
        value: {
            control: { type: 'text' },
        },
        isDisabled: {
            control: { type: 'boolean' },
        },
        isOpen: {
            control: { type: 'boolean' },
        },
    },
}

const DefaultTemplate: StoryObj<typeof Dropdown> = {
    render: function DefaultTemplate(props) {
        const targetRef = useRef<HTMLDivElement>(null)
        const [isMounted, setIsMounted] = useState(false)

        useEffectOnce(() => {
            setIsMounted(true)
        })

        return (
            <div id="default-container" style={{ height: '400px' }}>
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
    },
}

const ExampleTemplate: StoryObj<
    { options: string[] } & ComponentProps<typeof Dropdown>
> = {
    render: function ExampleTemplate({ options, ...other }) {
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
    },
}

const AsyncTemplate: StoryObj<
    { options: string[] } & ComponentProps<typeof Dropdown>
> = {
    render: function AsyncTemplate({ options, ...other }) {
        const [isOpen, setIsOpen] = useState(false)
        const [isLoading, setIsLoading] = useState(false)
        const [query, setQuery] = useState('')
        const previousQuery = usePrevious(query)
        const buttonRef = useRef<HTMLButtonElement>(null)

        const [{ loading: isAsyncLoading }, handleSearch] = useDelayedAsyncFn(
            async (value: string) => {
                await new Promise((resolve) => {
                    setTimeout(() => {
                        setIsLoading(false)
                        resolve(value)
                    }, 300)
                })
            },
            [],
            0,
        )

        useDebouncedEffect(
            () => {
                if (previousQuery !== query) {
                    void handleSearch(query)
                }
            },
            [handleSearch, previousQuery, query],
            300,
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
                                                    context.query.toLocaleLowerCase(),
                                                ) && (
                                                <div key={option}>
                                                    {context.getHighlightedLabel(
                                                        option,
                                                    )}
                                                </div>
                                            ),
                                    )}
                                </DropdownBody>
                            )
                        }}
                    </DropdownContext.Consumer>
                </Dropdown>
            </div>
        )
    },
}

export const Default = {
    ...DefaultTemplate,
    args: {
        children: 'foo',
        className: '',
        overlayClassName: '',
        isDisabled: false,
        isOpen: false,
        onToggle: (isVisible: boolean) =>
            console.warn(`Toggled with value ${isVisible.toString()}`),
        placement: 'bottom',
        safeDistance: 8,
        value: '',
    },
}

const options = ['Foo', 'Bar', 'Baz']

export const Example = {
    ...ExampleTemplate,
    args: {
        options,
        isMultiple: false,
    },
}

export const AsyncExample = {
    ...AsyncTemplate,

    args: {
        options,
    },
}

export default storyConfig
