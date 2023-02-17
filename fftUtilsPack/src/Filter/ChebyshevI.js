import LayoutBase from './LayoutBase'
import Cascade from './Cascade'
import MathSupplement from "./MathSupplement";
import Complex from "./Complex";
import BandPassTransform from "./BandPassTransform";

class ChebyshevI extends Cascade {

    setupBandPass(order, sampleRate, centerFrequency, widthFrequency, rippleDb, directFormType) {
        let m_analogProto = new AnalogLowPass(order);
        m_analogProto.design(rippleDb);
        let m_digitalProto = new LayoutBase(order * 2);
        new BandPassTransform(centerFrequency / sampleRate, widthFrequency / sampleRate, m_digitalProto, m_analogProto);
        this.setLayout(m_digitalProto, directFormType);
    }



    bandPass(order, sampleRate, centerFrequency, widthFrequency, rippleDb) {
        this.setupBandPass(order, sampleRate, centerFrequency, widthFrequency, rippleDb, 1);
    }

}

class AnalogLowPass extends LayoutBase {
    nPoles = 0;
    constructor(_nPoles) {
        super(_nPoles)
        this.nPoles = _nPoles;
    }

    design(rippleDb) {
        this.reset();
        let eps = Math.sqrt(1.0 / Math.exp(-rippleDb * 0.1 * MathSupplement.doubleLn10) - 1.0);
        let v0 = MathSupplement.asinh(1.0 / eps) / this.nPoles;
        let sinh_v0 = -Math.sinh(v0);
        let cosh_v0 = Math.cosh(v0);
        let n2 = (2 * this.nPoles);
        let pairs = this.nPoles / 2;

        for(let i = 0; i < pairs; ++i) {
            let k = 2 * i + 1 - this.nPoles;
            let a = sinh_v0 * Math.cos(k * 3.141592653589793 / n2);
            let b = cosh_v0 * Math.sin(k * 3.141592653589793 / n2);
            this.addPoleZeroConjugatePairs(new Complex(a, b), new Complex(1.0 / 0.0));
        }

        if ((this.nPoles & 1) == 1) {
            this.add(new Complex(sinh_v0, 0.0), new Complex(1.0 / 0.0));
            this.setNormal(0.0, 1.0);
        } else {
            this.setNormal(0.0, Math.pow(10.0, -rippleDb / 20.0));
        }
    }

}

export default ChebyshevI;

