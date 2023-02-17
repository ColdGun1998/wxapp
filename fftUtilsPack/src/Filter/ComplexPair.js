import Complex from './Complex';

class ComplexPair {
    first = null;
    second = null;

    constructor(c1, c2) {
        this.first = c1;
        this.second = c2 || new Complex(0.0, 0.0);
    }



}

export default ComplexPair;
