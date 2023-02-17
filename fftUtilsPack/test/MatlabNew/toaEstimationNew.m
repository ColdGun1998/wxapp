% sig_tem,L,f0,f1,vMaxTh,maxRatioTh
% sig_tem���ź�����
% vMaxTh��������������ź�����Ϊ0������100
% maxRatioTh��������������ͬ��һ��ֻҪ����һ���ͺ�
function [TOASequence] = toaEstimationNew(sig_tem,L,f0,f1,vMaxTh,maxRatioTh)
%UNTITLED4 �˴���ʾ�йش˺�����ժҪ
%   ��������жϻ��ƣ�����׼ȷ�洢����������洢
fs = 48000; %����Ƶ��Hz

% L = 2400;
N = L*2;       %ÿ֡����2048��
signalLength = L/fs;%�źų���s  0.05s
soundSpeed = 340;%����m/s
% inteval = 4800/48000;%���ڻ�վ�������s
rate = (f1-f0)./(signalLength)./2;
ti = 0:1/fs:signalLength-1/fs;
sig_refer = cos(2*pi.*(f0 + rate .* ti).*ti); %�����ྶ�ź�
sig_refer(N) = 0;
% sig_tem = (sig_tem*32768)';%16λ����
 sig_tem = sig_tem';%16λ����
 %ģ��

segNum = fix(length(sig_tem)/N);    %�ɲ�ֵ�֡��

crall = [];

timeStamp = 0;
timeStampOld = 0;

vNew = zeros(1,N);               % k-1ʱ������֡
vOld = zeros(1,N);                 % kʱ������֡
vTemp = zeros(1,N);              % ���ݻ���
signalMaxOld=0;
signalMaxNew=0;
signalMax = 0;
cr1 = [];
cr2 = [];
TOA = 0;                               %����Toֵ
bufferQueue = zeros(1,2*N);
vMaxQueue = zeros(1,4);
pMaxQueue = zeros(1,4);
QP = 1;%queue pointer
vRatioTh  = 0.3;%�ж�ʵ�ʵ�����ֵ���ֵ�ı�ֵ���ྶЧӦԽ�������ֵӦȡ��Խ��Ĭ��ֵ0.3��һ�㲻�޸�
pMaxTh = 2000;%����߷�ǰ����ʵ�ʵ����ĳ��ȣ�Ĭ��ֵ1000��ӦС��2048
vSum = 0;

%����TDOA
oldDistance = 0;
nowDistance = 0;
TOASequence = ones(3,5);
QPSequence = ones(1,5);
count = 1;
countQP = 1;
for i = 1:segNum

    st = (i-1)*N+1;% ����֡��ʼ��
    vNew = sig_tem(st:st+N-1);
    %���㱾֡����һ֡�������źŵ����ֵ���ۼ�ֵ
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
        %����֡����غ��������ֵ����vMaxTh�����Ҵ���ǰһ֡�ͺ�һ֡������Ϊ�����źŵ���
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