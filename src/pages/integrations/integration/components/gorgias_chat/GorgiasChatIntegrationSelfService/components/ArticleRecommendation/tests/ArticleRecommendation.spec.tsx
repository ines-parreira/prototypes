import React from 'react'
import {fireEvent, render, RenderResult} from '@testing-library/react'

import ArticleRecommendation from '../ArticleRecommendation'

describe('<ArticleRecommendation />', () => {
    it('enables the "Save Changes" only if the changes are valid', () => {
        const {getByText, getByRole} = render(
            <ArticleRecommendation
                initialValues={{
                    isEnabled: true,
                }}
                helpCenterList={[
                    {
                        text: 'Help Center #1',
                        label: 'Help Center #1',
                        value: 'Help Center #1',
                        id: 1,
                    },
                    {
                        text: 'Help Center #2',
                        label: 'Help Center #2',
                        value: 'Help Center #2',
                        id: 2,
                    },
                ]}
                onSaveChanges={jest.fn()}
            />
        )

        const saveButton = getByText('Save Changes') as HTMLButtonElement
        const switchButton = getByRole('switch')

        expect(saveButton.disabled).toBeTruthy()

        fireEvent.click(switchButton)

        expect(saveButton.disabled).toBeFalsy()
    })

    it('calls the onSaveChanges callback', () => {
        const onSaveChanges = jest.fn()
        const {getByText, getByRole} = render(
            <ArticleRecommendation
                helpCenterList={[
                    {
                        text: 'Help Center #1',
                        label: 'Help Center #1',
                        value: 'Help Center #1',
                        id: 1,
                    },
                    {
                        text: 'Help Center #2',
                        label: 'Help Center #2',
                        value: 'Help Center #2',
                        id: 2,
                    },
                ]}
                onSaveChanges={onSaveChanges}
            />
        )

        const saveButton = getByText('Save Changes') as HTMLButtonElement
        const switchButton = getByRole('switch')

        fireEvent.click(switchButton)
        fireEvent.click(getByText('Select an option'))
        fireEvent.click(getByText('Help Center #1'))
        fireEvent.click(saveButton)

        expect(onSaveChanges).toHaveBeenCalledWith(true, 1)
    })

    describe('when the merchant has no help centers', () => {
        let component: RenderResult

        beforeEach(() => {
            component = render(
                <ArticleRecommendation
                    helpCenterList={[]}
                    onSaveChanges={jest.fn()}
                />
            )
        })

        it('displays the info alert', () => {
            component.getByText(
                'Create a Help Center and add articles to enable this feature.'
            )
        })

        it('disables the article recommendation switch', () => {
            /**
             *    Not the best implementation but the <input type="checkbox">
             * has the disabled property all the time.
             */
            expect(
                component.container.querySelector(
                    '#article-recommendation-switch[aria-disabled="true"]'
                )
            ).toBeTruthy()
        })
    })

    describe('when the merchant has a single help center', () => {
        it('automatically selects the help center', () => {
            const {getByText} = render(
                <ArticleRecommendation
                    initialValues={{
                        isEnabled: true,
                    }}
                    helpCenterList={[
                        {
                            text: 'Help Center #1',
                            label: 'Help Center #1',
                            value: 'Help Center #1',
                            id: 1,
                        },
                    ]}
                    onSaveChanges={jest.fn()}
                />
            )

            getByText('Help Center #1')
        })
    })

    describe('when the article recommendation switch is on', () => {
        it('shows the help center select input', () => {
            const {container, getByText} = render(
                <ArticleRecommendation
                    initialValues={{
                        isEnabled: true,
                    }}
                    helpCenterList={[
                        {
                            text: 'Help Center #1',
                            label: 'Help Center #1',
                            value: 'Help Center #1',
                            id: 1,
                        },
                    ]}
                    onSaveChanges={jest.fn()}
                />
            )

            getByText('Help Center')
            expect(container.getElementsByClassName('dropdown').length).toBe(1)
        })
    })

    describe('when the article recommendation switch is off', () => {
        it('does not show the help center select input', () => {
            const {container, queryByText} = render(
                <ArticleRecommendation
                    initialValues={{
                        isEnabled: false,
                    }}
                    helpCenterList={[
                        {
                            text: 'Help Center #1',
                            label: 'Help Center #1',
                            value: 'Help Center #1',
                            id: 1,
                        },
                    ]}
                    onSaveChanges={jest.fn()}
                />
            )

            expect(queryByText('Help Center')).toBeNull()
            expect(container.getElementsByClassName('dropdown').length).toBe(0)
        })
    })
})
