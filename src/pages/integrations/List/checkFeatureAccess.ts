export function checkBigCommerceAccess(domain: string) {
    return (
        // allow access feature for specified domains and for preview envs
        domain
            ? [
                  'acme',
                  'test-martin',
                  'manuel-testing',
                  'alexandru-daineanu-test-store',
                  'maximstore',
                  'iustina-store-test',
                  'ionut-zamfir',
                  'nicolas-store',
                  'lisa-t-test',
                  'pilarhelpdesk',
                  'catalinm-test',
                  'as7testing',
                  // beta program users
                  'solostove',
                  'liftsupportsdepot',
                  'mollymutt',
                  'dance4me',
                  'yatesjewelers',
                  'roamrogue',
                  'iagperformance',
              ].includes(domain) || domain.includes('.preview')
            : false
    )
}
