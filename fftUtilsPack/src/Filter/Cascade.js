import Complex from "./Complex";
import MathSupplement from "./MathSupplement";
import ComplexUtils from "./ComplexUtils";
import Biquad from "./Biquad";
import DirectFormII from "./DirectFormII";

class Cascade {
    m_biquads = null;
    m_states = null;
    m_numBiquads = 0;
    numPoles = 0;

    getNumBiquads() {
        return this.m_numBiquads;
    }

    getBiquad(index) {
        return this.m_biquads[index];
    }


    reset() {
        for(let i = 0; i < this.m_numBiquads; ++i) {
            this.m_states[i].reset();
        }
    }

    filter(input) {
        let out = input;
        for(let i = 0; i < this.m_numBiquads; i++) {
            if (this.m_states[i] != null) {
                out = this.m_states[i].process1(out, this.m_biquads[i]);
            }
        }
        return out;
    }

     response(normalizedFrequency) {
        let w = 6.283185307179586 * normalizedFrequency;
        let czn1 = ComplexUtils.polar2Complex(1.0, -w);
        let czn2 = ComplexUtils.polar2Complex(1.0, -2.0 * w);
        let ch = new Complex(1.0);
        let cbot = new Complex(1.0);

        for(let i = 0; i < this.m_numBiquads; ++i) {
            let stage = this.m_biquads[i];
            let cb = new Complex(1.0);
            let ct = new Complex(stage.getB0() / stage.getA0());
            ct = MathSupplement.addmul(ct, stage.getB1() / stage.getA0(), czn1);
            ct = MathSupplement.addmul(ct, stage.getB2() / stage.getA0(), czn2);
            cb = MathSupplement.addmul(cb, stage.getA1() / stage.getA0(), czn1);
            cb = MathSupplement.addmul(cb, stage.getA2() / stage.getA0(), czn2);
            ch = ch.multiply(ct);
            cbot = cbot.multiply(cb);
        }

        return ch.divide(cbot);
    }

    applyScale(scale) {
        if (this.m_biquads.length > 0) {
            this.m_biquads[0].applyScale(scale);
        }

    }

    setLayout(proto, filterTypes) {
        let i;
        this.numPoles = proto.getNumPoles();
        this.m_numBiquads = Math.floor((this.numPoles + 1) / 2);
        this.m_biquads = new Array(this.m_numBiquads);
        switch(filterTypes) {
            case 0:
                this.m_states = new Array(this.m_numBiquads);
                i = 0;

                while(true) {
                    if (i >= this.m_numBiquads) {
                        break;
                    }

                    this.m_states[i] = new DirectFormI();
                    ++i;
                }
                break;
            case 1:
            default:
                this.m_states = new Array(this.m_numBiquads);

                for(i = 0; i < this.m_numBiquads; ++i) {
                    this.m_states[i] = new DirectFormII();
                }
                break;
        }

        for(i = 0; i < this.m_numBiquads; ++i) {
            let p = proto.getPair(i);
            this.m_biquads[i] = new Biquad();
            this.m_biquads[i].setPoleZeroPair(p);
        }

        this.applyScale(proto.getNormalGain() / this.response(proto.getNormalW() / 6.283185307179586).abs());
    }
}

export default Cascade;
