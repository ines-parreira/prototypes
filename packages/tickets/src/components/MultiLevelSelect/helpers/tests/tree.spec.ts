import { OptionType } from '../../types'
import {
    buildTreeFromChoices,
    flattenTreeWithCaptions,
    getDisplayLabel,
    getOptionsAtPath,
    getPathFromValue,
    isBackButton,
    isClearButton,
} from '../tree'

describe('buildTreeFromChoices', () => {
    it('should build tree from flat choices', () => {
        const choices = ['wrong address', 'refund']
        const tree = buildTreeFromChoices(choices)

        expect(tree.size).toBe(2)
        expect(tree.has('wrong address')).toBe(true)
        expect(tree.has('refund')).toBe(true)
    })

    it('should handle nested options', () => {
        const choices = [
            'Status::Refunded::Wrong item',
            'Status::Refunded::Not delivered',
            'Status::Delivered',
        ]
        const tree = buildTreeFromChoices(choices)

        const nodeA = tree.get('Status')!
        expect(nodeA.value).toBe(null)
        expect(nodeA.children.size).toBe(2)

        const nodeB = nodeA.children.get('Refunded')!
        expect(nodeB.value).toBe(null)
        expect(nodeB.children.size).toBe(2)
        expect(nodeB.children.get('Wrong item')!.value).toBe(
            'Status::Refunded::Wrong item',
        )
        expect(nodeB.children.get('Not delivered')!.value).toBe(
            'Status::Refunded::Not delivered',
        )
        expect(nodeA.children.get('Delivered')!.value).toBe('Status::Delivered')
    })
})

describe('getOptionsAtPath', () => {
    it('should get options at root level', () => {
        const tree = buildTreeFromChoices(['Status::Open', 'Status::High'])

        const options = getOptionsAtPath(tree, [])

        expect(options).toHaveLength(1)
        expect(options[0].id).toBe('Status')
        expect(options[0].value).toBe('Status')
        expect(options[0].hasChildren).toBe(true)
    })

    it('should get options at nested path', () => {
        const tree = buildTreeFromChoices(['Status::Open', 'Status::Closed'])

        const options = getOptionsAtPath(tree, ['Status'])

        expect(options).toHaveLength(2)
        expect(options[0].label).toBe('Open')
        expect(options[0].value).toBe('Status::Open')
        expect(options[0].hasChildren).toBe(false)
    })
})

describe('flattenTreeWithCaptions', () => {
    it('should flatten tree to leaf options with captions', () => {
        const tree = buildTreeFromChoices([
            'Status::Open',
            'Status::Closed',
            'Priority::High',
        ])

        const options = flattenTreeWithCaptions(tree)

        expect(options).toHaveLength(3)
        expect(options[0]).toMatchObject({
            type: OptionType.Option,
            label: 'Open',
            value: 'Status::Open',
            caption: 'Status',
            hasChildren: false,
        })
        expect(options[2]).toMatchObject({
            label: 'High',
            caption: 'Priority',
        })
    })

    it('should handle nested captions', () => {
        const tree = buildTreeFromChoices(['A::B::C', 'A::B::D'])

        const options = flattenTreeWithCaptions(tree)

        expect(options).toHaveLength(2)
        expect(options[0].caption).toBe('A > B')
        expect(options[1].caption).toBe('A > B')
    })

    it('should not add caption for root level options', () => {
        const tree = buildTreeFromChoices(['SingleLevel'])

        const options = flattenTreeWithCaptions(tree)

        expect(options[0].caption).toBeUndefined()
    })
})

describe('getPathFromValue', () => {
    it('should extract path from value', () => {
        const path = getPathFromValue('Status::Shipping::Pending')

        expect(path).toEqual(['Status', 'Shipping'])
    })

    it('should return empty array for undefined', () => {
        const path = getPathFromValue(undefined)

        expect(path).toEqual([])
    })
})

describe('getDisplayLabel', () => {
    it('should extract last segment', () => {
        const label = getDisplayLabel('Status::Shipping::Pending')

        expect(label).toBe('Pending')
    })

    it('should return null for undefined', () => {
        const label = getDisplayLabel(undefined)

        expect(label).toBe(null)
    })
})

describe('isBackButton', () => {
    it('should identify back button options', () => {
        const option = {
            type: OptionType.Back as const,
            id: '__back_button__' as const,
            label: 'Back',
        }

        expect(isBackButton(option)).toBe(true)
    })

    it('should return false for other options', () => {
        const option = {
            type: OptionType.Option as const,
            id: 'test',
            label: 'Test',
            value: 'test',
            path: [],
            hasChildren: false,
        }

        expect(isBackButton(option)).toBe(false)
    })
})

describe('isClearButton', () => {
    it('should identify clear button options', () => {
        const option = {
            type: OptionType.Clear as const,
            id: '__clear_button__' as const,
            label: 'Clear',
        }

        expect(isClearButton(option)).toBe(true)
    })

    it('should return false for other options', () => {
        const option = {
            type: OptionType.Option as const,
            id: 'test',
            label: 'Test',
            value: 'test',
            path: [],
            hasChildren: false,
        }

        expect(isClearButton(option)).toBe(false)
    })
})
