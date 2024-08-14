import React from 'react'
import {render} from '@testing-library/react'

import {assumeMock, getLastMockCall} from 'utils/testing'
import {shopifyWidget} from 'fixtures/widgets'
import {
    CardTemplate,
    LeafTemplate,
    LeafType,
    ListTemplate,
    WrapperTemplate,
} from 'models/widget/types'

import {WidgetContext} from 'Widgets/contexts/WidgetContext'
import Card, {
    CardCustomization,
    HiddenField,
} from 'Widgets/modules/Template/modules/Card'
import Field from 'Widgets/modules/Template/modules/Field'
import Wrapper from 'Widgets/modules/Template/modules/Wrapper'
import ListWidget from 'Widgets/modules/Template/modules/List'

import {EditionContext} from 'providers/infobar/EditionContext'
import {LEAF_TYPES} from 'models/widget/constants'
import {CustomizationContext} from '../../contexts/CustomizationContext'
import {
    seekCardCustomization,
    seekFieldCustomization,
} from '../../helpers/customization'
import Template, {self} from '../Template'
import {FieldEditFormData} from '../../modules/Field/types'

jest.spyOn(self, 'Template')
const spiedTemplate = assumeMock(self.Template)

jest.mock('Widgets/modules/Template/modules/Card')
jest.mock('Widgets/modules/Template/modules/Field')
jest.mock('Widgets/modules/Template/modules/Wrapper')
jest.mock('Widgets/modules/Template/modules/List')
jest.mock('../../helpers/customization')

const cardMock = assumeMock(Card)
const fieldMock = assumeMock(Field)
const wrapperMock = assumeMock(Wrapper)
const listMock = assumeMock(ListWidget)
const seekCardCustomizationMock = assumeMock(seekCardCustomization)
const seekFieldCustomizationMock = assumeMock(seekFieldCustomization)

const editionHiddenFields: HiddenField[] = ['title']

const cardCustomizationMock: CardCustomization = {
    AfterTitle: () => <div>AfterTitle</div>,
    editionHiddenFields,
}

seekCardCustomizationMock.mockReturnValue(cardCustomizationMock)

const leafTemplate = {type: 'text'} as LeafTemplate
const cardTemplate = {
    type: 'card',
    widgets: [leafTemplate, leafTemplate],
} as CardTemplate
const wrapperTemplate = {
    type: 'wrapper',
    widgets: [cardTemplate, cardTemplate],
} as WrapperTemplate
const listTemplate = {type: 'list', widgets: [leafTemplate]} as ListTemplate

const minProps = {
    parentTemplate: undefined,
    template: cardTemplate,
    source: {
        path1: 'foo',
    },
}

