function [cr] = ccorr(sigSeg,sig_refer)
%����غ�����Ƶ��ֱ�ӻ���أ�
%�����л�����������Ҷ����л���ؼ���,��Ҫ�������� 1����a�ĽǶ�
% 2. ��frft��任��ʱ�� 
%����ʵ��ʱƵ���еĻ���ؼ���
sigFFT = fft(sigSeg);
sigReferFFT = fft(sig_refer);
% plot(real(sigReferFFT));
% pause;
cr = ifft(sigFFT.*conj(sigReferFFT));
cr = abs(real(cr));