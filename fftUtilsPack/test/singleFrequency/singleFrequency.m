%% single frequency
clc
clear,close all;
%% ����chirp�ź� Signal
freqStart = 19e3; freqEnd = 21.5e3;
f1 = 19.4e3;f2 = 19.7e3; f3 = 20e3; f4 = 20.3e3; f5 = 20.6e3;
fCom = [f2 f3 f4 f5];
fs = 48e3; %��������

signal = audioread("chirp2123197.wav");
plot(signal)
segNum = length(signal)/8192;
frequencyDetection = ones(1,4);
for i = 1:1:segNum
    data0 = signal((i-1)*8192+1:i*8192);
    y0 = abs(fft(data0)); %���ٸ���Ҷ�任�ķ�ֵ


    %��������ת������ʾΪƵ��f= n*(fs/N)
    f = (0:length(y0)-1)*fs/length(y0);
    [a,b0] = max(y0);
%     if
%         (b0-1)*2
%     end

    frequency1 = f(b0);
    if(frequency1<freqEnd&&frequency1>freqStart)
    frequencyDetection(i) = frequency1;
    else
    frequencyDetection(i) = 0;
    end
end
frequencyFinal = mean(frequencyDetection(frequencyDetection~=0));
[a b] = min(abs(frequencyFinal*ones(1,4)-fCom));
fCom(b)