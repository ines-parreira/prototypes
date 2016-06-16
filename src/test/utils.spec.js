import expect from 'expect'
import moment from 'moment'
import {formatDatetime} from '../utils'


describe('utils', () => {
    describe('formatDatetime', () => {

        /* We reset the moment language with its default value.
        *  Because others tests could edit this setting.
        *  We ensure we use the default value for these tests.
        **/
        before(() => moment.locale('en'))

        it('invalid', () => {
            // to disable warning
            moment.createFromInputFallback = function (config) {
                // unreliable string magic, or
                config._d = new Date(config._i);
            };
            expect(formatDatetime('test')).toBe('Invalid date')
        })
        it('valid default format', () => {
            expect(formatDatetime('2013-05-10 12:00')).toBe('05/10/2013')
        })
        it('invalid timezone defaults to UTC', () => {
            expect(formatDatetime('2013-05-10 12:00', 'xxx')).toBe('05/10/2013')
        })
        it('iso format - with timezone', () => {
            expect(formatDatetime('2016-06-09T07:30:07+00:00', 'Europe/Paris', 'YYYY-DD-MM HH:mm')).toBe('2016-09-06 09:30')
        })
    })

})
