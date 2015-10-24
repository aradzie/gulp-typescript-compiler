/// <reference path="./internal1.ts"/>
/// <reference path="./internal2.ts"/>

import * as E1 from './external1';
import * as E2 from './external2';
import * as C from './component';

const id = 'main';

function main() {
    E1.test(id);
    E2.test(id);
    M1.test(id);
    M2.test(id);
}

console.log(`${id} loaded`);

main();
