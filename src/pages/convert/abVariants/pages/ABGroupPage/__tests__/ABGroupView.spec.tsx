import React from 'react'
import {fromJS} from 'immutable'

import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {act, createEvent, fireEvent} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {QueryClientProvider} from '@tanstack/react-query'
import routerDom, {useParams} from 'react-router-dom'

import configureMockStore from 'redux-mock-store'
import {mockFlags} from 'jest-launchdarkly-mock'

import {createMemoryHistory} from 'history'

import {
    campaignWithABGroup,
    variants as variantsFixture,
} from 'fixtures/abGroup'
import {entitiesInitialState} from 'fixtures/entities'
import {integrationsState} from 'fixtures/integrations'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'

import {
    useGetCampaign,
    useUpdateCampaign,
} from 'models/convert/campaign/queries'
import {RootState, StoreDispatch} from 'state/types'
import {getLDClient} from 'utils/launchDarkly'
import {assumeMock, renderWithRouter} from 'utils/testing'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {
    abVariantAddUrl,
    abVariantControlVariantUrl,
    abVariantEditorUrl,
    abVariantsUrl,
} from 'pages/convert/abVariants/urls'

import {ABGroupView} from '../ABGroupPage'

jest.mock('utils/launchDarkly')

jest.mock('models/convert/campaign/queries')
const useUpdateCampaignMock = assumeMock(useUpdateCampaign)
const useGetCampaignMock = assumeMock(useGetCampaign)

jest.mock('pages/common/hooks/useIsConvertSubscriber')
const useIsConvertSubscriberMock = assumeMock(useIsConvertSubscriber)

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))
const useParamsMock = useParams as jest.Mock

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const defaultState = {
    entities: entitiesInitialState,
    integrations: fromJS(integrationsState),
} as RootState

const defaultStore = mockStore(defaultState)
const queryClient = mockQueryClient()

const renderComponent = (props: any, route?: string) => {
    const history = createMemoryHistory({
        initialEntries: [route ?? '/'],
    })
    return renderWithRouter(
        <Provider store={defaultStore}>
            <QueryClientProvider client={queryClient}>
                <ABGroupView {...props} />
            </QueryClientProvider>
        </Provider>,
        {
            history,
        }
    )
}

