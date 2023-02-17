class DirectFormI {
    m_x2 = 0.0;
    m_y2 = 0.0;
    m_x1 = 0.0;
    m_y1 = 0.0;

    constructor() {
        this.reset();
    }

    reset() {
        this.m_x1 = 0.0;
        this.m_x2 = 0.0;
        this.m_y1 = 0.0;
        this.m_y2 = 0.0;
    }

    process1(input, s) {
        let out = s.m_b0 * input + s.m_b1 * this.m_x1 + s.m_b2 * this.m_x2 - s.m_a1 * this.m_y1 - s.m_a2 * this.m_y2;
        this.m_x2 = this.m_x1;
        this.m_y2 = this.m_y1;
        this.m_x1 = input;
        this.m_y1 = out;
        return out;
    }
}

export default DirectFormI;
