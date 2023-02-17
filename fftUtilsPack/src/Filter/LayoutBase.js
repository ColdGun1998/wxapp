import PoleZeroPair from './PoleZeroPair'

class LayoutBase {
    m_numPoles =null;
    m_pair = null;
    m_normalW = 0.0;
    m_normalGain = 0.0;

    constructor(pairs) {
        if (typeof pairs != "number") {
            this.m_numPoles = pairs.length * 2;
            this.m_pair = pairs;
        } else {
            let numPoles = pairs;
            this.m_numPoles = 0;
            if (numPoles % 2 == 1) {
                this.m_pair = new Array(numPoles / 2 + 1);
            } else {
                this.m_pair = new Array(numPoles / 2);
            }
        }
    }

    reset() {
        this.m_numPoles = 0;
    }

    getNumPoles() {
        return this.m_numPoles;
    }

    addComplex(pole, zero) {
        this.m_pair[this.m_numPoles / 2] = new PoleZeroPair(pole, zero);
        this.m_numPoles++;
    }

    addPoleZeroConjugatePairs(pole, zero) {
        if (pole == null) {
            console.log("LayoutBase addConj() pole == null");
        }

        if (zero == null) {
            console.log("LayoutBase addConj() zero == null");
        }

        if (this.m_pair == null) {
            console.log("LayoutBase addConj() m_pair == null");
        }

        this.m_pair[this.m_numPoles / 2] = new PoleZeroPair(pole, zero, pole.conjugate(), zero.conjugate());
        this.m_numPoles += 2;
    }

    addComplexPair(poles, zeros) {
        this.m_pair[this.m_numPoles / 2] = new PoleZeroPair(poles.first, zeros.first, poles.second, zeros.second);
        this.m_numPoles += 2;
    }

    getPair(pairIndex) {
        return this.m_pair[pairIndex];
    }

    getNormalW() {
        return this.m_normalW;
    }

    getNormalGain() {
        return this.m_normalGain;
    }

    setNormal(w, g) {
        this.m_normalW = w;
        this.m_normalGain = g;
    }
}

export default LayoutBase;
