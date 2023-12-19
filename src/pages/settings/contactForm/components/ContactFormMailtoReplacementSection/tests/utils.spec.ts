import {sortEmailByDomainAndName} from '../utils'

describe('utils', () => {
    describe('sortEmailByDomainAndName', () => {
        it('should sort by domains', () => {
            expect(
                [
                    'test1@gmail.com',
                    'test1@gorgias.com',
                    'test1@zendesk.com',
                ].sort(sortEmailByDomainAndName)
            ).toEqual([
                'test1@gmail.com',
                'test1@gorgias.com',
                'test1@zendesk.com',
            ])
        })

        it('should sort by the name when domain similar', () => {
            expect(
                ['abc@gorgias.com', 'cba@gorgias.com', 'bca@gorgias.com'].sort(
                    sortEmailByDomainAndName
                )
            ).toEqual(['abc@gorgias.com', 'bca@gorgias.com', 'cba@gorgias.com'])
        })
    })
})
