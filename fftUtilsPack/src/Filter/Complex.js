const copySign = (x, y) => Math.sign(x) === Math.sign(y) ? x : -x;
class Complex {
    imaginary = 0.0;
    real = 0.0;

    constructor(real, imaginary) {
        this.real = real || 0.00000000001;
        this.imaginary = imaginary || 0.00000000001;
    }

    multiply(factor) {
        if(factor ==null) {
            throw new Error(`Complex multiply factor null`);
        }
        if(typeof factor == 'number') {
            return this.createComplex(this.real * factor, this.imaginary * factor)
        } else {
            return this.createComplex(this.real * factor.real - this.imaginary * factor.imaginary, this.real * factor.imaginary + this.imaginary * factor.real)
        }
    }

    createComplex(realPart, imaginaryPart) {
        return new Complex(realPart, imaginaryPart);
    }

    getReal() {
        return this.real;
    }

    getImaginary() {
        return this.imaginary;
    }

    abs() {
        if (Math.abs(this.real) < Math.abs(this.imaginary)) {
            if (Math.abs(this.imaginary) < 0.000000001) {
                return Math.abs(this.real);
            } else {
                let q = this.real / this.imaginary;
                return Math.abs(this.imaginary) * Math.sqrt(1.0 + q * q);
            }
        } else if (Math.abs(this.real) < 0.000000001) {
            return Math.abs(this.imaginary);
        } else {
            let q = this.imaginary / this.real;
            return Math.abs(this.real) * Math.sqrt(1.0 + q * q);
        }
    }

    isInfinite() {
        return !isFinite(this.real) || !isFinite(this.imaginary);
    }

    isNan() {
        return isNaN(this.real) && isNaN(this.imaginary);
    }

    add(addend) {
        if(addend == null) {
            throw new Error("complex append null");
            return;
        }
        if (typeof addend == "number") {
            return !this.isNan() && !isNaN(addend) ? this.createComplex(this.real + addend, this.imaginary) : new Complex(NaN, NaN);
        }
        return !addend.isNan() && !this.isNan() ? this.createComplex(this.real + addend.getReal(), this.imaginary + addend.getImaginary()) : new Complex(NaN, NaN);
    }

    sqrt() {
        if (this.isNan()) {
            return new Complex(NaN, NaN);
        } else if (Math.abs(this.real) < 0.000000001 && Math.abs(this.imaginary) < 0.000000001) {
            return this.createComplex(0.0, 0.0);
        } else {
            let t = Math.sqrt((Math.abs(this.real) + this.abs()) / 2.0);
            // this.real >= 0.0
            return this.real >= 0.0000000000000001 ? this.createComplex(t, this.imaginary / (2.0 * t)) : this.createComplex(Math.abs(this.imaginary) / (2.0 * t), copySign(1.0, this.imaginary) * t);
        }
    }




    divide(divisor) {
        if(divisor == null) {
            throw new Error("complex divisor null");
            return;
        }

        if (typeof divisor == "number") {
            return this.createComplex(this.real / divisor, this.imaginary / divisor);
        }

        if (!this.isNan() && !divisor.isNan()) {
            let c = divisor.getReal();
            let d = divisor.getImaginary();
            if (c == 0.0 && d == 0.0) {
                return new Complex(NaN, NaN);
            } else if (divisor.isInfinite() && !this.isInfinite()) {
                return new Complex(0.0, 0.0);;
            } else {
                let q;
                let denominator;
                // if (FastMath.abs(c) < FastMath.abs(d)) {
                if (Math.abs(c) < Math.abs(d)) {
                    q = c / d;
                    denominator = c * q + d;
                    return this.createComplex((this.real * q + this.imaginary) / denominator, (this.imaginary * q - this.real) / denominator);
                } else {
                    q = d / c;
                    denominator = d * q + c;
                    return this.createComplex((this.imaginary * q + this.real) / denominator, (this.imaginary - this.real * q) / denominator);
                }
            }
        } else {
            return NaN;
        }
    }

    subtract(subtrahend) {
        if(subtrahend == null) {
            throw new Error("complex subtrahend null");
            return;
        }
        return !this.isNan() && !subtrahend.isNan() ? this.createComplex(this.real - subtrahend.getReal(), this.imaginary - subtrahend.getImaginary()) : NaN;
    }

     conjugate() {
        return this.isNan() ? this.createComplex(NaN, NaN) : this.createComplex(this.real, -this.imaginary);
    }


}

export default Complex;