describe('ABGroupView', () => {
    const integrationId = '8'
    const updateCampaignMock = jest.fn()

    const mockRange = {
        selectNodeContents: jest.fn(),
        setStart: jest.fn(),
        setEnd: jest.fn(),
    }
    const mockSelection = {
        removeAllRanges: jest.fn(),
        addRange: jest.fn(),
        getRangeAt: () => ({
            setEnd: jest.fn(),
            cloneRange: jest.fn(),
        }),
    }

    beforeAll(() => {
        useParamsMock.mockReturnValue({
            id: integrationId,
            campaignId: 'some-value',
        })

        useIsConvertSubscriberMock.mockImplementation(() => true)

        mockFlags({})

        const allFlagsMock = getLDClient().allFlags as jest.Mock
        allFlagsMock.mockReturnValue({})

        window.HTMLElement.prototype.scrollTo = jest.fn()

        // It is used by draft-js somewhere deep in code
        jest.spyOn(document, 'createRange').mockReturnValue(mockRange as any)
        jest.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any)
    })

    beforeEach(() => {
        useGetCampaignMock.mockReturnValue({data: campaignWithABGroup} as any)
        useUpdateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: updateCampaignMock,
            } as unknown as ReturnType<typeof useUpdateCampaign>
        })
    })

    it('renders', () => {
        const {getByText} = renderComponent({
            campaign: campaignWithABGroup,
            integrationId: 8,
        })

        expect(getByText('Control Variant')).toBeInTheDocument()
        expect(getByText('Variant A')).toBeInTheDocument()
        expect(getByText('Variant B')).toBeInTheDocument()
    })

    it('user updates the control variant', () => {
        useParamsMock.mockReturnValue({
            id: integrationId,
            campaignId: campaignWithABGroup.id,
            abVariantId: variantsFixture[0].id,
        })

        const {getByRole} = renderComponent(
            {
                campaign: campaignWithABGroup,
                integrationId: integrationId,
            },
            abVariantControlVariantUrl(integrationId, campaignWithABGroup.id)
        )

        act(() => {
            userEvent.click(getByRole('button', {name: 'Update Campaign'}))
        })

        expect(updateCampaignMock).toBeCalledWith([
            undefined,
            {campaign_id: 'ee869594-65e2-45a5-a759-a4660c9ce677'},
            expect.objectContaining({
                message_html:
                    '<div>Hello, please enjoy your stay on the <strong>internet</strong>.</div>',
                message_text: 'Hello, please enjoy your stay on the internet.',
            }),
        ])
    })

    it('user updates the variant', () => {
        useParamsMock.mockReturnValue({
            id: integrationId,
            campaignId: campaignWithABGroup.id,
            abVariantId: variantsFixture[0].id,
        })

        const {getByRole} = renderComponent(
            {
                campaign: campaignWithABGroup,
                integrationId: 8,
            },
            abVariantEditorUrl(
                integrationId,
                campaignWithABGroup.id,
                variantsFixture[0].id
            )
        )

        act(() => {
            userEvent.click(getByRole('button', {name: 'Update Variant'}))
        })

        expect(updateCampaignMock).toBeCalledWith([
            undefined,
            {campaign_id: 'ee869594-65e2-45a5-a759-a4660c9ce677'},
            {
                variants: [
                    {
                        attachments: [],
                        id: 'ee269594-25e2-45a25-a759-a4660c9ce677',
                        message_html:
                            '<div>Lorem <strong>Ipsum</strong>.</div>',
                        message_text: 'Lorem Ipsum.',
                    },
                    {
                        id: 'ee269594-25e2-45a25-a759-a4660c9ce622',
                        message_html: 'Lorem <b>Ipsum dolor</b>.',
                        message_text: 'Lorem Ipsum dolor',
                    },
                ],
            },
        ])
    })

    it('user duplicates the variant', () => {
        useParamsMock.mockReturnValue({
            id: integrationId,
            campaignId: campaignWithABGroup.id,
            abVariantId: variantsFixture[0].id,
        })

        const {getByRole} = renderComponent(
            {
                campaign: {
                    ...campaignWithABGroup,
                    variants: [variantsFixture[0]],
                },
                integrationId: 8,
            },
            abVariantEditorUrl(
                integrationId,
                campaignWithABGroup.id,
                variantsFixture[0].id
            )
        )

        act(() => {
            userEvent.click(getByRole('button', {name: 'Duplicate Variant'}))
        })

        expect(updateCampaignMock).toBeCalledWith([
            undefined,
            {campaign_id: 'ee869594-65e2-45a5-a759-a4660c9ce677'},
            {
                variants: [
                    {
                        id: 'ee269594-25e2-45a25-a759-a4660c9ce677',
                        message_html: 'Lorem <b>Ipsum</b>.',
                        message_text: 'Lorem Ipsum',
                    },
                    {
                        id: expect.any(String),
                        message_html: 'Lorem <b>Ipsum</b>.',
                        message_text: 'Lorem Ipsum',
                        attachments: undefined,
                    },
                ],
            },
        ])
    })

    it('user adds a new variant', () => {
        useParamsMock.mockReturnValue({
            id: integrationId,
            campaignId: campaignWithABGroup.id,
        })

        const {getByRole, container} = renderComponent(
            {
                campaign: {
                    ...campaignWithABGroup,
                    variants: [
                        variantsFixture[0],
                        {
                            message_text: '',
                            message_html: '',
                            attachments: null,
                        } as CampaignVariant,
                    ],
                },
                integrationId: 8,
            },
            abVariantAddUrl(integrationId, campaignWithABGroup.id)
        )

        const createBtn = getByRole('button', {name: 'Create'})
        expect(createBtn).toBeInTheDocument()

        // simulate "onEditorChange" RichField change event
        const editor = container.querySelector('.public-DraftEditor-content')!
        const event = createEvent.paste(editor, {
            clipboardData: {
                types: ['text/plain'],
                getData: () => 'Pizza Pepperoni',
            },
        })

        act(() => {
            fireEvent(editor, event)
            fireEvent(editor, event)
        })

        expect(createBtn).toHaveAttribute('aria-disabled', 'false')

        act(() => {
            userEvent.click(createBtn)
        })

        expect(updateCampaignMock).toBeCalledWith([
            undefined,
            {campaign_id: 'ee869594-65e2-45a5-a759-a4660c9ce677'},
            {
                variants: [
                    {
                        id: 'ee269594-25e2-45a25-a759-a4660c9ce677',
                        message_html: 'Lorem <b>Ipsum</b>.',
                        message_text: 'Lorem Ipsum',
                    },
                    {
                        attachments: [],
                        id: expect.any(String),
                        message_html: '<div>Pizza Pepperoni</div>',
                        message_text: 'Pizza Pepperoni',
                    },
                ],
            },
        ])
    })

    it('user discards a new variant', () => {
        useParamsMock.mockReturnValue({
            id: integrationId,
            campaignId: campaignWithABGroup.id,
        })

        const {getByRole} = renderComponent(
            {
                campaign: campaignWithABGroup,
                integrationId: integrationId,
            },
            abVariantAddUrl(integrationId, campaignWithABGroup.id)
        )

        const cancelBtn = getByRole('button', {name: 'Cancel'})
        expect(cancelBtn).toBeInTheDocument()

        act(() => {
            userEvent.click(cancelBtn)
        })

        expect(updateCampaignMock).not.toBeCalled()
    })

    it('user can delete variant', () => {
        useParamsMock.mockReturnValue({
            id: integrationId,
            campaignId: campaignWithABGroup.id,
        })

        const {getAllByTestId} = renderComponent(
            {
                campaign: campaignWithABGroup,
                integrationId: integrationId,
            },
            abVariantsUrl(integrationId, campaignWithABGroup.id)
        )

        const deleteButtons = getAllByTestId('delete-icon-button')
        expect(deleteButtons).toHaveLength(3)

        deleteButtons.forEach((element, idx) => {
            // First element is 'control version'
            expect(element).toHaveAttribute(
                'aria-disabled',
                idx === 0 ? 'true' : 'false'
            )
        })

        act(() => {
            userEvent.click(deleteButtons[2])
        })

        expect(updateCampaignMock).toBeCalledWith([
            undefined,
            {campaign_id: 'ee869594-65e2-45a5-a759-a4660c9ce677'},
            {
                variants: [
                    {
                        id: campaignWithABGroup.variants[0].id,
                        message_html: 'Lorem <b>Ipsum</b>.',
                        message_text: 'Lorem Ipsum',
                    },
                ],
            },
        ])
    })
})
