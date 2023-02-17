import ComplexPair from "./ComplexPair";

class PoleZeroPair {
    poles; // ComplexPair
    zeros; // ComplexPair


    constructor(p1, z1,  p2, z2) {
        this.poles = new ComplexPair(p1, p2);
        this.zeros = new ComplexPair(z1, z2);
    }

    isSinglePole() {
        return (Math.abs(this.poles.second.getReal()) < 0.000000001 && Math.abs(this.poles.second.getImaginary()) < 0.000000001)
            && (Math.abs(this.zeros.second.getReal()) < 0.000000001 && Math.abs(this.zeros.second.getImaginary()) < 0.000000001)
    }
}

export default PoleZeroPair;
