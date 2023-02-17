class PDR {
    constructor() {
        this.position = {}
        this.position.x = 0;
        this.position.y = 0;
        // this.debug = function() { return this.value }

        this.orientation_list = [];
        this.acceleration_list = [];
    }

    debugLog(message) {
        if (false) {
            console.log(message);
        }
    }

    move(x, y) {
        this.position.x += x;
        this.position.y += y;
    }

    next(orientation, acceleration) {
        if (this.orientation_list.length == 0 ||
            orientation.t > this.orientation_list[this.orientation_list.length - 1].t) {
            this.orientation_list.push({
                "x": orientation.alpha,
                "y": orientation.beta,
                "z": orientation.gamma,
                "t": orientation.t
            });
        }

        if (this.acceleration_list.length == 0 ||
            acceleration.t > this.acceleration_list[this.acceleration_list.length - 1].t) {
            this.acceleration_list.push({
                "x": acceleration.x * 9.8,
                "y": acceleration.y * 9.8,
                "z": acceleration.z * 9.8,
                "t": acceleration.t
            });
        }

        // TODO: remove the history
        var track = get_position(this.orientation_list, this.acceleration_list, 0.5, this.orientation_list[0].x);
        // if (this.orientation_list.length == 100) {
        //     let position = track.position[track.position.length - 1];
        //     this.next_start_position = { x: position.x, y: position.y };
        // }
        // if (this.orientation_list.length == 200) {
        //     let position = track.position[track.position.length - 1];
        //     this.start_position = { x: this.next_start_position.x, y: this.next_start_position.y };
        //     this.next_start_position = { x: position.x, y: position.y };
        //     this.orientation_list.splice(0, 100);
        //     this.acceleration_list.splice(0, 100);
        // }
        return track;
    }

    getSteps(imuDataList, char_value = 0.5, gravitational = 9.8, minPeakValue = 0.7) {
        // IMU: Inertial Measurement Unit
        this.debugLog("start getSteps with imuData-length=" + imuDataList.length);
        let yaw_for_sin = [];
        let yaw_for_cos = [];
        for (let i = 0; i < imuDataList.length; i++) {
            let yaw = imuDataList[i].alpha;

            // limit yaw to [-180, 180)
            while (yaw >= 180) {
                yaw -= 360;
            }
            while (yaw < -180) {
                yaw += 360;
            }

            if (0 <= yaw && yaw < 90) {
                yaw_for_sin.push(yaw);
                yaw_for_cos.push(yaw);
            } else if (90 <= yaw && yaw < 180) {
                yaw_for_sin.push(180 - yaw);
                yaw_for_cos.push(yaw);
            } else if (-180 <= yaw && yaw < -90) {
                yaw_for_sin.push(-180 - yaw);
                yaw_for_cos.push(-yaw);
            } else if (-90 <= yaw && yaw < 0) {
                yaw_for_sin.push(yaw);
                yaw_for_cos.push(-yaw);
            } else {
                console.log("-180<=yaw<180 is required, got " + yaw);
            }
        }

        let acc = [];
        for (let i = 0; i < imuDataList.length; i++) {
            let accel = imuDataList[i];
            acc.push(Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z) * gravitational - gravitational);
        }

        let bandpass = mean_filtering(acc);

        let peaks = find_peaks(bandpass, 0.0, minPeakValue);

        let steps = [];
        for (let k = 0; k < peaks.length - 1; k++) {
            let pos_start = peaks[k].index;
            let pos_end = peaks[k + 1].index;

            let delta_max_min = Math.max(...bandpass.slice(pos_start, pos_end)) - Math.min(...bandpass.slice(pos_start, pos_end));

            steps.push({
                timestamp: imuDataList[pos_start].timestamp,
                angle_sin: mean(yaw_for_sin.slice(pos_start, pos_end)),
                angle_cos: mean(yaw_for_cos.slice(pos_start, pos_end)),
                step_length: char_value * Math.pow(delta_max_min, 0.25),
            });
        }
        return steps;
    }

    getTrack(
        stepsList,
        start_position = { timestamp: 0, x: 0, y: 0 },
        alpha = 0,
    ) {
        this.debugLog("start getTrack with stepsList-length=" + stepsList.length + ", alpha=" + alpha);
        let trans = [
            [Math.cos(-alpha * Math.PI / 180), -Math.sin(-alpha * Math.PI / 180)],
            [Math.sin(-alpha * Math.PI / 180), Math.cos(-alpha * Math.PI / 180)]
        ];
        let x = start_position.x;
        let y = start_position.y;
        let position = [start_position];
        for (let i = 0; i < stepsList.length; i++) {
            if (stepsList[i].timestamp <= start_position.timestamp) {
                continue;
            }
            let delta_y = stepsList[i].step_length * Math.cos(stepsList[i].angle_cos * Math.PI / 180);
            let delta_x = stepsList[i].step_length * Math.sin(stepsList[i].angle_sin * Math.PI / 180);

            let dx = delta_x * trans[0][0] + delta_y * trans[1][0];
            let dy = delta_x * trans[0][1] + delta_y * trans[1][1];

            x += dx;
            y += dy;

            position.push({
                timestamp: stepsList[i].timestamp,
                x: x,
                y: y
            });
        }
        return position;
    }

    getTrack1D(
        stepsList,
        start_position = {
            timestamp: 0,
            x: 0,
            y: 0
        },
        alpha = 0,
    ) {
        let x = start_position.x;
        let y = start_position.y;
        let position = [start_position];
        for (let i = 0; i < stepsList.length; i++) {
            if (stepsList[i].timestamp <= start_position.timestamp) {
                continue;
            }
            // let angle_cos = stepsList[i].angle_cos;
            let angle_sin = stepsList[i].angle_sin;

            // angle_cos = (angle_cos - alpha + 360) % 360;
            angle_sin = (angle_sin - alpha + 360*2) % 360;

            // if (angle_cos > 0 && angle_cos <= 180) {
            //     angle_cos = 90;
            // } else {
            //     angle_cos = 270;
            // }
            if (angle_sin > 0 && angle_sin <= 180) {
                angle_sin = 90;
            } else {
                angle_sin = 270
            }

            // let delta_y = stepsList[i].step_length * Math.cos(angle_cos * Math.PI / 180);
            let delta_x = stepsList[i].step_length * Math.sin(angle_sin * Math.PI / 180);

            // let dx = delta_x * trans[0][0] + delta_y * trans[1][0];
            // let dy = delta_x * trans[0][1] + delta_y * trans[1][1];

            x += delta_x;
            // y += dy;

            position.push({
                timestamp: stepsList[i].timestamp,
                x: x,
                y: y
            });
        }
        return position;
    }
    isStatic(imuDataList, check_length = 30, threshold = 0.1) {
        if (imuDataList.length == 0) {
            return false;
        }
        let acc = [];
        for (let i = Math.max(0, imuDataList.length - check_length); i < imuDataList.length; i++) {
            let accel = imuDataList[i];
            acc.push(
                Math.abs(
                    Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z) - 1
                )
            );
        }

        if (Math.max(...acc) < threshold) {
            return true;
        } else {
            return false
        }
    }
}

function find_peaks(data, distance = 0.0, height = 0.0) {
    let peaks = [];
    for (let i = 1; i < data.length - 1; i++) {
        if (data[i] > data[i - 1] && data[i] > data[i + 1] && data[i] >= height) {
            peaks.push({
                index: i,
                value: data[i],
            });
        }
    }
    return peaks;
}

function mean_filtering(data, step = 5) {
    let data_sum = 0.0;
    let count = 0;
    let result = [];
    for (let i = 0; i < data.length; i++) {
        let v = data[i];
        data_sum += v;
        count += 1;
        if (count > step) {
            data_sum -= data[i - step]
            count -= 1
        }

        result.push(data_sum / count)
    }
    return result;
}

function mean(data) {
    if (data.length === 0) {
        return 0.0;
    }
    let data_sum = 0.0;
    for (let i = 0; i < data.length; i++) {
        data_sum += data[i];
    }
    return data_sum / data.length;
}

function degree_mean(data) {
    let base_value = data[0];
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += (data[i] - base_value + 360 + 180) % 360 - 180;
    }
    return sum / data.length + base_value
}

export default new PDR();