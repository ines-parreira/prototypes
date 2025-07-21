import { ContentBlock, ContentState } from 'draft-js'

import {
    GuidanceVariable,
    GuidanceVariableGroup,
    GuidanceVariableList,
} from 'pages/aiAgent/components/GuidanceEditor/variables.types'

import {
    addGuidanceVariableEntity,
    findGuidanceVariable,
    findManyGuidanceVariables,
    guidanceVariableRegex,
    parseGuidanceVariable,
    replaceGuidanceVariablesPlaceholdersWithLabels,
} from '../utils'

// Mock Draft.js modules
jest.mock('draft-js', () => {
    const SelectionState = {
        createEmpty: jest.fn().mockReturnValue({
            merge: jest.fn().mockReturnThis(),
        }),
    }

    const Modifier = {
        replaceText: jest
            .fn()
            .mockImplementation((contentState) => contentState),
    }

    return {
        ContentBlock: jest.fn(),
        ContentState: jest.fn(),
        SelectionState,
        Modifier,
    }
})

describe('Guidance Variables Utils', () => {
    // Test data
    const customerVariable: GuidanceVariable = {
        name: 'Customer Name',
        value: '&&&customer.name&&&',
        category: 'customer',
    }

    const orderVariable: GuidanceVariable = {
        name: 'Order Number',
        value: '&&&order.number&&&',
        category: 'order',
    }

    const nestedVariable: GuidanceVariable = {
        name: 'Nested Variable',
        value: '&&&nested.variable&&&',
        category: 'order',
    }

    const variableGroup: GuidanceVariableGroup = {
        name: 'Order Group',
        variables: [orderVariable, nestedVariable],
    }

    const anotherGroup: GuidanceVariableGroup = {
        name: 'Nested Group',
        variables: [
            {
                name: 'Deep Variable',
                value: '&&&deep.variable&&&',
                category: 'customer',
            },
        ],
    }

    const deeplyNestedGroup: GuidanceVariableGroup = {
        name: 'Deep Group',
        variables: [anotherGroup],
    }

    const variableList: GuidanceVariableList = [
        customerVariable,
        variableGroup,
        deeplyNestedGroup,
    ]

    describe('guidanceVariableRegex', () => {
        it('should match guidance variable patterns', () => {
            const text =
                'Hello &&&customer.name&&&, your order &&&order.number&&& has been shipped.'
            const matches = text.match(guidanceVariableRegex)
            expect(matches).toHaveLength(2)
            expect(matches).toContain('&&&customer.name&&&')
            expect(matches).toContain('&&&order.number&&&')
        })

        it('should not match invalid patterns', () => {
            const text =
                'Hello &&customer.name&&, your order &&& has been shipped.'
            const matches = text.match(guidanceVariableRegex)
            expect(matches).toBeNull()
        })
    })

    describe('findManyGuidanceVariables', () => {
        it('should find multiple variables based on a predicate', () => {
            const result = findManyGuidanceVariables(variableList, (v) => {
                if ('category' in v && v.category === 'order') {
                    return v
                }
                return undefined
            })

            expect(result).toHaveLength(2)
            expect(result).toContainEqual(orderVariable)
            expect(result).toContainEqual(nestedVariable)
        })

        it('should find variables in nested groups', () => {
            const result = findManyGuidanceVariables(variableList, (v) => {
                if ('value' in v && v.value === '&&&deep.variable&&&') {
                    return v
                }
                return undefined
            })

            expect(result).toHaveLength(1)
            expect(result[0].value).toBe('&&&deep.variable&&&')
        })

        it('should return empty array when no matches found', () => {
            const result = findManyGuidanceVariables(
                variableList,
                () => undefined,
            )
            expect(result).toHaveLength(0)
        })
    })

    describe('findGuidanceVariable', () => {
        it('should find a single variable based on a predicate', () => {
            const result = findGuidanceVariable(variableList, (v) => {
                if ('value' in v && v.value === '&&&customer.name&&&') {
                    return v
                }
                return undefined
            })

            expect(result).toEqual(customerVariable)
        })

        it('should find a variable in a nested group', () => {
            const result = findGuidanceVariable(variableList, (v) => {
                if ('value' in v && v.value === '&&&deep.variable&&&') {
                    return v
                }
                return undefined
            })

            expect(result).toBeDefined()
            expect(result?.value).toBe('&&&deep.variable&&&')
        })

        it('should return undefined when no match found', () => {
            const result = findGuidanceVariable(variableList, (v) => {
                if ('value' in v && v.value === '&&&nonexistent&&&') {
                    return v
                }
                return undefined
            })

            expect(result).toBeUndefined()
        })
    })

    describe('parseGuidanceVariable', () => {
        it('should parse a variable from a value string', () => {
            const result = parseGuidanceVariable(
                '&&&customer.name&&&',
                variableList,
            )
            expect(result).toEqual(customerVariable)
        })

        it('should return null for non-existent variable', () => {
            const result = parseGuidanceVariable(
                '&&&nonexistent&&&',
                variableList,
            )
            expect(result).toBeNull()
        })

        it('should find a variable in a nested group', () => {
            const result = parseGuidanceVariable(
                '&&&deep.variable&&&',
                variableList,
            )
            expect(result).toBeDefined()
            expect(result?.value).toBe('&&&deep.variable&&&')
        })
    })

    describe('addGuidanceVariableEntity', () => {
        // We'll use a different approach to test this function
        it('should add an entity to a variable', () => {
            // Create a spy on the implementation
            const mockReplaceText = jest.spyOn(
                require('draft-js').Modifier,
                'replaceText',
            )

            // Mock ContentBlock with the exact variable text
            const variableText = '&&&customer.name&&&'
            const mockBlock = {
                getKey: jest.fn().mockReturnValue('block-key'),
                getText: jest.fn().mockReturnValue(`Hello ${variableText}`),
                getEntityAt: jest.fn().mockReturnValue(null),
            } as unknown as ContentBlock

            // Mock ContentState
            const mockEntityKey = 'entity-key-123'
            const mockContentState = {
                createEntity: jest.fn().mockReturnThis(),
                getLastCreatedEntityKey: jest
                    .fn()
                    .mockReturnValue(mockEntityKey),
                getEntity: jest.fn(),
            } as unknown as ContentState

            const start = 6
            const end = start + variableText.length // "Hello &&&customer.name&&&" -> "&&&customer.name&&&" is from 6 to 24

            // Call the function
            addGuidanceVariableEntity(mockBlock, mockContentState, start, end)

            // Verify the function behavior
            expect(mockBlock.getText).toHaveBeenCalled()
            expect(mockContentState.createEntity).toHaveBeenCalledWith(
                'guidance_variable',
                'IMMUTABLE',
                { value: variableText },
            )
            expect(mockContentState.getLastCreatedEntityKey).toHaveBeenCalled()

            // Clean up
            mockReplaceText.mockRestore()
        })

        it('should not add entity if one already exists', () => {
            // Mock ContentBlock with existing entity
            const mockBlock = {
                getKey: jest.fn().mockReturnValue('block-key'),
                getText: jest.fn().mockReturnValue('Hello &&&customer.name&&&'),
                getEntityAt: jest.fn().mockReturnValue('existing-entity-key'),
            } as unknown as ContentBlock

            // Mock ContentState with entity of type 'guidance_variable'
            const mockContentState = {
                getEntity: jest.fn().mockReturnValue({
                    getType: jest.fn().mockReturnValue('guidance_variable'),
                }),
            } as unknown as ContentState

            const start = 6
            const end = 24

            // Call the function
            const result = addGuidanceVariableEntity(
                mockBlock,
                mockContentState,
                start,
                end,
            )

            // Verify the function behavior
            expect(mockBlock.getEntityAt).toHaveBeenCalledWith(start)
            expect(mockContentState.getEntity).toHaveBeenCalledWith(
                'existing-entity-key',
            )
            expect(result).toBe(mockContentState)
        })
    })

    describe('replaceGuidanceVariablesPlaceholdersWithLabels', () => {
        it('should replace variable placeholders with labels', () => {
            const content =
                'Hello &&&customer.name&&&, your order &&&order.number&&& has been shipped.'
            const result = replaceGuidanceVariablesPlaceholdersWithLabels(
                content,
                variableList,
            )
            expect(result).toBe(
                'Hello Customer: Customer Name, your order Order: Order Number has been shipped.',
            )
        })

        it('should handle nested variables', () => {
            const content = 'Deep variable: &&&deep.variable&&&'
            const result = replaceGuidanceVariablesPlaceholdersWithLabels(
                content,
                variableList,
            )
            expect(result).toBe('Deep variable: Customer: Deep Variable')
        })

        it('should return original content if no variables found', () => {
            const content = 'No variables here'
            const result = replaceGuidanceVariablesPlaceholdersWithLabels(
                content,
                [],
            )
            expect(result).toBe(content)
        })

        it('should handle empty content', () => {
            const result = replaceGuidanceVariablesPlaceholdersWithLabels(
                '',
                [],
            )
            expect(result).toBe('')
        })
    })
})
