import { GorgiasChatInstallationVisibilityConditionOperator } from 'models/integration/types'

import validateUrl from '../validateUrl'

describe('validateUrl()', () => {
    it('should return "unsupported" for url with hash', () => {
        expect(
            validateUrl(
                'https://www.gorgias.com/?foo=bar&baz=qux#hash',
                GorgiasChatInstallationVisibilityConditionOperator.Equal,
            ),
        ).toEqual('unsupported')
    })

    it.each([
        ['valid', 'www.gorgias.com'],
        ['valid', 'gorgeous.gorgias.com'],

        ['valid', 'http://gorgias.com'],
        ['valid', 'http://gorgias.foo.bar.baz.com'],
        ['valid', 'https://gorgias.com'],
        ['valid', 'https://gorgias.foo.bar.baz.com'],

        ['valid', 'https://gorgias.foo.bar.baz.com/'],
        ['valid', 'https://gorgias.foo.bar.baz.com/foo'],
        ['valid', 'https://gorgias.foo.bar.baz.com/foo/bar/baz'],

        ['valid', 'https://www.gorgias.foo.bar.baz.com/foo/bar/baz'],

        ['invalid', '/'],
        ['invalid', '/foo'],
        ['invalid', '/foo/bar/baz'],

        ['valid', 'www.gorgias.com?foo=bar&baz=qux'],
        ['valid', 'https://www.gorgias.com?foo=bar&baz=qux'],
        ['valid', 'https://www.gorgias.com/?foo=bar&baz=qux'],

        ['invalid', 'htt://gorgias.com'],
        ['invalid', 'http:/gorgias.com'],
    ])(`should return %p for url %p with equal operator`, (expected, url) => {
        expect(
            validateUrl(
                url,
                GorgiasChatInstallationVisibilityConditionOperator.Equal,
            ),
        ).toEqual(expected)
    })

    it.each([
        ['valid', 'www.gorgias.com'],
        ['valid', 'gorgeous.gorgias.com'],

        ['valid', 'http://gorgias.com'],
        ['valid', 'https://gorgias.com'],

        ['valid', '/'],
        ['valid', '/foo'],
        ['valid', '/foo/bar/baz'],

        ['valid', 'https://www.gorgias.com?foo=bar&baz=qux'],

        ['invalid', 'www.gorgias.com '],
    ])(
        `should return %p for url %p with contain/not contain operator`,
        (expected, url) => {
            expect(
                validateUrl(
                    url,
                    GorgiasChatInstallationVisibilityConditionOperator.Contain,
                ),
            ).toEqual(expected)
        },
    )
})
