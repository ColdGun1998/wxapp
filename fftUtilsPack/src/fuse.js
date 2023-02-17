function array_pop(array, index) {
    let result = [];
    for (let i = 0; i < array.length; i++) {
        if (i !== index) {
            result.push(array[i]);
        }
    }
    return result;
}

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


class Fuse {
    constructor(offset) {
        this.pdr_result = [];
        this.acloc_result = [];
    }

    exkalmandme(aclocTrack,
        stepsList,
        alpha,
        conf_scale = 100,
        startPosition = {
            timestamp: 0,
            x: 0,
            y: 0
        },
        maxDrift = 3,
    ) {
        let track = [];
        let stepsIndex = 0;
        let aclocIndex = 0;

        let position = {
            timestamp: startPosition.timestamp,
            x: startPosition.x,
            y: startPosition.y,
        };

        let trans = [
            [Math.cos(-alpha * Math.PI / 180), -Math.sin(-alpha * Math.PI / 180)],
            [Math.sin(-alpha * Math.PI / 180), Math.cos(-alpha * Math.PI / 180)]
        ];


        if (stepsIndex >= stepsList.length && aclocIndex >= aclocTrack.length) {
            return track;
        }
        while (aclocIndex < aclocTrack.length &&
            (stepsIndex >= stepsList.length ||
                aclocTrack[aclocIndex].timestamp < stepsList[stepsIndex].timestamp - 1000)
        ) {
            position = {
                timestamp: aclocTrack[aclocIndex].timestamp,
                x: aclocTrack[aclocIndex].x,
                y: aclocTrack[aclocIndex].y,
            };
            track.push({
                timestamp: position.timestamp,
                x: position.x,
                y: position.y,
            });
            aclocIndex += 1;
        }

        while (stepsIndex < stepsList.length &&
            (aclocIndex >= aclocTrack.length ||
                stepsList[stepsIndex].timestamp < aclocTrack[aclocIndex].timestamp - 1000)
        ) {
            let delta_y = stepsList[stepsIndex].step_length * Math.cos(stepsList[stepsIndex].angle_cos * Math.PI / 180);
            let delta_x = stepsList[stepsIndex].step_length * Math.sin(stepsList[stepsIndex].angle_sin * Math.PI / 180);

            let dx = delta_x * trans[0][0] + delta_y * trans[1][0];
            let dy = delta_x * trans[0][1] + delta_y * trans[1][1];

            position.timestamp = stepsList[stepsIndex].timestamp;
            position.x += dx;
            position.y += dy;

            track.push({
                timestamp: position.timestamp,
                "x": position.x,
                "y": position.y,
            });
            stepsIndex += 1;
        }


        for (let i = aclocIndex; i < aclocTrack.length; i++) {
            aclocTrack[i].conf = Math.min(aclocTrack[i].conf / conf_scale, 1.0);
        }

        let P = new Matrix([
            [0, 0],
            [0, 0]
        ]);

        let K = new Matrix([
            [0, 0],
            [0, 0]
        ]);

        let H = new Matrix([
            [0, 0],
            [0, 0]
        ]);

        let Q = new Matrix([
            [0.001, 0.001],
            [0.001, 0.001]
        ]);

        let R = new Matrix([
            [0.5, 0],
            [0, 1]
        ]);

        let x = new Matrix([
            [position.x],
            [position.y]
        ]);
        trans = new Matrix(trans);
        console.log(x);
        for (; stepsIndex < stepsList.length; stepsIndex++) {
            if (aclocIndex >= aclocTrack.length) {
                break;
            }
            let yaw = new Matrix([
                [Math.sin(stepsList[stepsIndex].angle_sin * Math.PI / 180)],
                [Math.cos(stepsList[stepsIndex].angle_cos * Math.PI / 180)],
            ]);

            let delta_x = yaw.multiply(trans).multiply_scalar(stepsList[stepsIndex].step_length);
            x = x.plus(delta_x);

            P = P.plus(Q);
            if (
                stepsIndex + 1 < stepsList.length &&
                stepsList[stepsIndex].timestamp < aclocTrack[aclocIndex].timestamp + 500 &&
                stepsList[stepsIndex + 1].timestamp > aclocTrack[aclocIndex].timestamp
            ) {
                if (stepsList[stepsIndex + 1].timestamp - stepsList[stepsIndex].timestamp <= 900) {
                    if (Math.sqrt(
                            Math.pow(x.get_value(0, 0) - aclocTrack[aclocIndex].x) +
                            Math.pow(x.get_value(1, 0) - aclocTrack[aclocIndex].x)
                        ) >= maxDrift) {
                        position = {
                            timestamp: stepsList[stepsIndex].timestamp,
                            x: x.get_value(0, 0),
                            y: x.get_value(1, 0)
                        };
                        console.log("position:" + JSON.stringify(position))
                        track.push({
                            timestamp: position.timestamp,
                            x: position.x,
                            y: position.y,
                        });
                        aclocIndex += 1;
                        continue;
                    }
                    let x0 = x.multiply_scalar(aclocTrack[aclocIndex].conf);
                    let x1 = new Matrix([
                        [aclocTrack[aclocIndex].x],
                        [aclocTrack[aclocIndex].y]
                    ]).multiply_scalar(1 - aclocTrack[aclocIndex].conf);
                    let z = x0.plus(x1);
                    H = new Matrix([
                        [aclocTrack[aclocIndex].conf, 0],
                        [0, aclocTrack[aclocIndex].conf]
                    ]);

                    K = P.multiply(H.get_transpose()).multiply(
                        H.multiply(P).multiply(H.get_transpose()).plus(R).get_inverse()
                    );

                    x = x0.plus(x1).plus(
                        K.multiply(z.subtract(x))
                    )

                    let eye = new Matrix([
                        [1, 0],
                        [0, 1]
                    ]);
                    P = eye.subtract(K.multiply(H)).multiply(P).multiply((eye.subtract(K.multiply(H)).get_transpose())).plus(K.multiply(R).multiply(K.get_transpose()));
                    position = {
                        timestamp: aclocTrack[aclocIndex].timestamp,
                        x: x.get_value(0, 0),
                        y: x.get_value(1, 0)
                    };
                    track.push({
                        timestamp: position.timestamp,
                        x: position.x,
                        y: position.y,
                    });
                    aclocIndex += 1;
                } else if (stepsList[stepsIndex + 1].timestamp - stepsList[stepsIndex].timestamp > 900) {
                    x = new Matrix([
                        [aclocTrack[aclocIndex].x],
                        [aclocTrack[aclocIndex].y]
                    ]);
                    position = {
                        timestamp: aclocTrack[aclocIndex].timestamp,
                        x: x.get_value(0, 0),
                        y: x.get_value(1, 0)
                    };
                    track.push({
                        timestamp: position.timestamp,
                        x: position.x,
                        y: position.y,
                    });
                    aclocIndex += 1;
                } else {
                    position = {
                        timestamp: stepsList[stepsIndex].timestamp,
                        x: x.get_value(0, 0),
                        y: x.get_value(1, 0)
                    };
                    track.push({
                        timestamp: position.timestamp,
                        x: position.x,
                        y: position.y,
                    });
                }
            } else {
                position = {
                    timestamp: stepsList[stepsIndex].timestamp,
                    x: x.get_value(0, 0),
                    y: x.get_value(1, 0),
                }
                track.push({
                    timestamp: position.timestamp,
                    x: position.x,
                    y: position.y,
                });
            }
        }
        return track;
    }

