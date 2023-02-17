import Complex from './Complex';
import ComplexUtils from './ComplexUtils'
class Biquad {
    m_a0;
    m_a1;
    m_a2;
    m_b1;
    m_b2;
    m_b0;

    constructor() {

    }

    getA0() {
        return this.m_a0;
    }

    getA1() {
        return this.m_a1 * this.m_a0;
    }

    getA2() {
        return this.m_a2 * this.m_a0;
    }

    getB0() {
        return this.m_b0 * this.m_a0;
    }

    getB1() {
        return this.m_b1 * this.m_a0;
    }

    getB2() {
        return this.m_b2 * this.m_a0;
    }
    //Complex
    response(normalizedFrequency) {
        let a0 = this.getA0();
        let a1 = this.getA1();
        let a2 = this.getA2();
        let b0 = this.getB0();
        let b1 = this.getB1();
        let b2 = this.getB2();
        let w = 6.283185307179586 * normalizedFrequency;
        let czn1 = ComplexUtils.polar2Complex(1.0, -w);
        let czn2 = ComplexUtils.polar2Complex(1.0, -2.0 * w);
        let ch = new Complex(1.0);
        let cbot = new Complex(1.0);
        let ct = new Complex(b0 / a0);
        let cb = new Complex(1.0);
        ct = MathSupplement.addmul(ct, b1 / a0, czn1);
        ct = MathSupplement.addmul(ct, b2 / a0, czn2);
        cb = MathSupplement.addmul(cb, a1 / a0, czn1);
        cb = MathSupplement.addmul(cb, a2 / a0, czn2);
        ch = ch.multiply(ct);
        cbot = cbot.multiply(cb);
        return ch.divide(cbot);
    }

    setCoefficients(a0, a1, a2, b0, b1, b2) {
        this.m_a0 = a0;
        this.m_a1 = a1 / a0;
        this.m_a2 = a2 / a0;
        this.m_b0 = b0 / a0;
        this.m_b1 = b1 / a0;
        this.m_b2 = b2 / a0;
    }

    setOnePole(pole, zero) {
        let a0 = 1.0;
        let a1 = -pole.getReal();
        let a2 = 0.0;
        let b0 = -zero.getReal();
        let b1 = 1.0;
        let b2 = 0.0;
        this.setCoefficients(a0, a1, a2, b0, b1, b2);
    }

    setTwoPole(pole1, zero1, pole2, zero2) {
        let a0 = 1.0;
        let a1;
        let a2;
        if (Math.abs(pole1.getImaginary()) > 0.000000001) {
            a1 = -2.0 * pole1.getReal();
            a2 = pole1.abs() * pole1.abs();
        } else {
            a1 = -(pole1.getReal() + pole2.getReal());
            a2 = pole1.getReal() * pole2.getReal();
        }

        let b0 = 1.0;
        let b1;
        let b2;
        if (Math.abs(zero1.getImaginary())  > 0.000000001) {
            b1 = -2.0 * zero1.getReal();
            b2 = zero1.abs() * zero1.abs();
        } else {
            b1 = -(zero1.getReal() + zero2.getReal());
            b2 = zero1.getReal() * zero2.getReal();
        }

        this.setCoefficients(a0, a1, a2, b0, b1, b2);
    }

    //BiquadPoleState
    setPoleZeroForm(bps) {
        this.setPoleZeroPair(bps);
        this.applyScale(bps.gain);
    }

    setIdentity() {
        this.setCoefficients(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
    }

    applyScale(scale) {
        this.m_b0 *= scale;
        this.m_b1 *= scale;
        this.m_b2 *= scale;
    }

    setPoleZeroPair(pair) {
        if (pair.isSinglePole()) {
            this.setOnePole(pair.poles.first, pair.zeros.first);
        } else {
            this.setTwoPole(pair.poles.first, pair.zeros.first, pair.poles.second, pair.zeros.second);
        }
    }
}

export default Biquad;
