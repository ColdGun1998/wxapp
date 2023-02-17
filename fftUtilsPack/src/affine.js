class Matrix {
    constructor(values) {
        this.values = Array(values.length).fill(0).map(x => Array(values[0].length).fill(0));
        for (let i = 0; i < values.length; i++) {
            for (let j = 0; j < values[0].length; j++) {
                this.values[i][j] = values[i][j];
            }
        }
        // this.values = values;
    }

    getValue(row_index, col_index) {
        return this.values[row_index][col_index];
    }

    get_value(row_index, col_index) {
        return this.values[row_index][col_index];
    }

    getString() {
        let i = 0;
        let j = 0;
        let s = "[";
        for (i = 0; i < this.values.length; i++) {
            s += "[";
            for (j = 0; j < this.values[i].length; j++) {
                s += this.values[i][j];
                if (j < this.values[i].length - 1) {
                    s += ",";
                }

            }
            s += "]";
            if (i < this.values.length - 1) {
                s += ","
            }
        }
        s += "]";

        return s;
    }

    getColumnNum() {
        return this.values[0].length;
    }


    getRowNum() {
        return this.values.length;
    }


    plus(B) {
        // New = This + B
        let new_values = Array(this.values.length).fill(0).map(x => Array(this.values[0].length).fill(0));
        for (let i = 0; i < this.values.length; i++) {
            for (let j = 0; j < this.values[0].length; j++) {
                new_values[i][j] = this.values[i][j] + B.getValue(i, j);
            }
        }
        return new Matrix(new_values);
    }


    subtract(B) {
        // New = This - B
        let new_values = Array(this.values.length).fill(0).map(x => Array(this.values[0].length).fill(0));

        for (let i = 0; i < this.values.length; i++) {
            for (let j = 0; j < this.values[0].length; j++) {
                new_values[i][j] = this.values[i][j] - B.getValue(i, j);
            }
        }
        return new Matrix(new_values);
    }

    multiply(B) {
        // New = This * B

        let values = Array(this.getRowNum()).fill(0).map(x => Array(B.getColumnNum()).fill(0));
        for (let i = 0; i < values.length; i++) {
            for (let j = 0; j < values[0].length; j++) {
                values[i][j] = 0;
                for (let k = 0; k < this.getColumnNum(); k++) {
                    values[i][j] += this.getValue(i, k) * B.getValue(k, j);
                }
            }
        }
        return new Matrix(values);
    }

    multiply_scalar(value) {
        // New = This * value
        let values = Array(this.getRowNum()).fill(0).map(x => Array(this.getColumnNum()).fill(0));
        for (let i = 0; i < this.getRowNum(); i++) {
            for (let j = 0; j < this.getColumnNum(); j++) {
                values[i][j] = this.getValue(i, j) * value
            }
        }
        return new Matrix(values);
    }

    divide(lambda) {
        // This / lambda
        let values = Array(this.getRowNum()).fill(0).map(x => Array(this.getColumnNum()).fill(0));

        for (let i = 0; i < this.getRowNum(); i++) {
            for (let j = 0; j < this.getColumnNum(); j++) {
                values[i][j] = this.getValue(i, j) / lambda;
            }
        }
        return new Matrix(values);
    }


    getDeterminant() {
        let i = 0;
        let j = 0;
        if (this.getRowNum() === 1) {
            return this.getValue(0, 0);
        }

        let det = 0.0;
        for (i = 0; i < this.getRowNum(); i++) {
            det += this.getValue(i, 0) * this.getCofactor(i, 0);
        }
        return det;
    }


    getMinor(row_index, col_index) {
        let values = Array(this.getRowNum() - 1).fill(0).map(x => Array(this.getColumnNum() - 1).fill(0));

        let v_i = 0;
        for (let i = 0; i < this.getRowNum(); i++) {
            let v_j = 0;
            if (i === row_index) {
                continue;
            }
            for (let j = 0; j < this.getColumnNum(); j++) {
                if (j === col_index) {
                    continue;
                }
                values[v_i][v_j] = this.getValue(i, j);
                v_j++;
            }
            v_i++;
        }
        return new Matrix(values);
    }


    getCofactor(row_index, col_index) {
        let minor_ = this.getMinor(row_index, col_index);
        return Math.pow(-1, row_index + col_index) * minor_.getDeterminant();
    }


    getAdjugate() {
        let values = Array(this.getRowNum()).fill(0).map(x => Array(this.getColumnNum()).fill(0));

        for (let i = 0; i < this.getRowNum(); i++) {
            for (let j = 0; j < this.getColumnNum(); j++) {
                values[i][j] = this.getCofactor(j, i);
            }
        }
        return new Matrix(values);
    }


    get_inverse() {
        return this.getInverse();
    }
    getInverse() {
        let adjugate = this.getAdjugate();
        let det = this.getDeterminant();
        return adjugate.divide(det);
    }


    get_transpose() {
        let values = Array(this.getRowNum()).fill(0).map(x => Array(this.getColumnNum()).fill(0));

        for (let i = 0; i < this.getColumnNum(); i++) {
            for (let j = 0; j < this.getRowNum(); j++) {
                values[i][j] = this.getValue(j, i);
            }
        }
        return new Matrix(values);
    }
}


