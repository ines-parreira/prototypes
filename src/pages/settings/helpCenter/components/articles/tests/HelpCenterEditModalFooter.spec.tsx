import React, { ComponentProps } from 'react'

import { fireEvent, render, waitFor, within } from '@testing-library/react'

import HelpCenterEditModalFooter from '../HelpCenterEditModalFooter'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useAbilityChecker: () => ({ isPassingRulesCheck: () => true }),
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
        counters: { charCount: 1752 },
        articleMode: {
            mode: 'modified',
            onSave: mockedOnSave,
            onDelete: mockedOnDelete,
        },
        isDraftAllowed: true,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the component correctly', () => {
        const { container } = render(<HelpCenterEditModalFooter {...props} />)

        expect(container).toMatchSnapshot()
    })

    it('allows to save and publish an existing modified article', () => {
        const { getByRole } = render(
            <HelpCenterEditModalFooter {...props} canSave={true} />,
        )

        const saveAndPublish = getByRole('button', { name: /Save & Publish/i })
        fireEvent.click(saveAndPublish)

        expect(mockedOnSave).toHaveBeenCalledTimes(1)
        expect(mockedOnSave).toHaveBeenLastCalledWith(true)
    })

    it('allows to publish an unchanged and unpublished article', () => {
        const mockedOnPublish = jest.fn()

        const { getByRole } = render(
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
            />,
        )

        const publish = getByRole('button', { name: /Publish/i })
        fireEvent.click(publish)

        expect(mockedOnPublish).toHaveBeenCalledTimes(1)
        expect(mockedOnPublish).toHaveBeenCalledTimes(1)
    })

    it('allows to create and publish a new article', () => {
        const mockedOnCreate = jest.fn()

        const { getByRole } = render(
            <HelpCenterEditModalFooter
                {...{
                    ...props,
                    articleMode: {
                        mode: 'new',
                        onCreate: mockedOnCreate,
                    },
                }}
                canSave={true}
            />,
        )

        const createAndPublish = getByRole('button', {
            name: /Save & Publish/i,
        })
        fireEvent.click(createAndPublish)

        expect(mockedOnCreate).toHaveBeenLastCalledWith(true)
    })

    it('only displays disabled published button if article is published and unchanged', () => {
        const { getByRole } = render(
            <HelpCenterEditModalFooter
                {...{
                    ...props,
                    articleMode: {
                        mode: 'unchanged_published',
                        onDelete: mockedOnDelete,
                    },
                }}
                canSave={false}
            />,
        )

        getByRole('button', {
            name: /Published/i,
        }).hasAttribute('disabled')
    })

    it('should trigger onDelete when confirming the delete action', () => {
        const { getByRole, getByText } = render(
            <HelpCenterEditModalFooter {...props} />,
        )

        const deleteBtn = getByRole('button', { name: /Delete Article/i })
        fireEvent.click(deleteBtn)

        void waitFor(() =>
            getByText('Are you sure you want to delete this article?'),
        )

        const dialogModal = getByRole('dialog')
        const confirmButton = within(dialogModal).getByText(/Delete article/i)

        fireEvent.click(confirmButton)

        expect(mockedOnDelete).toHaveBeenCalledTimes(1)
    })

    it('should trigger onDiscard when clicking on discard button', () => {
        const { getByRole } = render(<HelpCenterEditModalFooter {...props} />)

        const discardBtn = getByRole('button', { name: /Discard changes/i })
        fireEvent.click(discardBtn)

        expect(mockedOnDiscard).toHaveBeenCalledTimes(1)
    })

    it('should render customContent when present and not render rating', () => {
        const customContent = <div>Custom Footer Content</div>

        const { getByText, queryByText, queryByAltText } = render(
            <HelpCenterEditModalFooter
                {...props}
                customContent={customContent}
            />,
        )

        expect(getByText('Custom Footer Content')).toBeInTheDocument()

        expect(queryByText('Rating:')).not.toBeInTheDocument()
        expect(queryByAltText('star')).not.toBeInTheDocument()
        expect(queryByAltText('up')).not.toBeInTheDocument()
        expect(queryByAltText('down')).not.toBeInTheDocument()
    })

    it('should render rating when customContent is not present', () => {
        const { getByText, getByAltText } = render(
            <HelpCenterEditModalFooter {...props} />,
        )

        expect(getByText('Rating:')).toBeInTheDocument()
        expect(getByAltText('star')).toBeInTheDocument()
        expect(getByAltText('up')).toBeInTheDocument()
        expect(getByAltText('down')).toBeInTheDocument()
        expect(getByText('15')).toBeInTheDocument() // rating.up value
        expect(getByText('2')).toBeInTheDocument() // rating.down value
    })

    it('should render only save and publish button without dropdown when isDraftAllowed is false', () => {
        const { getByRole, queryByRole } = render(
            <HelpCenterEditModalFooter {...props} isDraftAllowed={false} />,
        )

        const saveAndPublishButton = getByRole('button', {
            name: /Save & Publish/i,
        })
        expect(saveAndPublishButton).toBeInTheDocument()
        expect(saveAndPublishButton).not.toBeDisabled()

        // Dropdown toggle should not be present when isDraftAllowed is false
        const dropdownToggle = queryByRole('button', {
            name: /arrow_drop_down/i,
        })
        expect(dropdownToggle).not.toBeInTheDocument()

        fireEvent.click(saveAndPublishButton)

        expect(mockedOnSave).toHaveBeenCalledTimes(1)
        expect(mockedOnSave).toHaveBeenCalledWith(true)
    })

    it('should render only save and publish button without dropdown for new articles when isDraftAllowed is false', () => {
        const mockedOnCreate = jest.fn()

        const { getByRole, queryByRole } = render(
            <HelpCenterEditModalFooter
                {...{
                    ...props,
                    articleMode: {
                        mode: 'new',
                        onCreate: mockedOnCreate,
                    },
                }}
                isDraftAllowed={false}
            />,
        )

        const saveAndPublishButton = getByRole('button', {
            name: /Save & Publish/i,
        })
        expect(saveAndPublishButton).toBeInTheDocument()
        expect(saveAndPublishButton).not.toBeDisabled()

        // Dropdown toggle should not be present when isDraftAllowed is false
        const dropdownToggle = queryByRole('button', {
            name: /arrow_drop_down/i,
        })
        expect(dropdownToggle).not.toBeInTheDocument()

        fireEvent.click(saveAndPublishButton)

        expect(mockedOnCreate).toHaveBeenCalledTimes(1)
        expect(mockedOnCreate).toHaveBeenCalledWith(true)
    })
})
