import { assumeMock } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { actionFixture } from 'fixtures/infobarCustomActions'
import { useComputeNbButtonDisplayed } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/hooks/useComputeNbButtonDisplayed'
import { useTemplateContext } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/hooks/useTemplateContext'

import { Button } from '../Button'
import ButtonsGroup from '../ButtonsGroup'

jest.mock('../Button')
jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/hooks/useTemplateContext',
)
jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/hooks/useComputeNbButtonDisplayed',
)
const ButtonMock = assumeMock(Button)
const useTemplateContextMock = assumeMock(useTemplateContext)
const useComputeNbButtonDisplayedMock = assumeMock(useComputeNbButtonDisplayed)

describe('<ButtonsGroup/>', () => {
    const source = {
        label_0: 'label 1',
        label_1: 'label 2',
    }
    beforeEach(() => {
        ButtonMock.mockImplementation(() => <button>buttonMock</button>)
        useTemplateContextMock.mockReturnValue({
            context: {
                ...source,
            },
            variables: {},
        } as unknown as ReturnType<typeof useTemplateContext>)
        useComputeNbButtonDisplayedMock.mockReturnValue(2)
    })
    const action = actionFixture()

    const buttons = [
        { label: '{{label_0}}', action },
        { label: '{{label_1}}', action },
        { label: 'ok', action },
        { label: 'who cares', action },
    ]

    it('should render with correct label and without a dropdown ', () => {
        render(<ButtonsGroup buttons={buttons.slice(0, 2)} source={source} />)

        expect(screen.getAllByRole('button').length).toBe(2)
        expect(screen.queryByRole('button', { name: 'more_horiz' })).toBeFalsy()
    })

    it('should render with a dropdown', () => {
        render(<ButtonsGroup buttons={buttons} source={source} />)

        expect(
            screen.getByRole('button', { name: 'more_horiz' }),
        ).toBeInTheDocument()
        expect(screen.queryByRole('menu')).toBeFalsy()
    })

    it('should show button in dropdown on click, with correct label', async () => {
        const user = userEvent.setup()
        render(<ButtonsGroup buttons={buttons} source={source} />)

        await act(() =>
            user.click(screen.getByRole('button', { name: 'more_horiz' })),
        )
        expect(screen.queryByRole('menu')?.getAttribute('aria-hidden')).toBe(
            'false',
        )
        expect(screen.queryByRole('menu')).toContainElement(
            screen.getAllByRole('button').pop() || null,
        )
    })

    it('should render all buttons without a dropdown', () => {
        useComputeNbButtonDisplayedMock.mockReturnValue(5)
        render(<ButtonsGroup buttons={buttons} source={source} />)
        expect(screen.queryAllByRole('button').length).toBe(buttons.length)
    })

    const parameter = {
        key: '{{label_1}}',
        label: '',
        value: 'some value',
        editable: true,
        mandatory: false,
    }

    it('should call Button with label and action being templated', () => {
        render(
            <ButtonsGroup
                buttons={[
                    {
                        label: '{{label_0}}',
                        action: {
                            ...actionFixture(),
                            params: [parameter],
                        },
                    },
                ]}
                source={source}
            />,
        )

        expect(ButtonMock.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                label: source.label_0,
                action: {
                    ...actionFixture(),
                    params: [
                        {
                            ...parameter,
                            key: source.label_1,
                        },
                    ],
                },
            }),
        )
    })

    it('should leave template untouched in actions if templated string is empty', () => {
        render(
            <ButtonsGroup
                buttons={[
                    {
                        label: '{{label_x}}',
                        action: {
                            ...actionFixture(),
                            params: [
                                {
                                    ...parameter,
                                    key: '{{label_x}}',
                                },
                            ],
                        },
                    },
                ]}
                source={source}
            />,
        )

        expect(ButtonMock.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                label: '',
                action: {
                    ...actionFixture(),
                    params: [
                        {
                            ...parameter,
                            key: '{{label_x}}',
                        },
                    ],
                },
            }),
        )
    })
})
