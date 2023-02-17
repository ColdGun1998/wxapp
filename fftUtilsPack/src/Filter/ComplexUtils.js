import Complex from './Complex'

class ComplexUtils {
    // complex
    static polar2Complex(r, theta) {
        if (r < 0.0) {
            throw new Error(`polar2Complex r < 0`);
        } else {
            // return new Complex(r * FastMath.cos(theta), r * FastMath.sin(theta));
            return new Complex(r * Math.cos(theta), r * Math.sin(theta));
        }
    }
}

export default ComplexUtils;
