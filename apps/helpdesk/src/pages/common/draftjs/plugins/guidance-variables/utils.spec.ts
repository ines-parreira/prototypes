import { ContentState, EditorState } from 'draft-js'

import logoGorgias from 'assets/img/icons/gorgias-icon-logo-black.png'
import logoShopify from 'assets/img/integrations/shopify.svg'

import { attachGuidanceVariableEntities, pickCategoryLogo } from './utils'

describe('attachGuidanceVariableEntities', () => {
    const buildUnfocusedState = (text: string) =>
        EditorState.createWithContent(ContentState.createFromText(text))

    it('attaches guidance_variable entities to externally-set content without stealing focus', () => {
        const state = buildUnfocusedState('Hi &&&customer.name&&&')

        const result = attachGuidanceVariableEntities(state)

        const contentState = result.getCurrentContent()
        const block = contentState.getFirstBlock()
        const entityKey = block.getEntityAt(6)
        expect(entityKey).not.toBeNull()
        expect(contentState.getEntity(entityKey).getType()).toBe(
            'guidance_variable',
        )
        // Syncing external content must not focus the editor, otherwise it would
        // steal focus from wherever the user actually is.
        expect(result.getSelection().getHasFocus()).toBe(false)
    })

    it('returns the same editor state when there are no guidance variables', () => {
        const state = buildUnfocusedState('No variables here')

        expect(attachGuidanceVariableEntities(state)).toBe(state)
    })

    it('is idempotent when entities are already attached', () => {
        const state = buildUnfocusedState('Hi &&&customer.name&&&')

        const once = attachGuidanceVariableEntities(state)
        const twice = attachGuidanceVariableEntities(once)

        expect(twice).toBe(once)
    })
})

describe('pickCategoryLogo', () => {
    it('should return Gorgias logo for ticket category', () => {
        const result = pickCategoryLogo('ticket')

        expect(result).toEqual({
            src: logoGorgias,
            alt: 'gorgias logo',
        })
    })

    it('should return Gorgias logo for TICKET category (case insensitive)', () => {
        const result = pickCategoryLogo('TICKET')

        expect(result).toEqual({
            src: logoGorgias,
            alt: 'gorgias logo',
        })
    })

    it('should return Gorgias logo for Ticket category (mixed case)', () => {
        const result = pickCategoryLogo('Ticket')

        expect(result).toEqual({
            src: logoGorgias,
            alt: 'gorgias logo',
        })
    })

    it('should return Shopify logo for customer category', () => {
        const result = pickCategoryLogo('customer')

        expect(result).toEqual({
            src: logoShopify,
            alt: 'shopify logo',
        })
    })

    it('should return Shopify logo for order category', () => {
        const result = pickCategoryLogo('order')

        expect(result).toEqual({
            src: logoShopify,
            alt: 'shopify logo',
        })
    })

    it('should return Shopify logo for unknown category', () => {
        const result = pickCategoryLogo('unknown')

        expect(result).toEqual({
            src: logoShopify,
            alt: 'shopify logo',
        })
    })

    it('should return Shopify logo for empty string', () => {
        const result = pickCategoryLogo('')

        expect(result).toEqual({
            src: logoShopify,
            alt: 'shopify logo',
        })
    })
})
