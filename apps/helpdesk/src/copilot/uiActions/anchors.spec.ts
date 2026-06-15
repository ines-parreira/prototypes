import type { SkillReference } from '@gorgias/copilot'
import {
    anchorCandidates,
    COPILOT_ANCHOR_ATTRIBUTE,
    copilotAnchorId,
    copilotAnchorProps,
} from './anchors'

describe('copilotAnchorId', () => {
    it('builds an entity anchor id from type and id', () => {
        expect(copilotAnchorId({ type: 'skill', id: 123 })).toBe('skill:123')
    })

    it('builds a section anchor id when a section is given', () => {
        expect(
            copilotAnchorId({ type: 'skill', id: 123 }, 'instructions'),
        ).toBe('skill:123:instructions')
    })

    it('keeps string ids verbatim (support-action workflow ids)', () => {
        expect(
            copilotAnchorId(
                { type: 'support-action', id: 'wf_abc' },
                'configuration',
            ),
        ).toBe('support-action:wf_abc:configuration')
    })

    it('accepts a full copilot reference and ignores its shop context', () => {
        const reference: SkillReference = {
            type: 'skill',
            id: 42,
            shopType: 'shopify',
            shopName: 'acme',
        }
        expect(copilotAnchorId(reference, 'knowledge')).toBe(
            'skill:42:knowledge',
        )
    })
})

describe('copilotAnchorProps', () => {
    it('returns the anchor id keyed by the data attribute', () => {
        expect(
            copilotAnchorProps({ type: 'guidance', id: 7 }, 'content'),
        ).toEqual({
            [COPILOT_ANCHOR_ATTRIBUTE]: 'guidance:7:content',
        })
    })

    it('uses the data-copilot-anchor attribute name', () => {
        expect(COPILOT_ANCHOR_ATTRIBUTE).toBe('data-copilot-anchor')
        expect(
            Object.keys(copilotAnchorProps({ type: 'ticket', id: 9 })),
        ).toEqual(['data-copilot-anchor'])
    })
})

describe('anchorCandidates', () => {
    it('returns the section anchor first, then the entity fallback', () => {
        expect(
            anchorCandidates({ type: 'skill', id: 123 }, 'instructions'),
        ).toEqual(['skill:123:instructions', 'skill:123'])
    })

    it('returns only the entity anchor when no section is given', () => {
        expect(anchorCandidates({ type: 'opportunity', id: 55 })).toEqual([
            'opportunity:55',
        ])
    })
})
