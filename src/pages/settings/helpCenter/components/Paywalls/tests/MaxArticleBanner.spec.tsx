import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import MaxArticleBanner from '../MaxArticleBanner'

describe('MaxArticleBanner', () => {
    it('should not render the banner', () => {
        const {container} = render(
            <MaxArticleBanner
                maxArticles={5}
                warningThreshold={4}
                nbArticles={3}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the banner with a warning', () => {
        const {container} = render(
            <MaxArticleBanner
                maxArticles={5}
                warningThreshold={4}
                nbArticles={4}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the banner with the max articles limitation', () => {
        const {container} = render(
            <MaxArticleBanner
                maxArticles={5}
                warningThreshold={4}
                nbArticles={5}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the banner with the max articles limitation if the user dismissed the warning one', async () => {
        const {rerender, findByRole, queryByRole} = render(
            <MaxArticleBanner
                maxArticles={5}
                warningThreshold={4}
                nbArticles={4}
            />
        )

        const closeButton = await findByRole('button', {
            name: /close/i,
        })

        fireEvent.click(closeButton)

        expect(
            queryByRole('button', {
                name: /contact us/i,
            })
        ).toBeNull()

        rerender(
            <MaxArticleBanner
                maxArticles={5}
                warningThreshold={4}
                nbArticles={5}
            />
        )

        expect(
            queryByRole('button', {
                name: /contact us/i,
            })
        ).toBeDefined()
    })

    it('should dismiss the banner if the user deletes articles', () => {
        const {rerender, queryByRole} = render(
            <MaxArticleBanner
                maxArticles={5}
                warningThreshold={4}
                nbArticles={4}
            />
        )

        expect(
            queryByRole('button', {
                name: /contact us/i,
            })
        ).toBeDefined()

        rerender(
            <MaxArticleBanner
                maxArticles={5}
                warningThreshold={4}
                nbArticles={3}
            />
        )

        expect(
            queryByRole('button', {
                name: /contact us/i,
            })
        ).toBeDefined()
    })
})