class Affine {
    constructor() {
        this.a = 0;
        this.b = 0;
        this.c = 0;
        this.d = 0;
        this.e = 0;
        this.f = 0;
    }
    getAffineParams(srcPoints, dstValues) {
        /*
        |x'| |a b c| |x|
        |y'|=|d e f| |y|
        |1 | |0 0 1| |1|
        * */
        // TODO: Set Affine-Matrix
        let n = srcPoints.length;
        let x_square_sum = 0.0;
        let x_y_sum = 0.0;
        let y_square_sum = 0.0;
        let x_sum = 0.0;
        let y_sum = 0.0;
        let x_value_sum = 0;
        let y_value_sum = 0.0;
        let label_value_sum = 0.0;

        for (let i = 0; i < n; i++) {
            let new_value = dstValues[i];
            x_square_sum += srcPoints[i].x * srcPoints[i].x;
            x_y_sum += srcPoints[i].x * srcPoints[i].y;
            y_square_sum += srcPoints[i].y * srcPoints[i].y;
            x_sum += srcPoints[i].x;
            y_sum += srcPoints[i].y;
            x_value_sum += srcPoints[i].x * new_value;
            y_value_sum += srcPoints[i].y * new_value;
            label_value_sum += new_value;
        }
        let am = new Matrix([
            [x_square_sum, x_y_sum, x_sum],
            [x_y_sum, y_square_sum, y_sum],
            [x_sum, y_sum, n]
        ]);

        let at = am.getInverse();

        let result = [];
        for (let i = 0; i < 3; i++) {
            result.push(
                at.getValue(0, i) * x_value_sum +
                at.getValue(1, i) * y_value_sum +
                at.getValue(2, i) * label_value_sum
            );
        }
        return result;
    }

    init(srcPoints, dstPoints) {
        let dstX = []
        for (let i = 0; i < dstPoints.length; i++) {
            dstX.push(dstPoints[i].x);
        }
        let params_0 = this.getAffineParams(srcPoints, dstX);
        this.a = params_0[0];
        this.b = params_0[1];
        this.c = params_0[2];

        let dstY = [];
        for (let i = 0; i < dstPoints.length; i++) {
            dstY.push(dstPoints[i].y);
        }
        let params_1 = this.getAffineParams(srcPoints, dstY);
        this.d = params_1[0];
        this.e = params_1[1];
        this.f = params_1[2];
    }


    affine(srcPoint) {
        return {
            x: this.a * srcPoint.x + this.b * srcPoint.y + this.c,
            y: this.d * srcPoint.x + this.e * srcPoint.y + this.f
        };
    }
}

// module.exports = Affine;
// export default Affine;
