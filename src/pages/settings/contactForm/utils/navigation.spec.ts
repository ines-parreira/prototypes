import {insertContactFormIdParam} from 'pages/settings/contactForm/utils/navigation'

import {CONTACT_FORM_ID_PARAM} from '../constants'

describe('navigation', () => {
    describe('insertContactFormIdParam()', () => {
        const EXPECTED_ID = 9999

        it.each([
            [`:${CONTACT_FORM_ID_PARAM}/x/y/z`, `${EXPECTED_ID}/x/y/z`],
            [`/:${CONTACT_FORM_ID_PARAM}/x/y/z`, `/${EXPECTED_ID}/x/y/z`],
            [`/x/:${CONTACT_FORM_ID_PARAM}/y/z`, `/x/${EXPECTED_ID}/y/z`],
            [`/x/:${CONTACT_FORM_ID_PARAM}`, `/x/${EXPECTED_ID}`],
            [
                `/x/:${CONTACT_FORM_ID_PARAM}/:${CONTACT_FORM_ID_PARAM}/z`,
                `/x/${EXPECTED_ID}/${EXPECTED_ID}/z`,
            ],
        ])(
            'should insert the id to the correct place in the link',
            (path, expectedValue) => {
                expect(insertContactFormIdParam(path, EXPECTED_ID)).toEqual(
                    expectedValue
                )
            }
        )

        it('should throw if there is no template in path', () => {
            const pathWithoutTemplate = '/aaaaa/aaaa/aaaaa'

            expect(() =>
                insertContactFormIdParam(pathWithoutTemplate, 1)
            ).toThrow(
                `Path "${pathWithoutTemplate}" doesn't contain id param template (${CONTACT_FORM_ID_PARAM})`
            )
        })
    })
})
