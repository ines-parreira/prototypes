import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {ShopifyPagesListFixture} from 'pages/settings/contactForm/fixtures/shopifyPage'
import PageEmbedmentForm, {PageEmbedmentFormProps} from '../PageEmbedmentForm'
import {DEFAULT_VALUES} from '../usePageEmbedmentForm'

const baseProps: PageEmbedmentFormProps = {
    dispatch: jest.fn(),
    state: DEFAULT_VALUES,
    modeSelectionTitle: 'Choose where to embed this entity',
    positionSelectionTitle: 'Select the position of the entity',
    shopifyPages: ShopifyPagesListFixture,
}

describe('<PageEmbedmentForm />', () => {
    it('should dispatch the appropriate action for the new page mode', async () => {
        const dispatch = jest.fn()

        render(<PageEmbedmentForm {...baseProps} dispatch={dispatch} />)

        screen.getByText(baseProps.modeSelectionTitle)

        let input = screen.getByTestId('page-name-input')

        await userEvent.type(input, 'A')

        expect(dispatch.mock.lastCall).toMatchInlineSnapshot(`
            [
              {
                "payload": {
                  "error": "",
                  "value": "a",
                },
                "type": "setPageSlug",
              },
            ]
        `)

        expect(dispatch).toHaveBeenCalledTimes(2)

        input = screen.getByTestId('page-slug-input')

        await userEvent.type(input, 'B')

        expect(dispatch.mock.lastCall).toMatchInlineSnapshot(`
            [
              {
                "payload": {
                  "error": "",
                  "isTouched": true,
                  "value": "b",
                },
                "type": "setPageSlug",
              },
            ]
        `)

        expect(dispatch).toHaveBeenCalledTimes(3)
    })

    it('should dispatch the appropriate action for the existing page mode', () => {
        const dispatch = jest.fn()

        render(<PageEmbedmentForm {...baseProps} dispatch={dispatch} />)

        // navigate to existing page mode
        const ctaMode = screen.getByText(/Embed to existing page/i)

        userEvent.click(ctaMode)
        expect(dispatch).toHaveBeenCalledTimes(1)

        expect(dispatch.mock.lastCall).toMatchInlineSnapshot(`
            [
              {
                "payload": "embed-on-existing-page",
                "type": "setEmbedMode",
              },
            ]
        `)

        expect(dispatch).toHaveBeenCalledTimes(1)

        // we verify the component is present, we don't need to test the component itself as it's part of the design system
        screen.getByText('Select a page')

        const ctaPosition = screen.getByText(/bottom/i)

        userEvent.click(ctaPosition)

        expect(dispatch.mock.lastCall).toMatchInlineSnapshot(`
            [
              {
                "payload": "BOTTOM",
                "type": "setPagePosition",
              },
            ]
        `)

        expect(dispatch).toHaveBeenCalledTimes(2)
    })

    it('should go from existing page mode to new page mode if there are no page left', () => {
        const dispatch = jest.fn()

        // render with pages
        const {rerender} = render(
            <PageEmbedmentForm {...baseProps} dispatch={dispatch} />
        )

        // navigate to existing page mode
        const existingCtaMode = screen.getByText(/Embed to existing page/i)
        expect(existingCtaMode).not.toHaveClass('isDisabled')

        userEvent.click(existingCtaMode)
        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(dispatch.mock.lastCall).toMatchInlineSnapshot(`
            [
              {
                "payload": "embed-on-existing-page",
                "type": "setEmbedMode",
              },
            ]
        `)

        // rerender with no pages
        rerender(
            <PageEmbedmentForm
                {...baseProps}
                dispatch={dispatch}
                shopifyPages={[]}
            />
        )

        // verify that we are back to new page mode
        screen.getByText(/Page name/i)
        screen.getByText(/Slug/i)

        // verify that the cta is disabled
        expect(existingCtaMode).toHaveClass('isDisabled')
    })
})
