import React from 'react'
import {fireEvent, render, RenderResult, within} from '@testing-library/react'

import ArticleRecommendation from '../ArticleRecommendation'

describe('<ArticleRecommendation />', () => {
    it('calls the onSaveChanges callback', () => {
        const onSaveChanges = jest.fn()
        const {getByText, getByRole} = render(
            <ArticleRecommendation
                associatedShopifyStoreName="my-shop"
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
        fireEvent.click(getByText('Help Center #1'))
        fireEvent.click(getByText('Help Center #2'))
        fireEvent.click(saveButton)

        expect(onSaveChanges).toHaveBeenCalledWith(true, 2)
    })

    describe('when the merchant has no help centers', () => {
        let component: RenderResult

        beforeEach(() => {
            component = render(
                <ArticleRecommendation
                    associatedShopifyStoreName="my-shop"
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
            const {container} = render(
                <ArticleRecommendation
                    associatedShopifyStoreName="my-shop"
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

            const selectedValue = container.getElementsByClassName(
                'select dropdown-toggle selectFullWidth'
            )[0] as HTMLElement
            within(selectedValue).getByText('Help Center #1')
        })
    })

    describe('autoselect closest matching help center', () => {
        it('automatically selects the first help center that contains the shopify store in its name', () => {
            const {container, getByRole} = render(
                <ArticleRecommendation
                    associatedShopifyStoreName="my-shop"
                    initialValues={{
                        isEnabled: false,
                    }}
                    helpCenterList={[
                        {
                            text: 'my-shop-help-center',
                            label: 'my-shop-help-center',
                            value: 'my-shop-help-center',
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
            const switchButton = getByRole('switch')

            fireEvent.click(switchButton)

            const selectedValue = container.getElementsByClassName(
                'select dropdown-toggle selectFullWidth'
            )[0] as HTMLElement
            within(selectedValue).getByText('my-shop-help-center')
        })

        it('automatically selects the first help center of the list if none contains the shopify store in its name', () => {
            const {getByRole, container} = render(
                <ArticleRecommendation
                    associatedShopifyStoreName="my-shop"
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
                        {
                            text: 'Help Center #2',
                            label: 'Help Center #2',
                            value: 'Help Center #2',
                            id: 2,
                        },
                        {
                            text: 'Help Center #3',
                            label: 'Help Center #3',
                            value: 'Help Center #3',
                            id: 3,
                        },
                    ]}
                    onSaveChanges={jest.fn()}
                />
            )
            const switchButton = getByRole('switch')

            fireEvent.click(switchButton)

            const selectedValue = container.getElementsByClassName(
                'select dropdown-toggle selectFullWidth'
            )[0] as HTMLElement
            within(selectedValue).getByText('Help Center #1')
        })
    })

    describe('when the article recommendation switch is on', () => {
        it('shows the help center select input', () => {
            const {container, getByText} = render(
                <ArticleRecommendation
                    associatedShopifyStoreName="my-shop"
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

        it('shows a warning if more than 1 help center', () => {
            const {getByText} = render(
                <ArticleRecommendation
                    associatedShopifyStoreName="my-shop"
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

            getByText(
                'You have more than 1 help center. Ensure the desired help center is selected below.'
            )
        })

        it('does not show a warning if exactly 1 help center', () => {
            const {queryByText} = render(
                <ArticleRecommendation
                    associatedShopifyStoreName="my-shop"
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

            expect(
                queryByText(
                    'You have more than 1 help center. Ensure the desired help center is selected below.'
                )
            ).toBeNull()
        })
    })

    describe('when the article recommendation switch is off', () => {
        it('does not show the help center select input', () => {
            const {container, queryByText} = render(
                <ArticleRecommendation
                    associatedShopifyStoreName="my-shop"
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
