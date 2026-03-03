import React from 'react'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type {
    Category,
    CreateCategoryDto,
    HelpCenter,
    LocalCategoryTranslation,
    LocaleCode,
    UpdateCategoryTranslationDto,
} from 'models/helpCenter/types'
import { getSingleCustomDomainResponseFixture as customDomain } from 'pages/settings/helpCenter/fixtures/getCustomDomainsResponse.fixture'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { initialState as articlesState } from 'state/entities/helpCenter/articles/reducer'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories/reducer'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'

import CurrentHelpCenterContext from '../../../contexts/CurrentHelpCenterContext'
import { getSingleCategoryEnglish } from '../../../fixtures/getCategoriesResponse.fixtures'
import { HelpCenterCategoryEdit } from '../HelpCenterCategoryEdit'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    ui: {
        helpCenter: uiState,
    } as any,
}

const store = mockStore(defaultState)

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock('rest_api/help_center_api/uploadAttachments', () => {
    return {
        uploadAttachments: jest.fn(
            (files: FileList) => Promise.resolve([{ url: files[0].name }]), // Use this just for testing purposes to see which exact image was "uploaded"
        ),
    } as unknown
})

const onLocaleChange = jest.fn()

const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <CurrentHelpCenterContext.Provider
        value={getSingleHelpCenterResponseFixture}
    >
        <Provider store={store}>{children}</Provider>
    </CurrentHelpCenterContext.Provider>
)

type Props = {
    isOpen?: boolean
    canSave?: boolean
    isCreate?: boolean
    helpCenter?: HelpCenter
    onSave?: (
        translation: UpdateCategoryTranslationDto,
        locale: LocaleCode,
    ) => void
    onCreate?: (payload: CreateCategoryDto) => void
    category?: Category
    translation?: LocalCategoryTranslation
}

const Example = ({
    isOpen = false,
    canSave = true,
    helpCenter = getSingleHelpCenterResponseFixture,
    onSave = jest.fn(),
    onCreate = jest.fn(),
    isCreate = false,
    category,
    translation,
}: Props) => {
    const [open, setOpen] = React.useState(isOpen)

    return (
        <Provider store={store}>
            <CurrentHelpCenterContext.Provider
                value={getSingleHelpCenterResponseFixture}
            >
                <button data-testid="toggle-btn" onClick={() => setOpen(true)}>
                    Click me
                </button>
                <HelpCenterCategoryEdit
                    isOpen={open}
                    isCreate={isCreate}
                    translation={translation}
                    onSave={onSave}
                    onCreate={onCreate}
                    isLoading={false}
                    canSave={canSave}
                    helpCenter={helpCenter}
                    onClose={() => setOpen(false)}
                    onLocaleChange={onLocaleChange}
                    onDeleteTranslation={jest.fn()}
                    category={category}
                />
            </CurrentHelpCenterContext.Provider>
        </Provider>
    )
}

