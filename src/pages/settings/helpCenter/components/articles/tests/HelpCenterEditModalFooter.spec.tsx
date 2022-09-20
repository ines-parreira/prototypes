import React, {ComponentProps} from 'react'
import {render, fireEvent, waitFor, within} from '@testing-library/react'

import HelpCenterEditModalFooter from '../HelpCenterEditModalFooter'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useAbilityChecker: () => ({isPassingRulesCheck: () => true}),
}))

const mockedOnSave = jest.fn()
const mockedOnDelete = jest.fn()
const mockedOnDiscard = jest.fn()

describe('<HelpCenterEditModalFooter />', () => {
    const props: ComponentProps<typeof HelpCenterEditModalFooter> = {
        rating: {
            up: 15,
            down: 2,
        },
        canSave: true,
        requiredFields: [],
        onDiscard: mockedOnDiscard,
        counters: {charCount: 1752},
        articleMode: {
            mode: 'modified',
            onSave: mockedOnSave,
            onDelete: mockedOnDelete,
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the component correctly', () => {
        const {container} = render(<HelpCenterEditModalFooter {...props} />)

        expect(container).toMatchSnapshot()
    })

    it('allows to save and publish an existing modified article', () => {
        const {getByRole} = render(
            <HelpCenterEditModalFooter {...props} canSave={true} />
        )

        const saveAndPublish = getByRole('button', {name: /Save & Publish/i})
        fireEvent.click(saveAndPublish)

        expect(mockedOnSave).toHaveBeenCalledTimes(1)
        expect(mockedOnSave).toHaveBeenLastCalledWith(true)
    })

    it('allows to publish an unchanged and unpublished article', () => {
        const mockedOnPublish = jest.fn()

        const {getByRole} = render(
            <HelpCenterEditModalFooter
                {...{
                    ...props,
                    articleMode: {
                        mode: 'unchanged_not_published',
                        onPublish: mockedOnPublish,
                        onDelete: mockedOnDelete,
                    },
                }}
                canSave={true}
            />
        )

        const publish = getByRole('button', {name: /Publish/i})
        fireEvent.click(publish)

        expect(mockedOnPublish).toHaveBeenCalledTimes(1)
        expect(mockedOnPublish).toHaveBeenCalledTimes(1)
    })

    it('allows to create and publish a new article', () => {
        const mockedOnCreate = jest.fn()

        const {getByRole} = render(
            <HelpCenterEditModalFooter
                {...{
                    ...props,
                    articleMode: {
                        mode: 'new',
                        onCreate: mockedOnCreate,
                    },
                }}
                canSave={true}
            />
        )

        const createAndPublish = getByRole('button', {
            name: /Create & Publish/i,
        })
        fireEvent.click(createAndPublish)

        expect(mockedOnCreate).toHaveBeenLastCalledWith(true)
    })

    it('only displays disabled published button if article is published and unchanged', () => {
        const {getByRole} = render(
            <HelpCenterEditModalFooter
                {...{
                    ...props,
                    articleMode: {
                        mode: 'unchanged_published',
                        onDelete: mockedOnDelete,
                    },
                }}
                canSave={false}
            />
        )

        getByRole('button', {
            name: /Published/i,
        }).hasAttribute('disabled')
    })

    it('should trigger onDelete when confirming the delete action', () => {
        const {getByRole, getByText} = render(
            <HelpCenterEditModalFooter {...props} />
        )

        const deleteBtn = getByRole('button', {name: /Delete Article/i})
        fireEvent.click(deleteBtn)

        void waitFor(() =>
            getByText('Are you sure you want to delete this article?')
        )

        const dialogModal = getByRole('dialog')
        const confirmButton = within(dialogModal).getByText(/Delete article/i)

        fireEvent.click(confirmButton)

        expect(mockedOnDelete).toHaveBeenCalledTimes(1)
    })

    it('should trigger onDiscard when clicking on discard button', () => {
        const {getByRole} = render(<HelpCenterEditModalFooter {...props} />)

        const discardBtn = getByRole('button', {name: /Discard changes/i})
        fireEvent.click(discardBtn)

        expect(mockedOnDiscard).toHaveBeenCalledTimes(1)
    })
})
