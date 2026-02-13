import { OptionEnum } from '../../types'
import {
    buildTreeFromChoices,
    flattenTreeWithCaptions,
    getDisplayLabel,
    getOptionsAtPath,
    getPathFromValue,
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

    it('should handle boolean choices', () => {
        const choices = [true, false]
        const tree = buildTreeFromChoices(choices)

        expect(tree.size).toBe(2)
        expect(tree.has('boolean.true')).toBe(true)
        expect(tree.has('boolean.false')).toBe(true)
        expect(tree.get('boolean.true')!.value).toBe(true)
        expect(tree.get('boolean.false')!.value).toBe(false)
    })

    it('should handle other types choices', () => {
        const choices = [1, 42]
        //@ts-ignore
        const tree = buildTreeFromChoices(choices)

        expect(tree.size).toBe(2)
        expect(tree.has('1')).toBe(true)
        expect(tree.has('42')).toBe(true)
        expect(tree.get('1')!.value).toBe(1)
        expect(tree.get('42')!.value).toBe(42)
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

    it('should show "Yes" and "No" labels for boolean choices', () => {
        const tree = buildTreeFromChoices([true, false])

        const options = getOptionsAtPath(tree, [])

        expect(options).toHaveLength(2)
        expect(options[0].label).toBe('Yes')
        expect(options[0].value).toBe(true)
        expect(options[1].label).toBe('No')
        expect(options[1].value).toBe(false)
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
            type: OptionEnum.Option,
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

    it('should return "Yes" for true', () => {
        const label = getDisplayLabel(true)

        expect(label).toBe('Yes')
    })

    it('should return "No" for false', () => {
        const label = getDisplayLabel(false)

        expect(label).toBe('No')
    })

    it('should return string representation for numbers', () => {
        //@ts-ignore
        expect(getDisplayLabel(42)).toBe('42')
        //@ts-ignore
        expect(getDisplayLabel(0)).toBe('0')
    })

    it('should return full path with " > " separator when fullValue is true', () => {
        const label = getDisplayLabel('Status::Shipping::Pending', true)

        expect(label).toBe('Status > Shipping > Pending')
    })
})
