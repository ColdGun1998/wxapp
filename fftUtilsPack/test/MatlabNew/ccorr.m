function [cr] = ccorr(sigSeg,sig_refer)
%互相关函数：频域直接互相关，
%将其切换到分数傅里叶域进行互相关计算,主要问题在于 1，求a的角度
% 2. 将frft逆变换到时域 
%最终实现时频域中的互相关计算
sigFFT = fft(sigSeg);
sigReferFFT = fft(sig_refer);
% plot(real(sigReferFFT));
% pause;
cr = ifft(sigFFT.*conj(sigReferFFT));
cr = abs(real(cr));