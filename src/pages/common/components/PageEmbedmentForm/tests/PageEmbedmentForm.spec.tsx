import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ShopifyPagesListFixture } from 'pages/settings/contactForm/fixtures/shopifyPage'

import PageEmbedmentForm, { PageEmbedmentFormProps } from '../PageEmbedmentForm'
import { DEFAULT_VALUES } from '../usePageEmbedmentForm'

const baseProps: PageEmbedmentFormProps = {
    dispatch: jest.fn(),
    state: DEFAULT_VALUES,
    modeSelectionTitle: 'Choose where to embed this entity',
    positionSelectionTitle: 'Select the position of the entity',
    shopifyPages: ShopifyPagesListFixture,
    pageNamePlaceholder: 'Page name',
    pageSlugPlaceholder: 'Slug',
    tooltipText: 'Tooltip text',
}

describe('<PageEmbedmentForm />', () => {
    it('should dispatch the appropriate action for the new page mode', async () => {
        const dispatch = jest.fn()

        render(<PageEmbedmentForm {...baseProps} dispatch={dispatch} />)

        screen.getByText(baseProps.modeSelectionTitle)

        const nameInput = screen.getByLabelText(/Page name/)

        await userEvent.type(nameInput, 'A')

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

        const slugInput = screen.getByLabelText(/Slug/)

        await userEvent.type(slugInput, 'B')

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
        const selectedPage = ShopifyPagesListFixture[1]

        render(
            <PageEmbedmentForm
                {...baseProps}
                state={{
                    ...DEFAULT_VALUES,
                    selectedPage,
                }}
                dispatch={dispatch}
            />,
        )

        // navigate to existing page mode
        const ctaMode = screen.getByText(/Embed to existing page/i)

        act(() => {
            userEvent.click(ctaMode)
        })
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
        screen.getByText(selectedPage.title)

        // select the first page
        const selectPage = screen.getByText('arrow_drop_down')

        act(() => {
            userEvent.click(selectPage)
        })

        const firstPage = screen.getByText(ShopifyPagesListFixture[0].title)

        act(() => {
            fireEvent.click(firstPage)
        })

        expect(dispatch.mock.lastCall).toMatchInlineSnapshot(`
            [
              {
                "payload": {
                  "body_html": "<h1>About us</h1>",
                  "external_id": "12345543211",
                  "title": "About us",
                  "url_path": "about-us",
                },
                "type": "setSelectedPage",
              },
            ]
        `)

        const ctaPosition = screen.getByText(/bottom/i)

        act(() => {
            userEvent.click(ctaPosition)
        })

        expect(dispatch.mock.lastCall).toMatchInlineSnapshot(`
            [
              {
                "payload": "BOTTOM",
                "type": "setPagePosition",
              },
            ]
        `)

        expect(dispatch).toHaveBeenCalledTimes(3)
    })

    it('should go from existing page mode to new page mode if there are no page left', () => {
        const dispatch = jest.fn()

        // render with pages
        const { rerender } = render(
            <PageEmbedmentForm {...baseProps} dispatch={dispatch} />,
        )

        // navigate to existing page mode
        const existingCtaMode = screen.getByLabelText(
            /Embed to existing page/i,
            { selector: 'input' },
        )

        expect(existingCtaMode).toBeEnabled()

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
            />,
        )

        // verify that we are back to new page mode
        screen.getByText(/Page name/i)
        screen.getByText(/Slug/i)

        expect(existingCtaMode).toBeDisabled()
    })
})
