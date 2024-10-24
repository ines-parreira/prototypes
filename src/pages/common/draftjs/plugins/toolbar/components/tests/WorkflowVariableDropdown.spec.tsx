import {render, screen} from '@testing-library/react'
import React from 'react'

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
            </ToolbarProvider>
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
            </ToolbarProvider>
        )

        expect(screen.getByText('File upload')).toBeInTheDocument()
        expect(screen.getByText('HTTP request')).toBeInTheDocument()
    })
})
