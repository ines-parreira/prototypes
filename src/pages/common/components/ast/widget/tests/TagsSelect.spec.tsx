import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {fireEvent, render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import {Tag} from 'models/tag/types'
import {createTag} from 'models/tag/resources'
import TagsSelect from '../TagsSelect'
import {RootState} from '../../../../../../state/types'
import SelectField from '../../../../forms/SelectField/SelectField'

const mockStore = configureMockStore([thunk])

jest.mock(
    'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField',
    () => {
        return (props: ComponentProps<typeof MultiSelectOptionsField>) => {
            return (
                <div>
                    MultiSelectField Mock
                    {JSON.stringify(
                        props,
                        (key, value: unknown) => {
                            return typeof value !== 'function'
                                ? value
                                : undefined
                        },
                        2
                    )}
                    <input
                        data-testid="on-change-input"
                        onChange={(event) => {
                            props.onChange(JSON.parse(event.target.value))
                        }}
                    />
                </div>
            )
        }
    }
)

jest.mock('../../../../forms/SelectField/SelectField', () => {
    return (props: ComponentProps<typeof SelectField>) => {
        return (
            <div>
                SelectField Mock
                {JSON.stringify(
                    props,
                    (key, value: unknown) => {
                        return typeof value !== 'function' ? value : undefined
                    },
                    2
                )}
                <input
                    data-testid="on-change-input"
                    onChange={(event) => {
                        props.onChange(JSON.parse(event.target.value))
                    }}
                />
            </div>
        )
    }
})

jest.mock('models/tag/resources')

describe('<TagsSelect />', () => {
    const defaultStore = {
        tags: fromJS({
            items: [
                {
                    name: 'billing',
                },
                {
                    name: 'refund',
                },
                {
                    name: 'question',
                },
            ],
        }),
        entities: {
            tags: {
                [1]: {name: 'billing'} as Tag,
                [2]: {name: 'refund'} as Tag,
                [3]: {name: 'question'} as Tag,
            },
        },
    } as unknown as RootState
    const commonProps: ComponentProps<typeof TagsSelect> = {
        onChange: jest.fn(),
        caseInsensitive: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when multiple is set to true', () => {
        it('should render array as value', () => {
            const {container} = render(
                <Provider store={mockStore(defaultStore)}>
                    <TagsSelect
                        {...commonProps}
                        multiple
                        value={['billing', 'bugs']}
                    />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render string as value', () => {
            const {container} = render(
                <Provider store={mockStore(defaultStore)}>
                    <TagsSelect
                        {...commonProps}
                        multiple
                        value="billing,bugs"
                    />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should handle change when value is an array', () => {
            const {getByTestId} = render(
                <Provider store={mockStore(defaultStore)}>
                    <TagsSelect
                        {...commonProps}
                        multiple
                        value={['billing', 'bugs']}
                    />
                </Provider>
            )

            fireEvent.change(getByTestId('on-change-input'), {
                target: {value: JSON.stringify(['new', 'value'])},
            })

            expect(commonProps.onChange).toHaveBeenLastCalledWith([
                'new',
                'value',
            ])
        })

        it('should handle change when value is a string', () => {
            const {getByTestId} = render(
                <Provider store={mockStore(defaultStore)}>
                    <TagsSelect
                        {...commonProps}
                        multiple
                        value="billing, bugs"
                    />
                </Provider>
            )

            fireEvent.change(getByTestId('on-change-input'), {
                target: {value: JSON.stringify(['new', 'value'])},
            })

            expect(commonProps.onChange).toHaveBeenLastCalledWith('new,value')
        })

        it('should create new tags', () => {
            const createTagMock = createTag as jest.MockedFunction<
                typeof createTag
            >
            const store = mockStore(defaultStore)
            const {getByTestId} = render(
                <Provider store={store}>
                    <TagsSelect
                        {...commonProps}
                        multiple
                        value="billing, bugs"
                    />
                </Provider>
            )

            fireEvent.change(getByTestId('on-change-input'), {
                target: {value: JSON.stringify(['new'])},
            })

            expect(createTagMock.mock.calls).toMatchSnapshot()
        })
    })

    it('should render a single value', () => {
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <TagsSelect {...commonProps} value="billing" />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should handle change', () => {
        const {getByTestId} = render(
            <Provider store={mockStore(defaultStore)}>
                <TagsSelect {...commonProps} value="billing" />
            </Provider>
        )

        fireEvent.change(getByTestId('on-change-input'), {
            target: {value: JSON.stringify('new')},
        })

        expect(commonProps.onChange).toHaveBeenLastCalledWith('new')
    })

    it('should create a new tag', () => {
        const createTagMock = createTag as jest.MockedFunction<typeof createTag>
        const store = mockStore(defaultStore)
        const {getByTestId} = render(
            <Provider store={store}>
                <TagsSelect {...commonProps} value="billing" />
            </Provider>
        )

        fireEvent.change(getByTestId('on-change-input'), {
            target: {value: JSON.stringify('new')},
        })

        expect(createTagMock.mock.calls).toMatchSnapshot()
    })
})