    weightedMean(
        aclocTrack,
        stepsList,
        alpha,
        conf_scale = 100,
        startPosition = {
            timestamp: 0,
            x: 0,
            y: 0
        },
    ) {
        let aclocWeight = 0.8;
        let pdrWeight = 0.2;
        let track = [];
        let stepsIndex = 0;
        let aclocIndex = 0;

        let position = {
            timestamp: startPosition.timestamp,
            x: startPosition.x,
            y: startPosition.y,
        };

        let trans = [
            [Math.cos(-alpha * Math.PI / 180), -Math.sin(-alpha * Math.PI / 180)],
            [Math.sin(-alpha * Math.PI / 180), Math.cos(-alpha * Math.PI / 180)]
        ];


        if (stepsIndex >= stepsList.length && aclocIndex >= aclocTrack.length) {
            return track;
        }
        while (aclocIndex < aclocTrack.length &&
            (stepsIndex >= stepsList.length ||
                aclocTrack[aclocIndex].timestamp < stepsList[stepsIndex].timestamp - 1000)
        ) {
            position = {
                timestamp: aclocTrack[aclocIndex].timestamp,
                x: aclocTrack[aclocIndex].x,
                y: aclocTrack[aclocIndex].y,
            };
            track.push({
                timestamp: position.timestamp,
                x: position.x,
                y: position.y,
            });
            aclocIndex += 1;
        }

        while (stepsIndex < stepsList.length &&
            (aclocIndex >= aclocTrack.length ||
                stepsList[stepsIndex].timestamp < aclocTrack[aclocIndex].timestamp - 1000)
        ) {
            let delta_y = stepsList[stepsIndex].step_length * Math.cos(stepsList[stepsIndex].angle_cos * Math.PI / 180);
            let delta_x = stepsList[stepsIndex].step_length * Math.sin(stepsList[stepsIndex].angle_sin * Math.PI / 180);

            let dx = delta_x * trans[0][0] + delta_y * trans[1][0];
            let dy = delta_x * trans[0][1] + delta_y * trans[1][1];

            position.timestamp = stepsList[stepsIndex].timestamp;
            position.x += dx;
            position.y += dy;

            track.push({
                timestamp: position.timestamp,
                "x": position.x,
                "y": position.y,
            });
            stepsIndex += 1;
        }


        for (let i = aclocIndex; i < aclocTrack.length; i++) {
            aclocTrack[i].conf = Math.min(aclocTrack[i].conf / conf_scale, 1.0);
        }


        let x = new Matrix([
            [position.x],
            [position.y]
        ]);
        trans = new Matrix(trans);
        for (; stepsIndex < stepsList.length; stepsIndex++) {
            if (aclocIndex >= aclocTrack.length) {
                break;
            }
            let yaw = new Matrix([
                [Math.sin(stepsList[stepsIndex].angle_sin * Math.PI / 180)],
                [Math.cos(stepsList[stepsIndex].angle_cos * Math.PI / 180)],
            ]);

            let delta_x = yaw.multiply(trans).multiply_scalar(stepsList[stepsIndex].step_length);
            x = x.plus(delta_x);

            if (
                stepsIndex + 1 < stepsList.length &&
                stepsList[stepsIndex].timestamp < aclocTrack[aclocIndex].timestamp + 500 &&
                stepsList[stepsIndex + 1].timestamp > aclocTrack[aclocIndex].timestamp
            ) {
                if (stepsList[stepsIndex + 1].timestamp - stepsList[stepsIndex].timestamp <= 900) {
                    let x0 = x.multiply_scalar(pdrWeight);
                    let x1 = new Matrix([
                        [aclocTrack[aclocIndex].x],
                        [aclocTrack[aclocIndex].y]
                    ]).multiply_scalar(aclocWeight);
                    let z = x0.plus(x1);
                    H = new Matrix([
                        [aclocTrack[aclocIndex].conf, 0],
                        [0, aclocTrack[aclocIndex].conf]
                    ]);
                    x = x0.plus(x1);
                    position = {
                        timestamp: aclocTrack[aclocIndex].timestamp,
                        x: x.get_value(0, 0),
                        y: x.get_value(1, 0)
                    };
                    track.push({
                        timestamp: position.timestamp,
                        x: position.x,
                        y: position.y,
                    });
                    aclocIndex += 1;
                } else if (stepsList[stepsIndex + 1].timestamp - stepsList[stepsIndex].timestamp > 900) {
                    x = new Matrix([
                        [aclocTrack[aclocIndex].x],
                        [aclocTrack[aclocIndex].y]
                    ]);
                    position = {
                        timestamp: aclocTrack[aclocIndex].timestamp,
                        x: x.get_value(0, 0),
                        y: x.get_value(1, 0)
                    };
                    track.push({
                        timestamp: position.timestamp,
                        x: position.x,
                        y: position.y,
                    });
                    aclocIndex += 1;
                } else {
                    position = {
                        timestamp: stepsList[stepsIndex].timestamp,
                        x: x.get_value(0, 0),
                        y: x.get_value(1, 0)
                    };
                    track.push({
                        timestamp: position.timestamp,
                        x: position.x,
                        y: position.y,
                    });
                }
            } else {
                position = {
                    timestamp: stepsList[stepsIndex].timestamp,
                    x: x.get_value(0, 0),
                    y: x.get_value(1, 0),
                }
                track.push({
                    timestamp: position.timestamp,
                    x: position.x,
                    y: position.y,
                });
            }
        }
        return track;
    }
    makeKalmanFilter() {
        return new KalmanFilter();
    }
}

