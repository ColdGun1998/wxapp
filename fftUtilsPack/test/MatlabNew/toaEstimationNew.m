% sig_tem,L,f0,f1,vMaxTh,maxRatioTh
% sig_tem：信号序列
% vMaxTh：近距离高质量信号设置为0，上限100
% maxRatioTh：作用与上述相同，一般只要调整一个就好
function [TOASequence] = toaEstimationNew(sig_tem,L,f0,f1,vMaxTh,maxRatioTh)
%UNTITLED4 此处显示有关此函数的摘要
%   引入误差判断机制；连续准确存储，连续错误存储
fs = 48000; %采样频率Hz

% L = 2400;
N = L*2;       %每帧数据2048长
signalLength = L/fs;%信号长度s  0.05s
soundSpeed = 340;%声速m/s
% inteval = 4800/48000;%相邻基站发声间隔s
rate = (f1-f0)./(signalLength)./2;
ti = 0:1/fs:signalLength-1/fs;
sig_refer = cos(2*pi.*(f0 + rate .* ti).*ti); %调整多径信号
sig_refer(N) = 0;
% sig_tem = (sig_tem*32768)';%16位编码
 sig_tem = sig_tem';%16位编码
 %模拟

segNum = fix(length(sig_tem)/N);    %可拆分的帧数

crall = [];

timeStamp = 0;
timeStampOld = 0;

vNew = zeros(1,N);               % k-1时刻数据帧
vOld = zeros(1,N);                 % k时刻数据帧
vTemp = zeros(1,N);              % 数据缓存
signalMaxOld=0;
signalMaxNew=0;
signalMax = 0;
cr1 = [];
cr2 = [];
TOA = 0;                               %最终To值
bufferQueue = zeros(1,2*N);
vMaxQueue = zeros(1,4);
pMaxQueue = zeros(1,4);
QP = 1;%queue pointer
vRatioTh  = 0.3;%判断实际到达点的值与峰值的比值，多径效应越明显则该值应取的越大，默认值0.3，一般不修改
pMaxTh = 2000;%在最高峰前搜索实际到达点的长度，默认值1000，应小于2048
vSum = 0;

%计算TDOA
oldDistance = 0;
nowDistance = 0;
TOASequence = ones(3,5);
QPSequence = ones(1,5);
count = 1;
countQP = 1;
for i = 1:segNum

    st = (i-1)*N+1;% 数据帧起始点
    vNew = sig_tem(st:st+N-1);
    %计算本帧和上一帧的声音信号的最大值和累加值
    signalMaxNew = max(vNew);
    if signalMaxNew>signalMaxOld
        signalMax = signalMaxNew;
    else
        signalMax = signalMaxOld;
    end
    signalMaxOld = signalMaxNew;

%         disp(['signalMax = ' num2str(signalMax)]);

    vTemp = [vOld(L+1:N) vNew(1:L)];
    cr1_ = ccorr(vTemp,sig_refer);
    cr2_ = ccorr(vNew,sig_refer);
    cr1 = cr1_(1:L); 
    cr2 = cr2_(1:L);

    [vMax,pMax] = max(cr1);
    vMaxQueue(QP) = vMax;
    pMaxQueue(QP) = pMax;
    bufferQueue(((QP-1)*L+1):((QP-1)*L+L)) = cr1;

    QP = QP + 1;
    [vMax,pMax] = max(cr2);
    vMaxQueue(QP) = vMax;
    pMaxQueue(QP) = pMax;
    bufferQueue(((QP-1)*L+1):((QP-1)*L+L)) = cr2;

    for tmp = 1:2
         QP = mod(QP-1-1,4) +1;
        %若该帧互相关函数的最大值大于vMaxTh，并且大于前一帧和后一帧，则认为该有信号到达
        pMax = pMaxQueue(QP);
        vMax = vMaxQueue(QP);
        if(vMax > vMaxTh &&vMax/signalMax>maxRatioTh&&vMax>vMaxQueue(mod(QP+1-1,4)+1) && vMax > vMaxQueue(mod(QP-1 -1,4)+1))
            for j = pMaxTh:-1:0
                vNow = bufferQueue(mod((QP-1)*L+1+pMax - j -1,N*2)+1);
                vLast = bufferQueue(mod((QP-1)*L+1+pMax - j -1  -1,N*2)+1);
                vNext = bufferQueue(mod((QP-1)*L+1+pMax - j +1  -1,N*2)+1);
                if(vNow > vMax * vRatioTh && vNow > vLast && vNow > vNext)
                    TOA = pMax - j -L*(tmp-1);
%                     disp(['TOA= ' num2str(TOA) ' stampNumber= ' num2str(i-1)]);
                    nowDistance =  (TOA+i*N)/fs * soundSpeed;
                    TOASequence(1,count) = TOA;
                    TOASequence(2,count) = i-1;
                    TOASequence(3,count) = nowDistance;
                    count = count+1;
                end
            end
        end
    end
    QP = mod(QP+3-1,4) +1;
    
    vOld = vNew;
end
end