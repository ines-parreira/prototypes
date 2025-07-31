import React from 'react'

import { userEvent } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'

import ToolbarProvider from '../../ToolbarProvider'
import WorkflowVariableDropdown from '../WorkflowVariableDropdown'

describe('<WorkflowVariableDropdown />', () => {
    it('should filter out not supported data types', () => {
        render(
            <ToolbarProvider
                workflowVariables={[
                    {
                        nodeType: 'file_upload',
                        name: 'File upload',
                        value: 'files',
                        type: 'array',
                    },
                    {
                        nodeType: 'http_request',
                        name: 'HTTP request',
                        variables: [
                            {
                                nodeType: 'http_request',
                                name: 'Data',
                                value: 'data',
                                type: 'json',
                            },
                        ],
                    },
                ]}
            >
                <WorkflowVariableDropdown
                    target={React.createRef()}
                    onSelect={jest.fn()}
                    isOpen
                    onToggle={jest.fn()}
                />
            </ToolbarProvider>,
        )

        expect(screen.getByText('No variables available')).toBeInTheDocument()
    })

    it('should allow array and JSON data types', () => {
        render(
            <ToolbarProvider
                workflowVariables={[
                    {
                        nodeType: 'file_upload',
                        name: 'File upload',
                        value: 'files',
                        type: 'array',
                    },
                    {
                        nodeType: 'http_request',
                        name: 'HTTP request',
                        variables: [
                            {
                                nodeType: 'http_request',
                                name: 'Data',
                                value: 'data',
                                type: 'json',
                            },
                        ],
                    },
                ]}
                workflowVariablesDataTypes={[
                    'string',
                    'number',
                    'date',
                    'boolean',
                    'array',
                    'json',
                ]}
            >
                <WorkflowVariableDropdown
                    target={React.createRef()}
                    onSelect={jest.fn()}
                    isOpen
                    onToggle={jest.fn()}
                />
            </ToolbarProvider>,
        )

        expect(screen.getByText('File upload')).toBeInTheDocument()
        expect(screen.getByText('HTTP request')).toBeInTheDocument()
    })

    describe('search results', () => {
        test('should search when typed', async () => {
            render(
                <ToolbarProvider
                    workflowVariables={[
                        {
                            nodeType: 'file_upload',
                            name: 'File upload',
                            value: 'files',
                            type: 'array',
                        },
                        {
                            nodeType: 'http_request',
                            name: 'HTTP request',
                            variables: [
                                {
                                    nodeType: 'http_request',
                                    name: 'Data',
                                    value: 'data',
                                    type: 'json',
                                },
                            ],
                        },
                    ]}
                    workflowVariablesDataTypes={[
                        'string',
                        'number',
                        'date',
                        'boolean',
                        'array',
                        'json',
                    ]}
                >
                    <WorkflowVariableDropdown
                        target={React.createRef()}
                        onSelect={jest.fn()}
                        isOpen
                        onToggle={jest.fn()}
                    />
                </ToolbarProvider>,
            )

            userEvent.type(
                screen.getByPlaceholderText('Search for a variable'),
                // Start to type in File, which will hide HTTP request
                'Fi',
            )

            await waitFor(() => {
                expect(screen.getByText('File upload')).toBeInTheDocument()
                expect(
                    screen.queryByText('HTTP request'),
                ).not.toBeInTheDocument()
            })
        })

        test('should clear searches when dropdown closed', async () => {
            const { rerender } = render(
                <ToolbarProvider
                    workflowVariables={[
                        {
                            nodeType: 'file_upload',
                            name: 'File upload',
                            value: 'files',
                            type: 'array',
                        },
                        {
                            nodeType: 'http_request',
                            name: 'HTTP request',
                            variables: [
                                {
                                    nodeType: 'http_request',
                                    name: 'Data',
                                    value: 'data',
                                    type: 'json',
                                },
                            ],
                        },
                    ]}
                    workflowVariablesDataTypes={[
                        'string',
                        'number',
                        'date',
                        'boolean',
                        'array',
                        'json',
                    ]}
                >
                    <WorkflowVariableDropdown
                        target={React.createRef()}
                        onSelect={jest.fn()}
                        isOpen
                        onToggle={jest.fn()}
                    />
                </ToolbarProvider>,
            )

            userEvent.type(
                screen.getByPlaceholderText('Search for a variable'),
                // Start to type in File, which will hide HTTP request
                'Fi',
            )

            await waitFor(() => {
                expect(screen.getByText('File upload')).toBeInTheDocument()
                expect(
                    screen.queryByText('HTTP request'),
                ).not.toBeInTheDocument()
            })

            rerender(
                <ToolbarProvider
                    workflowVariables={[
                        {
                            nodeType: 'file_upload',
                            name: 'File upload',
                            value: 'files',
                            type: 'array',
                        },
                        {
                            nodeType: 'http_request',
                            name: 'HTTP request',
                            variables: [
                                {
                                    nodeType: 'http_request',
                                    name: 'Data',
                                    value: 'data',
                                    type: 'json',
                                },
                            ],
                        },
                    ]}
                    workflowVariablesDataTypes={[
                        'string',
                        'number',
                        'date',
                        'boolean',
                        'array',
                        'json',
                    ]}
                >
                    <WorkflowVariableDropdown
                        target={React.createRef()}
                        onSelect={jest.fn()}
                        isOpen={false}
                        onToggle={jest.fn()}
                    />
                </ToolbarProvider>,
            )

            rerender(
                <ToolbarProvider
                    workflowVariables={[
                        {
                            nodeType: 'file_upload',
                            name: 'File upload',
                            value: 'files',
                            type: 'array',
                        },
                        {
                            nodeType: 'http_request',
                            name: 'HTTP request',
                            variables: [
                                {
                                    nodeType: 'http_request',
                                    name: 'Data',
                                    value: 'data',
                                    type: 'json',
                                },
                            ],
                        },
                    ]}
                    workflowVariablesDataTypes={[
                        'string',
                        'number',
                        'date',
                        'boolean',
                        'array',
                        'json',
                    ]}
                >
                    <WorkflowVariableDropdown
                        target={React.createRef()}
                        onSelect={jest.fn()}
                        isOpen
                        onToggle={jest.fn()}
                    />
                </ToolbarProvider>,
            )

            expect(screen.getByText('File upload')).toBeInTheDocument()
            expect(screen.getByText('HTTP request')).toBeInTheDocument()
        })
    })
})