class KalmanFilter {
    constructor(offset) {
        this.latest_point = null;
        this.A = new Matrix([
            [1.0, 0.0],
            [0.0, 1.0]
        ]);
        this.H = new Matrix(
            [
                [1.0, 0.0],
                [0.0, 1.0]
            ]
        );
        this.Q = new Matrix(
            [
                [0.1, 0.0],
                [0.0, 0.1]
            ]
        );
        this.R = new Matrix(
            [
                [1.0, 0.0],
                [0.0, 1.0]
            ]
        );

        this.P = new Matrix(
            [
                [1.0, 0.0],
                [0.0, 1.0]
            ]
        );

    }

    next(x_new, y_new) {
        if (this.latest_point == null) {
            this.latest_point = new Matrix(
                [
                    [x_new],
                    [y_new]
                ]
            );
        }

        console.log(this.latest_point)

        let z = new Matrix(
            [
                [x_new],
                [y_new]
            ]
        );

        console.log(z)
            //预测
        let point_phat = this.A.multiply(this.latest_point) // 先验估计值
        let P = this.A.multiply(this.P).multiply(this.A.get_transpose()).plus(this.Q); // 先验误差协方差

        // 校正
        let k = P.multiply(this.H.get_transpose()).multiply(this.H.multiply(P).multiply(this.H.get_transpose()).plus(this.R).get_inverse());
        this.latest_point = point_phat.plus(k.multiply(z.subtract(this.H.multiply(point_phat))));
        let e = new Matrix([
            [1, 0],
            [0, 1]
        ]);
        this.P = e.subtract(k.multiply(this.H)).multiply(P);

        return { x: this.latest_point.get_value(0, 0), y: this.latest_point.get_value(1, 0) }
    }
}

export default new Fuse();