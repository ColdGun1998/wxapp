import Complex from "./Complex";
import MathSupplement from "./MathSupplement";
import ComplexPair from "./ComplexPair";

class BandPassTransform {
    wc2 = 0.0;
    wc = 0.0;
    a = 0.0;
    b = 0.0;
    a2 = 0.0;
    b2 = 0.0;
    ab = 0.0;
    ab_2 = 0.0;

    constructor(fc, fw, digital, analog) {
        digital.reset();
        if (fc < 0.0) {
            throw new Error("Cutoff frequency cannot be negative.")
        } else if (!(fc < 0.5)) {
            throw new Error("Cutoff frequency must be less than the Nyquist frequency.");
        } else {
            let ww = 6.283185307179586 * fw;
            this.wc2 = 6.283185307179586 * fc - ww / 2.0;
            this.wc = this.wc2 + ww;
            if (this.wc2 < 1.0E-8) {
                this.wc2 = 1.0E-8;
            }

            if (this.wc > 3.141592643589793) {
                this.wc = 3.141592643589793;
            }

            this.a = Math.cos((this.wc + this.wc2) * 0.5) / Math.cos((this.wc - this.wc2) * 0.5);
            this.b = 1.0 / Math.tan((this.wc - this.wc2) * 0.5);
            this.a2 = this.a * this.a;
            this.b2 = this.b * this.b;
            this.ab = this.a * this.b;
            this.ab_2 = 2.0 * this.ab;
            let numPoles = analog.getNumPoles();
            let pairs = numPoles / 2;

            for(let i = 0; i < pairs; ++i) {
                let pair = analog.getPair(i);
                let p1 = this.transform(pair.poles.first);
                let z1 = this.transform(pair.zeros.first);
                digital.addPoleZeroConjugatePairs(p1.first, z1.first);
                digital.addPoleZeroConjugatePairs(p1.second, z1.second);
            }

            if ((numPoles & 1) == 1) {
                let poles = this.transform(analog.getPair(pairs).poles.first);
                let zeros = this.transform(analog.getPair(pairs).zeros.first);
                digital.add(poles, zeros);
            }

            let wn = analog.getNormalW();
            digital.setNormal(2.0 * Math.atan(Math.sqrt(Math.tan((this.wc + wn) * 0.5) * Math.tan((this.wc2 + wn) * 0.5))), analog.getNormalGain());
        }
    }

    transform(c) {
        if (c.isInfinite()) {
            return new ComplexPair(new Complex(-1.0), new Complex(1.0));
        } else {
            c = (new Complex(1.0)).add(c).divide((new Complex(1.0)).subtract(c));
            let v = new Complex(0.0);
            v = MathSupplement.addmul(v, 4.0 * (this.b2 * (this.a2 - 1.0) + 1.0), c);
            v = v.add(8.0 * (this.b2 * (this.a2 - 1.0) - 1.0));
            v = v.multiply(c);
            v = v.add(4.0 * (this.b2 * (this.a2 - 1.0) + 1.0));
            v = v.sqrt();
            let u = v.multiply(-1);
            u = MathSupplement.addmul(u, this.ab_2, c);
            u = u.add(this.ab_2);
            v = MathSupplement.addmul(v, this.ab_2, c);
            v = v.add(this.ab_2);
            let d = new Complex(0.0);
            d = MathSupplement.addmul(d, 2.0 * (this.b - 1.0), c).add(2.0 * (1.0 + this.b));
            return new ComplexPair(u.divide(d), v.divide(d));
        }
    }
}

export default BandPassTransform;