fieldMock.mockImplementation(() => <div>Field</div>)
describe('Template', () => {
    beforeEach(() => {
        cardMock.mockImplementation(() => <div></div>)
        listMock.mockImplementation(() => <div></div>)
        wrapperMock.mockImplementation(() => <div></div>)
    })

    afterEach(() => {
        cardMock.mockClear()
        wrapperMock.mockClear()
        listMock.mockClear()
    })

    it("should return null if there's no template", () => {
        const {container} = render(<Template {...minProps} template={null} />)

        expect(container).toBeEmptyDOMElement()
    })

    describe('Card customization', () => {
        const cardCustomizationObjects = [
            {
                dataMatcher: /foo/,
                customization: cardCustomizationMock,
            },
        ]
        const customization = {card: cardCustomizationObjects}

        it('should provide correct customization value to seekCardCustomization', () => {
            render(
                <CustomizationContext.Provider value={customization}>
                    <Template {...minProps} />
                </CustomizationContext.Provider>
            )

            expect(seekCardCustomizationMock).toHaveBeenCalledWith(
                cardCustomizationObjects,
                cardTemplate
            )
        })

        it("should provide the correct extensions / props if there's a card customization", () => {
            render(
                <CustomizationContext.Provider value={customization}>
                    <Template {...minProps} />
                </CustomizationContext.Provider>
            )

            expect(getLastMockCall(cardMock)[0].extensions).toEqual({
                AfterTitle: expect.any(Function),
                editionHiddenFields,
            })

            expect(getLastMockCall(cardMock)[0].editionHiddenFields).toEqual(
                editionHiddenFields
            )
        })
    })

    describe('Field customization', () => {
        const fieldCustomization = {
            dataMatcher: /foo/,
            getValue: jest.fn(),
            getValueString: jest.fn(),
        }

        it('should provide correct customization value to seekFieldCustomization', () => {
            render(
                <CustomizationContext.Provider
                    value={{field: [fieldCustomization]}}
                >
                    <Template {...minProps} template={leafTemplate} />
                </CustomizationContext.Provider>
            )

            expect(seekFieldCustomizationMock).toHaveBeenCalledWith(
                [fieldCustomization],
                minProps.source,
                leafTemplate
            )
        })

        it('should provide the props from `seekFieldCustomization`', () => {
            const returnedValues = {
                value: '2024 OLYMPICS',
                copyableValue: 'RPZ',
                editionHiddenFields: ['type'] as Array<
                    keyof FieldEditFormData<LeafType>
                >,
                valueCanOverflow: true,
                additionalTypes: ['nothing_yet' as const],
            }
            seekFieldCustomizationMock.mockReturnValueOnce(returnedValues)
            render(<Template {...minProps} template={leafTemplate} />)

            expect(getLastMockCall(fieldMock)[0]).toEqual(
                expect.objectContaining(returnedValues)
            )
        })
    })

    describe('Wrapper', () => {
        it('should allow `template.widgets` to be falsy', () => {
            render(
                <Template
                    {...minProps}
                    template={{...wrapperTemplate, widgets: undefined}}
                />
            )
            expect(getLastMockCall(wrapperMock)[0]).toEqual(
                expect.objectContaining({
                    children: [],
                })
            )
        })

        it('should pass correct props to Wrapper', () => {
            render(<Template {...minProps} template={wrapperTemplate} />)

            expect(getLastMockCall(wrapperMock)[0]).toEqual({
                source: minProps.source,
                template: wrapperTemplate,
                children: expect.anything(),
            })
        })

        it('should call Template recursively with correct props', () => {
            wrapperMock.mockImplementation(({children}) => (
                <div>{children}</div>
            ))
            render(<Template {...minProps} template={wrapperTemplate} />)

            expect(spiedTemplate).toHaveBeenCalledTimes(2)
            expect(getLastMockCall(spiedTemplate)[0]).toEqual({
                parentTemplate: wrapperTemplate,
                template: expect.objectContaining({
                    ...cardTemplate,
                    absolutePath: expect.any(Array),
                    templatePath: expect.any(String),
                }),
                source: minProps.source,
            })
        })
    })

    describe('List', () => {
        const validListSource = [{ok: 'foo'}]

        it.each([
            [{}, listTemplate],
            [[], listTemplate],
            [validListSource, {...listTemplate, widgets: []} as ListTemplate],
        ])(
            'should not render if source is not ok or template is missing',
            (source, template) => {
                render(
                    <Template
                        {...minProps}
                        source={source}
                        template={template}
                    />
                )

                expect(listMock).not.toHaveBeenCalled()
            }
        )

        it('should pass correct props to List', () => {
            render(
                <Template
                    {...minProps}
                    template={listTemplate}
                    source={validListSource}
                />
            )

            expect(getLastMockCall(listMock)[0]).toEqual({
                isEditing: false,
                source: validListSource,
                template: listTemplate,
                children: expect.anything(),
            })
        })

        it('should call Template recursively with correct props', () => {
            listMock.mockImplementation(({children}) => (
                <div>{children(undefined, 0)}</div>
            ))
            render(
                <Template
                    {...minProps}
                    template={listTemplate}
                    source={validListSource}
                />
            )

            expect(spiedTemplate).toHaveBeenCalledTimes(1)
            expect(getLastMockCall(spiedTemplate)[0]).toEqual({
                isFirstOfList: true,
                parentTemplate: listTemplate,
                template: expect.objectContaining({
                    ...leafTemplate,
                    absolutePath: expect.any(Array),
                    templatePath: expect.any(String),
                }),
                source: undefined,
            })
        })
    })

    describe('Card', () => {
        it.each([undefined, {}])(
            'should not render if source is not ok',
            (source) => {
                render(
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Template {...minProps} source={source} />
                    </WidgetContext.Provider>
                )
                expect(cardMock).not.toHaveBeenCalled()
            }
        )

        it('should render if source has no key but widget is in edition mode', () => {
            render(
                <EditionContext.Provider value={{isEditing: true}}>
                    <WidgetContext.Provider value={{...shopifyWidget}}>
                        <Template {...minProps} source={{}} />
                    </WidgetContext.Provider>
                </EditionContext.Provider>
            )
            expect(cardMock).toHaveBeenCalled()
        })

        it('should not render if source is not ok but widget type is standalone', () => {
            render(<Template {...minProps} source={undefined} />)
            expect(cardMock).toHaveBeenCalled()
        })

        it('should pass correct props to Card', () => {
            render(
                <Template
                    {...minProps}
                    parentTemplate={wrapperTemplate}
                    isFirstOfList
                />
            )

            expect(getLastMockCall(cardMock)[0]).toEqual(
                expect.objectContaining({
                    isEditing: false,
                    source: minProps.source,
                    template: minProps.template,
                    parentTemplate: wrapperTemplate,
                    isFirstOfList: true,
                })
            )
        })

        it('should call Template recursively with correct props', () => {
            cardMock.mockImplementation(({children}) => <div>{children}</div>)
            render(<Template {...minProps} template={cardTemplate} />)

            expect(spiedTemplate).toHaveBeenCalledTimes(2)
            expect(getLastMockCall(spiedTemplate)[0]).toEqual({
                parentTemplate: cardTemplate,
                template: expect.objectContaining({
                    ...leafTemplate,
                    absolutePath: expect.any(Array),
                    templatePath: expect.any(String),
                }),
                source: minProps.source,
            })
        })
    })

    describe('Field', () => {
        it('should pass correct props to Field', () => {
            render(
                <Template
                    {...minProps}
                    template={leafTemplate}
                    source={'foo'}
                />
            )

            expect(getLastMockCall(fieldMock)[0]).toEqual({
                isEditing: false,
                type: leafTemplate.type,
                value: 'foo',
                template: leafTemplate,
                copyableValue: 'foo',
            })
        })

        it('should narrow down the type of from string to LeafType', () => {
            render(
                <Template
                    {...minProps}
                    template={{type: 'unknown'} as LeafTemplate}
                    source={'foo'}
                />
            )

            expect(getLastMockCall(fieldMock)[0].type).toBe(LEAF_TYPES.TEXT)
        })
    })
})
