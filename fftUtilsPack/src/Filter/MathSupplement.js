import Complex from './Complex'
class MathSupplement {
    static doubleLn10 = 2.302585092994046;

    static asinh(x) {
        return Math.log(x + Math.sqrt(x * x + 1.0));
    }

    static addmul(c, v, c1) {
        return new Complex(c.getReal() + v * c1.getReal(), c.getImaginary() + v * c1.getImaginary());
    }


}

export default MathSupplement;