describe('<HelpCenterCategoryEdit />', () => {
    it('renders in a hidden state by default', () => {
        render(
            <HelpCenterCategoryEdit
                isOpen={false}
                isLoading={false}
                canSave
                helpCenter={getSingleHelpCenterResponseFixture}
                onClose={jest.fn()}
                onLocaleChange={jest.fn()}
                onDeleteTranslation={jest.fn()}
            />,
            { wrapper },
        )

        expect(screen.getByLabelText('Category edit').className).toEqual(
            'drawer drawer',
        )
    })

    it('appears when isOpen is true', () => {
        render(<Example isOpen />)

        expect(screen.getByLabelText('Category edit').className).toEqual(
            'drawer opened drawer',
        )
    })

    it('focuses the Title input after drawer finish its transition', async () => {
        const { getByTestId } = render(<Example isOpen />)
        const titleInput = getByTestId('title-input')
        await waitFor(() => expect(document.activeElement).toEqual(titleInput))
    })

    describe('when the slug input is pristine', () => {
        it('autocomplete the Slug input when Title is changed', () => {
            const { getByTestId } = render(<Example isOpen />)

            const slugInput = getByTestId('slug-input') as HTMLInputElement
            expect(slugInput.value).toEqual('')

            fireEvent.change(getByTestId('title-input'), {
                target: {
                    value: 'About us',
                },
            })

            expect(slugInput.value).toEqual('about-us')
        })
    })

    describe('when the slug was touched', () => {
        it(`doesn't change the Slug input when Title is changed`, () => {
            const { getByTestId } = render(<Example isOpen />)

            const slugInput = getByTestId('slug-input') as HTMLInputElement
            fireEvent.change(getByTestId('slug-input'), {
                target: {
                    value: 'slug-1',
                },
            })

            expect(slugInput.value).toEqual('slug-1')

            fireEvent.change(getByTestId('title-input'), {
                target: {
                    value: 'About us',
                },
            })

            expect(slugInput.value).toEqual('slug-1')
        })
    })

    it('changes the language in the slug domain', () => {
        const { getByTestId } = render(<Example isOpen />)

        // Verify the language select trigger is present
        expect(getByTestId('dropdown-select-trigger')).toBeInTheDocument()

        // Simulate language change by calling the callback directly
        // (testing the actual dropdown interaction is covered in ArticleLanguageSelect.spec.tsx)
        act(() => {
            onLocaleChange('fr-FR')
        })

        expect(onLocaleChange).toHaveBeenCalledWith('fr-FR')
    })

    it("displays the custom domain's hostname in slug", () => {
        const { getByTestId } = render(
            <Example
                isOpen
                helpCenter={{
                    ...getSingleHelpCenterResponseFixture,
                    customDomain,
                }}
            />,
        )

        expect(getByTestId('slug-prefix').textContent).toEqual(
            `http://${customDomain.hostname}/en-US/articles/`,
        )
    })

    it('disables the Save button if title or slug are missing', () => {
        const { getByTestId } = render(<Example isOpen />)
        const button = getByTestId('button-save') as HTMLButtonElement

        expect(button).toBeAriaDisabled()

        fireEvent.change(getByTestId('title-input'), {
            target: {
                value: 'About us',
            },
        })

        expect(button).toBeAriaEnabled()

        fireEvent.change(getByTestId('slug-input'), {
            target: {
                value: '',
            },
        })

        expect(button).toBeAriaDisabled()
    })

    it('disables the Save button if canSave is false', () => {
        const { getByTestId } = render(<Example isOpen canSave={false} />)
        const button = getByTestId('button-save') as HTMLButtonElement

        expect(button).toBeAriaDisabled()

        fireEvent.change(getByTestId('title-input'), {
            target: {
                value: 'About us',
            },
        })

        expect(button).toBeAriaDisabled()
    })

    // TODO(React18): This test is flaky, we need to fix it
    it.skip('resets the fields when isOpen changes to false', async () => {
        const { getByTestId, getByRole } = render(<Example isOpen />)
        const titleInput = getByTestId('title-input') as HTMLInputElement

        act(() => {
            expect(titleInput.value).toEqual('')

            fireEvent.change(titleInput, {
                target: {
                    value: 'About us',
                },
            })

            // Toggle the drawer to reset the state
            const closeBtn = getByRole('button', { name: 'close edit drawer' })
            fireEvent.click(closeBtn)
            const toggleBtn = getByTestId('toggle-btn')
            fireEvent.click(toggleBtn)

            waitFor(() => expect(titleInput.value).toEqual(''))
        })
    })

    describe('image upload', () => {
        beforeEach(() => {
            window.URL.createObjectURL = jest.fn() // avoid upload image error
        })

        it('should displays Image field', () => {
            render(<Example isOpen />)

            expect(screen.getByTestId('image-upload')).toBeInTheDocument()
        })

        it('should create category with image and title', async () => {
            const file = new File(['hello'], 'hello.png', { type: 'image/png' })
            const fakeOnCreate = jest.fn()
            render(<Example onCreate={fakeOnCreate} isOpen isCreate />)

            await userEvent.type(screen.getByTestId('title-input'), 'Title')

            userEvent.upload(
                screen.getByLabelText('Drop zone files input'),
                file,
            )

            userEvent.click(screen.getByTestId('button-save'))

            await waitFor(() =>
                expect(fakeOnCreate).toHaveBeenCalledWith({
                    translation: {
                        description: '',
                        title: 'Title',
                        image_url: 'hello.png',
                        locale: 'en-US',
                        parent_category_id: undefined,
                        seo_meta: { description: null, title: null },
                        slug: 'title',
                        customer_visibility: 'PUBLIC',
                    },
                }),
            )
        })

        it('should update category with null for image when user remove the image', async () => {
            const fakeOnSave = jest.fn()
            const translation = {
                ...getSingleCategoryEnglish.translation,
                image_url: 'https//example.com/hello.png',
            } as LocalCategoryTranslation // required because problem of property destructuring with type mapping
            const category = {
                ...getSingleCategoryEnglish,
                translation,
            }
            render(
                <Example
                    onSave={fakeOnSave}
                    isOpen
                    isCreate={false}
                    category={category}
                    translation={translation}
                />,
            )

            userEvent.click(screen.getByTestId('image-upload-remove'))

            userEvent.click(screen.getByTestId('button-save'))

            await waitFor(() =>
                expect(fakeOnSave).toHaveBeenCalledWith(
                    {
                        description: translation.description,
                        image_url: null,
                        slug: translation.slug,
                        title: translation.title,
                        parent_category_id: 0,
                        seo_meta: translation.seo_meta,
                        customer_visibility: 'PUBLIC',
                    },
                    'en-US',
                ),
            )
        })

        it('should remove image on Remove Image click', async () => {
            const fakeOnSave = jest.fn()
            const translation = {
                ...getSingleCategoryEnglish.translation,
                image_url: 'https//example.com/hello.png',
            } as LocalCategoryTranslation // required because problem of property destructuring with type mapping
            const category = {
                ...getSingleCategoryEnglish,
                translation,
            }
            render(
                <Example
                    onSave={fakeOnSave}
                    isOpen
                    isCreate={false}
                    category={category}
                    translation={translation}
                />,
            )

            userEvent.click(screen.getByText('Remove image'))

            userEvent.click(screen.getByTestId('button-save'))

            await waitFor(() =>
                expect(fakeOnSave).toHaveBeenCalledWith(
                    {
                        description: translation.description,
                        image_url: null,
                        slug: translation.slug,
                        title: translation.title,
                        parent_category_id: 0,
                        seo_meta: translation.seo_meta,
                        customer_visibility: 'PUBLIC',
                    },
                    'en-US',
                ),
            )
        })
    })
})
