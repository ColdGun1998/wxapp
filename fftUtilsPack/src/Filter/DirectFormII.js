
class DirectFormII {
    m_v1;
    m_v2;

    constructor() {
        this.reset();
    }

    reset() {
        this.m_v1 = 0.0;
        this.m_v2 = 0.0;
    }

    process1(input, s) {
        if (s != null) {
            let w = input - s.m_a1 * this.m_v1 - s.m_a2 * this.m_v2;
            let out = s.m_b0 * w + s.m_b1 * this.m_v1 + s.m_b2 * this.m_v2;
            this.m_v2 = this.m_v1;
            this.m_v1 = w;
            return out;
        } else {
            return input;
        }
    }
}

export default DirectFormII;
