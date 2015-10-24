import _ts = require('typescript');
import {Adapter} from './index';

class TS_1_7 implements Adapter {
    constructor(public ts: typeof _ts) {}
}

export = TS_1_7;
